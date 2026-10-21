from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import AssessmentAnswer, User
from app.schemas.assessment import RiasecResult, RiasecSubmission
from app.services.scoring import compute_riasec_vector

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.post("/riasec", response_model=RiasecResult)
async def submit_riasec(
    payload: RiasecSubmission,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RiasecResult:
    vector = compute_riasec_vector([answer.model_dump() for answer in payload.answers])
    submission = AssessmentAnswer(
        user_id=user.id,
        questionnaire_version_id=payload.questionnaire_version_id,
        answers=[answer.model_dump() for answer in payload.answers],
        computed_vector=vector,
    )
    db.add(submission)
    await db.commit()
    return RiasecResult(vector=vector)
