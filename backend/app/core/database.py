import logging
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

logger = logging.getLogger(__name__)

# Create Async Engine (supports PostgreSQL 16 + pgvector and SQLite aiosqlite)
engine_kwargs = {
    "echo": settings.ENVIRONMENT == "development",
    "future": True,
}

if settings.DATABASE_URL.startswith("postgresql"):
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
    })

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

# Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[Optional[AsyncSession], None]:
    """Dependency that provides an async database session per request, or None if DB is offline."""
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()
    except Exception as e:
        logger.warning(f"Database session offline or unavailable: {e}")
        yield None
