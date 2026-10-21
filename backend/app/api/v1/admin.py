from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models import AuditLog, ImportBatch, Major, StageStatus, StagedMajorRecord, User
from app.schemas.admin import IngestionCreateRequest, ReviewActionRequest

router = APIRouter(prefix="/admin/ingestion", tags=["admin"])


@router.post("/batches")
async def create_batch(
    payload: IngestionCreateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> dict[str, object]:
    batch = ImportBatch(uploaded_by=admin.id, source_name=payload.source_name, source_type=payload.source_type)
    db.add(batch)
    await db.flush()
    for record in payload.staged_records:
        db.add(
            StagedMajorRecord(
                batch_id=batch.id,
                major_name=record.get("major_name", "Unknown"),
                moet_code_level_iv=record.get("moet_code_level_iv"),
                status=StageStatus.PENDING,
                extracted_payload=record,
                citations=record.get("citations", []),
            )
        )
    await db.commit()
    return {"batch_id": batch.id, "status": "PENDING"}


@router.get("/records")
async def list_staged_records(
    status: StageStatus | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict[str, object]:
    query = select(StagedMajorRecord)
    if status:
        query = query.where(StagedMajorRecord.status == status)
    result = await db.execute(query)
    records = result.scalars().all()
    return {
        "records": [
            {
                "id": r.id,
                "batch_id": r.batch_id,
                "major_name": r.major_name,
                "moet_code_level_iv": r.moet_code_level_iv,
                "status": r.status,
                "citations": r.citations,
                "reviewer_notes": r.reviewer_notes,
            }
            for r in records
        ]
    }


@router.post("/records/{record_id}/review")
async def review_record(
    record_id: int,
    payload: ReviewActionRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> dict[str, object]:
    result = await db.execute(select(StagedMajorRecord).where(StagedMajorRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Staged record not found")

    new_status = StageStatus.APPROVED if payload.action == "approve" else StageStatus.REJECTED
    record.status = new_status
    record.reviewer_notes = payload.reviewer_notes

    if new_status == StageStatus.APPROVED:
        duplicate = await db.execute(
            select(Major).where(
                Major.name == record.major_name,
                Major.moet_code_level_iv == record.moet_code_level_iv,
            )
        )
        if not duplicate.scalar_one_or_none():
            db.add(
                Major(
                    name=record.major_name,
                    moet_code_level_iv=record.moet_code_level_iv,
                    description=record.extracted_payload.get("description", ""),
                    riasec_vector=record.extracted_payload.get("riasec_vector", {}),
                    preference_vector=record.extracted_payload.get("preference_vector", {}),
                    required_blocks=record.extracted_payload.get("required_blocks", []),
                    source_metadata=record.extracted_payload.get("source_metadata", {}),
                )
            )

    db.add(
        AuditLog(
            actor_user_id=admin.id,
            action=f"staged_record_{payload.action}",
            entity="staged_major_records",
            entity_id=str(record.id),
            payload={"reviewer_notes": payload.reviewer_notes},
        )
    )

    await db.commit()
    return {"id": record.id, "status": record.status}
