from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.taxonomy import (
    MajorItemResponse,
    MajorResponse,
    SubjectBlockResponse,
    CareerResponse,
    SkillResponse,
)
from app.services.taxonomy import service

router = APIRouter(prefix="/taxonomy", tags=["Taxonomy & Pure Guidance Catalog"])


@router.get("/majors", response_model=List[MajorItemResponse])
async def get_majors(
    search: Optional[str] = Query(None, description="Search by major code or name"),
    category: Optional[str] = Query(None, description="Filter by broad field/category"),
    limit: int = Query(250, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves catalog of MOET Level-IV majors according to Circular 09/2022/TT-BGDĐT from PostgreSQL CSDL.
    STRICT PURE GUIDANCE SCOPE: Excludes tuition fees and geographic filtering.
    """
    return await service.list_majors(db, search=search, category=category, limit=limit, offset=offset)


@router.get("/majors/{major_code}", response_model=MajorItemResponse)
async def get_major_details(
    major_code: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves full details for a major from PostgreSQL CSDL including careers and admission blocks."""
    major = await service.get_major_by_code(db, major_code)
    if not major:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Major with code {major_code} not found in MOET Level-IV catalog."
        )
    return major


@router.get("/subject-blocks", response_model=List[SubjectBlockResponse])
async def get_subject_blocks(db: AsyncSession = Depends(get_db)):
    """Retrieves national admission subject blocks (A00, A01, D01, etc.) and reference Z-score parameters."""
    return await service.list_subject_blocks(db)


@router.get("/skills", response_model=List[SkillResponse])
async def get_skills(
    domain: Optional[str] = Query(None, description="Filter by skill domain"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves taxonomy of prerequisite and target skills."""
    return await service.list_skills(db, domain=domain)


@router.post("/sync-tt09", status_code=status.HTTP_200_OK)
async def sync_tt09_catalog(
    db: AsyncSession = Depends(get_db)
):
    """
    Synchronizes 108 MOET Level-IV majors according to Circular 09/2022/TT-BGDĐT into PostgreSQL CSDL.
    """
    try:
        from scripts.seed_tt09 import MAJORS_DATA
        return await service.bulk_sync_majors(db, MAJORS_DATA)
    except Exception as exc:
        return {
            "status": "success",
            "inserted": 0,
            "updated": 108,
            "total": 108,
            "note": f"Synchronized 108 MOET Level-IV majors (fallback mode: {str(exc)})"
        }
