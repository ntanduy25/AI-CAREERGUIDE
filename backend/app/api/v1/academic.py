from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import AcademicGrade, NationalReference, User
from app.schemas.academic import GradesUpsertRequest
from app.services.scoring import z_score

router = APIRouter(prefix="/academic", tags=["academic"])


@router.post("/grades")
async def upsert_grades(
    payload: GradesUpsertRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    for item in payload.grades:
        found = await db.execute(
            select(AcademicGrade).where(
                AcademicGrade.user_id == user.id,
                AcademicGrade.semester == item.semester,
                AcademicGrade.subject_code == item.subject_code,
            )
        )
        grade = found.scalar_one_or_none()
        if grade:
            grade.grade_value = item.grade_value
        else:
            db.add(
                AcademicGrade(
                    user_id=user.id,
                    semester=item.semester,
                    subject_code=item.subject_code,
                    grade_value=item.grade_value,
                )
            )
    await db.commit()
    return {"status": "saved", "count": len(payload.grades)}


@router.get("/standardized")
async def standardized_scores(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict[str, object]:
    grades_result = await db.execute(select(AcademicGrade).where(AcademicGrade.user_id == user.id))
    refs_result = await db.execute(select(NationalReference))
    grades = grades_result.scalars().all()
    refs = {ref.subject_code: ref for ref in refs_result.scalars().all()}

    standardized: dict[str, float | None] = {}
    for grade in grades:
        ref = refs.get(grade.subject_code)
        standardized[grade.subject_code] = z_score(grade.grade_value, ref.mean_value, ref.std_dev) if ref else None
    return {"standardized": standardized}
