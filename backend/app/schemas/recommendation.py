from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    riasec_vector: dict[str, float]
    preference_vector: dict[str, float]
    block_scores: dict[str, float] = Field(default_factory=dict)


class RecommendationItem(BaseModel):
    major_id: int
    major_name: str
    overall_score: float
    component_scores: dict[str, float]
    drivers: list[str]
    competency_gaps: list[str]


class RecommendationResponse(BaseModel):
    formula_version: str
    recommendations: list[RecommendationItem]
