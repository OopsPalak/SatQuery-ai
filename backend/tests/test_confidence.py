from app.services.confidence import estimate_confidence
from app.schemas.common import ConfidenceLevel


def test_confidence_with_model_score():
    breakdown = estimate_confidence(model_confidence=0.95, has_valid_geo_metadata=True)
    assert breakdown.model_confidence == 0.95
    assert breakdown.level == ConfidenceLevel.HIGH


def test_confidence_without_model_score_falls_back_to_heuristic():
    breakdown = estimate_confidence(model_confidence=None, has_valid_geo_metadata=False)
    assert breakdown.model_confidence is None
    assert "No calibrated model confidence" in " ".join(breakdown.factors)


def test_confidence_bounded_between_0_and_1():
    breakdown = estimate_confidence(model_confidence=1.5, has_valid_geo_metadata=True)
    assert 0 <= breakdown.score <= 1
