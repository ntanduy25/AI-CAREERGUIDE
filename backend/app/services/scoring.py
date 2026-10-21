from __future__ import annotations

import math

RIASEC_KEYS = ["R", "I", "A", "S", "E", "C"]


def compute_riasec_vector(answers: list[dict]) -> dict[str, float]:
    totals = {k: 0.0 for k in RIASEC_KEYS}
    counts = {k: 0 for k in RIASEC_KEYS}
    for answer in answers:
        dimension = answer["dimension"]
        score = float(answer["score"])
        if dimension in totals:
            totals[dimension] += score
            counts[dimension] += 1
    vector = {}
    for key in RIASEC_KEYS:
        vector[key] = round(totals[key] / counts[key], 4) if counts[key] else 0.0
    return vector


def cosine_similarity(left: dict[str, float], right: dict[str, float], keys: list[str]) -> float:
    dot = sum(left.get(k, 0.0) * right.get(k, 0.0) for k in keys)
    left_norm = math.sqrt(sum(left.get(k, 0.0) ** 2 for k in keys))
    right_norm = math.sqrt(sum(right.get(k, 0.0) ** 2 for k in keys))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)


def normalize_zero_to_one(value: float, min_value: float = -1.0, max_value: float = 1.0) -> float:
    if max_value == min_value:
        return 0.0
    clamped = min(max(value, min_value), max_value)
    return (clamped - min_value) / (max_value - min_value)


def z_score(value: float | None, mean: float, std_dev: float) -> float | None:
    if value is None:
        return None
    if std_dev == 0:
        return 0.0
    return (value - mean) / std_dev


def aggregate_block_score(subject_scores: dict[str, float | None], subject_codes: list[str]) -> float | None:
    values = [subject_scores.get(code) for code in subject_codes]
    valid = [v for v in values if v is not None]
    if not valid:
        return None
    return sum(valid) / len(valid)
