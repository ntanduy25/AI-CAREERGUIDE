from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import ConsentRecord, User
from app.schemas.profile import ConsentPayload, ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileResponse)
async def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> User:
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.grade_level is not None:
        user.grade_level = payload.grade_level
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/consent")
async def record_consent(
    payload: ConsentPayload,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, str]:
    record = ConsentRecord(
        user_id=user.id,
        policy_version=payload.policy_version,
        consent_status=payload.consent_status,
        consented_at=datetime.utcnow(),
    )
    db.add(record)
    await db.commit()
    return {
        "status": "recorded",
        "note": "Consent handling supports Vietnamese privacy requirements and requires legal verification for Law No. 91/2025/QH15.",
    }
