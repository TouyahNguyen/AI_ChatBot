"""
FastAPI Backend - Chatbot AI
Tích hợp Google Gemini 2.5 Flash + PostgreSQL
"""
import os
import uuid
import tempfile
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import google.generativeai as genai

from database import get_db, init_db
from models import Session, Message
from schemas import SessionCreate, SessionResponse, MessageResponse, ChatResponse

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


# ========== Lifespan ==========

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Khởi tạo DB khi app start."""
    await init_db()
    yield


# ========== FastAPI App ==========

app = FastAPI(
    title="Chatbot AI API",
    description="API cho ứng dụng Chatbot AI tích hợp Gemini 1.5 Flash",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========== Session Routes ==========

@app.get("/sessions/", response_model=list[SessionResponse])
async def get_sessions(db: AsyncSession = Depends(get_db)):
    """Lấy danh sách tất cả phiên chat, sắp xếp mới nhất trước."""
    result = await db.execute(
        select(Session).order_by(Session.created_at.desc())
    )
    sessions = result.scalars().all()
    return sessions


@app.post("/sessions/", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Tạo phiên chat mới."""
    new_session = Session(title=session_data.title)
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session


@app.delete("/sessions/{session_id}")
async def delete_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Xóa phiên chat (cascade xóa messages)."""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)
    await db.commit()
    return {"message": "Session deleted successfully"}


@app.put("/sessions/{session_id}", response_model=SessionResponse)
async def update_session_title(
    session_id: uuid.UUID,
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật tiêu đề phiên chat."""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.title = session_data.title
    await db.commit()
    await db.refresh(session)
    return session


# ========== Message Routes ==========

@app.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Lấy tất cả tin nhắn của một phiên chat."""
    # Kiểm tra session tồn tại
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Lấy messages
    result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    return messages


# ========== Chat Route (Gemini Integration) ==========

@app.post("/chat/", response_model=ChatResponse)
async def chat(
    message: str = Form(...),
    session_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Gửi tin nhắn tới Gemini 2.5 Flash.
    - Nhận message (text) + file (optional) + session_id (optional)
    - Nếu không có session_id → tạo session mới
    - Upload file lên Gemini nếu có
    - Lưu câu hỏi + phản hồi vào DB
    - Dọn dẹp file tạm + file trên Gemini
    """
    gemini_file = None
    temp_path = None

    try:
        # 1. Tạo hoặc lấy session
        if session_id and session_id != "null":
            sid = uuid.UUID(session_id)
            result = await db.execute(select(Session).where(Session.id == sid))
            session = result.scalar_one_or_none()
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
        else:
            # Tạo session mới, lấy title từ message (tối đa 50 ký tự)
            title = message[:50] + "..." if len(message) > 50 else message
            session = Session(title=title)
            db.add(session)
            await db.commit()
            await db.refresh(session)

        # 2. Xử lý file upload (nếu có)
        if file:
            # Lưu file tạm xuống server
            suffix = os.path.splitext(file.filename)[1] if file.filename else ""
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                content = await file.read()
                tmp.write(content)
                temp_path = tmp.name

            # Upload lên Gemini
            gemini_file = genai.upload_file(path=temp_path, display_name=file.filename)

        # 3. Gọi Gemini API
        prompt_parts = []
        if gemini_file:
            prompt_parts.append(gemini_file)
        prompt_parts.append(message)

        response = model.generate_content(prompt_parts)
        bot_reply = response.text

        # 4. Lưu messages vào DB
        user_msg = Message(
            session_id=session.id,
            role="user",
            content=message,
        )
        bot_msg = Message(
            session_id=session.id,
            role="assistant",
            content=bot_reply,
        )
        db.add(user_msg)
        db.add(bot_msg)
        await db.commit()
        await db.refresh(user_msg)
        await db.refresh(bot_msg)

        return ChatResponse(
            user_message=MessageResponse.model_validate(user_msg),
            bot_message=MessageResponse.model_validate(bot_msg),
            session_id=session.id,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

    finally:
        # 5. Dọn dẹp bộ nhớ
        # Xóa file tạm trên server
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except OSError:
                pass

        # Xóa file trên Google Gemini
        if gemini_file:
            try:
                genai.delete_file(gemini_file.name)
            except Exception:
                pass


# ========== Health Check ==========

@app.get("/health")
async def health_check():
    return {"status": "ok", "model": "gemini-2.5-flash"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
