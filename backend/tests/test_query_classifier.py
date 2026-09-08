from app.services.query_classifier import classify
from app.schemas.common import TaskType


def test_vqa_default():
    result = classify("What is in this image?", image_count=1)
    assert result.task == TaskType.SINGLE_IMAGE_VQA


def test_captioning():
    result = classify("Describe this scene", image_count=1)
    assert result.task == TaskType.CAPTIONING


def test_grounding():
    result = classify("Where are the buildings?", image_count=1)
    assert result.task == TaskType.REGION_GROUNDING


def test_change_detection_two_images():
    result = classify("What changed between these dates?", image_count=2)
    assert result.task == TaskType.CHANGE_DETECTION


def test_optical_sar_two_images_with_sar():
    result = classify("Compare structural and spectral information", image_count=2, has_sar=True)
    assert result.task == TaskType.OPTICAL_SAR_ANALYSIS


def test_single_image_never_routes_to_change_detection():
    result = classify("What changed?", image_count=1)
    assert result.task != TaskType.CHANGE_DETECTION
