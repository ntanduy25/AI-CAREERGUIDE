from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Major


class MajorRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_active(self) -> list[Major]:
        result = await self.db.execute(select(Major).where(Major.is_active.is_(True)))
        return list(result.scalars().all())
