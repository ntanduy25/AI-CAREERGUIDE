import logging
from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

logger = logging.getLogger("careerguide.database")

# Create Async Engine connecting to Supabase / PostgreSQL pooler
# sslmode is handled via query param in DATABASE_URL or asyncpg connect_args
connect_args = {}
if "supabase.com" in settings.DATABASE_URL or "aws-" in settings.DATABASE_URL:
    connect_args["ssl"] = "require"

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[Optional[AsyncSession], None]:
    """Dependency that provides an async database session per request, or None if DB is offline."""
    try:
        session = AsyncSessionLocal()
    except Exception as e:
        logger.warning(f"Database session offline or unavailable: {e}")
        yield None
        return

    try:
        yield session
    except Exception:
        try:
            await session.rollback()
        except Exception:
            pass
        raise
    finally:
        try:
            await session.close()
        except Exception:
            pass
