"""
Pydantic Schemas - Request/Response validation
"""
import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


# ========== Session Schemas ==========

class SessionCreate(BaseModel):
    title: Optional[str] = "New Chat"


class SessionResponse(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


# ========== Message Schemas ==========

class MessageResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ========== Chat Schemas ==========

class ChatResponse(BaseModel):
    user_message: MessageResponse
    bot_message: MessageResponse
    session_id: uuid.UUID
