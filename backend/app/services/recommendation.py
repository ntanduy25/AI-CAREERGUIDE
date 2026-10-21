from __future__ import annotations

from dataclasses import dataclass

from app.services.scoring import RIASEC_KEYS, cosine_similarity, normalize_zero_to_one

PREFERENCE_KEYS = ["E", "I", "S", "N", "T", "F", "J", "P"]


@dataclass
class RankedMajor:
    major_id: int
    major_name: str
    overall_score: float
    component_scores: dict[str, float]
    drivers: list[str]
    competency_gaps: list[str]


class RecommendationEngine:
    formula_version = "v1"

    def rank(
        self,
        majors: list[dict],
        riasec_vector: dict[str, float],
        preference_vector: dict[str, float],
        block_scores: dict[str, float],
    ) -> list[RankedMajor]:
        ranked: list[RankedMajor] = []
        for major in majors:
            major_riasec = major.get("riasec_vector", {})
            major_pref = major.get("preference_vector", {})
            riasec_similarity = normalize_zero_to_one(
                cosine_similarity(riasec_vector, major_riasec, RIASEC_KEYS),
                0,
                1,
            )
            pref_similarity = normalize_zero_to_one(
                cosine_similarity(preference_vector, major_pref, PREFERENCE_KEYS),
                0,
                1,
            )
            target_blocks = major.get("required_blocks", [])
            block_values = [block_scores[b] for b in target_blocks if b in block_scores]
            academic_score = sum(block_values) / len(block_values) if block_values else 0.0
            academic_score = normalize_zero_to_one(academic_score, -3, 3)
            overall = (0.45 * riasec_similarity) + (0.35 * academic_score) + (0.20 * pref_similarity)
            rounded_overall = round(overall, 6)
            component_scores = {
                "riasec": round(riasec_similarity, 6),
                "academic": round(academic_score, 6),
                "preference": round(pref_similarity, 6),
            }
            drivers = sorted(component_scores, key=component_scores.get, reverse=True)[:3]
            competency_gaps = [
                skill
                for skill in major.get("hard_skills", [])[:3]
                if component_scores["academic"] < 0.5
            ]
            ranked.append(
                RankedMajor(
                    major_id=major["id"],
                    major_name=major["name"],
                    overall_score=rounded_overall,
                    component_scores=component_scores,
                    drivers=drivers,
                    competency_gaps=competency_gaps,
                )
            )

        ranked.sort(key=lambda item: (-item.overall_score, item.major_name, item.major_id))
        return ranked[:5]
