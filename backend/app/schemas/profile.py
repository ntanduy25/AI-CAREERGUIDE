from pydantic import BaseModel, ConfigDict, Field


class ConsentPayload(BaseModel):
    policy_version: str = Field(min_length=1, max_length=50)
    consent_status: bool


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    grade_level: str | None = Field(default=None, pattern="^(11|12)$")


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    grade_level: str | None
    role: str
