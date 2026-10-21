from app.services.recommendation import RecommendationEngine
from app.services.scoring import aggregate_block_score, compute_riasec_vector, cosine_similarity, z_score


def test_compute_riasec_vector_deterministic() -> None:
    answers = [
        {"dimension": "R", "score": 4},
        {"dimension": "R", "score": 2},
        {"dimension": "I", "score": 5},
    ]
    assert compute_riasec_vector(answers) == {"R": 3.0, "I": 5.0, "A": 0.0, "S": 0.0, "E": 0.0, "C": 0.0}


def test_cosine_similarity_zero_vector() -> None:
    assert cosine_similarity({"R": 0}, {"R": 1}, ["R"]) == 0.0


def test_z_score_handles_missing_and_zero_std() -> None:
    assert z_score(None, 6.0, 1.0) is None
    assert z_score(8.0, 8.0, 0.0) == 0.0


def test_aggregate_block_score_missing_values() -> None:
    assert aggregate_block_score({"MATH": 1.2}, ["MATH", "PHYS"]) == 1.2
    assert aggregate_block_score({}, ["MATH"]) is None


def test_recommendation_engine_ranking_and_tie_break() -> None:
    engine = RecommendationEngine()
    majors = [
        {
            "id": 2,
            "name": "Beta Major",
            "riasec_vector": {"R": 1, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0},
            "preference_vector": {"E": 1, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0},
            "required_blocks": ["A00"],
            "hard_skills": ["Skill A"],
        },
        {
            "id": 1,
            "name": "Alpha Major",
            "riasec_vector": {"R": 1, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0},
            "preference_vector": {"E": 1, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0},
            "required_blocks": ["A00"],
            "hard_skills": ["Skill B"],
        },
    ]
    results = engine.rank(
        majors=majors,
        riasec_vector={"R": 1, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0},
        preference_vector={"E": 1, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0},
        block_scores={"A00": 0},
    )

    assert [item.major_name for item in results] == ["Alpha Major", "Beta Major"]
    assert results[0].overall_score == results[1].overall_score
    assert results[0].component_scores.keys() == {"riasec", "academic", "preference"}
