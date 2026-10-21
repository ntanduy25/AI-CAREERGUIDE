from pydantic import BaseModel, Field


class GradeInput(BaseModel):
    semester: str = Field(min_length=1, max_length=20)
    subject_code: str = Field(min_length=1, max_length=20)
    grade_value: float = Field(ge=0, le=10)


class GradesUpsertRequest(BaseModel):
    grades: list[GradeInput] = Field(min_length=1)


class StandardizedScoreResponse(BaseModel):
    subject_code: str
    z_score: float
