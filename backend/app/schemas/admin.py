from pydantic import BaseModel, Field


class IngestionCreateRequest(BaseModel):
    source_name: str = Field(min_length=1, max_length=255)
    source_type: str = Field(pattern="^(pdf|excel)$")
    staged_records: list[dict] = Field(default_factory=list)


class ReviewActionRequest(BaseModel):
    action: str = Field(pattern="^(approve|reject)$")
    reviewer_notes: str | None = None
