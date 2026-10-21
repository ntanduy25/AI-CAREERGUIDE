from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import RecommendationRun, User
from app.repositories.major_repository import MajorRepository
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendation import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
engine = RecommendationEngine()


@router.post("/rank", response_model=RecommendationResponse)
async def rank_majors(
    payload: RecommendationRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RecommendationResponse:
    majors = await MajorRepository(db).list_active()
    ranked = engine.rank(
        [
            {
                "id": major.id,
                "name": major.name,
                "riasec_vector": major.riasec_vector,
                "preference_vector": major.preference_vector,
                "required_blocks": major.required_blocks,
                "hard_skills": major.hard_skills,
            }
            for major in majors
        ],
        payload.riasec_vector,
        payload.preference_vector,
        payload.block_scores,
    )
    response = RecommendationResponse(
        formula_version=engine.formula_version,
        recommendations=[
            {
                "major_id": item.major_id,
                "major_name": item.major_name,
                "overall_score": item.overall_score,
                "component_scores": item.component_scores,
                "drivers": item.drivers,
                "competency_gaps": item.competency_gaps,
            }
            for item in ranked
        ],
    )
    run = RecommendationRun(
        user_id=user.id,
        formula_version=engine.formula_version,
        inputs=payload.model_dump(),
        results=response.model_dump(),
    )
    db.add(run)
    await db.commit()
    return response
