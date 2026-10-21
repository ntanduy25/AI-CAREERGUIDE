from fastapi import APIRouter, Depends

from app.ai.rag import RoadmapRAGService
from app.api.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/roadmap", tags=["roadmap"])
service = RoadmapRAGService()


@router.post("")
async def roadmap(payload: dict, _: User = Depends(get_current_user)) -> dict:
    major_name = payload.get("major_name", "Ngành đã chọn")
    gaps = payload.get("competency_gaps", [])
    guidance = await service.generate_guidance(major_name=major_name, gaps=gaps)
    return guidance
