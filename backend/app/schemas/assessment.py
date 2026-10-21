from pydantic import BaseModel, Field


class RiasecAnswer(BaseModel):
    dimension: str = Field(pattern="^[RIASEC]$")
    score: int = Field(ge=1, le=5)


class RiasecSubmission(BaseModel):
    questionnaire_version_id: int
    answers: list[RiasecAnswer] = Field(min_length=1)


class RiasecResult(BaseModel):
    vector: dict[str, float]


class PreferenceVector(BaseModel):
    E: float = 0
    I: float = 0
    S: float = 0
    N: float = 0
    T: float = 0
    F: float = 0
    J: float = 0
    P: float = 0
