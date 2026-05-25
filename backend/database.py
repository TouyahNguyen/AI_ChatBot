"""
Database configuration - SQLAlchemy Async Engine + Session
"""
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/chatbot_db")

# Async engine
engine = create_async_engine(DATABASE_URL, echo=False, pool_size=5, max_overflow=10)

# Async session factory
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    """Dependency: yield một async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Tạo tất cả bảng (dùng khi khởi động app)."""
    async with engine.begin() as conn:
        from models import Session, Message  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
