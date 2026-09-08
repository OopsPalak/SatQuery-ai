from app.services.agent import decide_task
from app.schemas.common import TaskType


def test_decide_task_single_optical_vqa():
    records = [{"modality": "optical"}]
    decision = decide_task(records, "What is visible in this image?")
    assert decision.task == TaskType.SINGLE_IMAGE_VQA.value
    assert decision.image_count == 1


def test_decide_task_change_detection():
    records = [{"modality": "optical"}, {"modality": "optical"}]
    decision = decide_task(records, "What changed between these two dates?")
    assert decision.task == TaskType.CHANGE_DETECTION.value


def test_decide_task_optical_sar():
    records = [{"modality": "optical"}, {"modality": "sar"}]
    decision = decide_task(records, "Compare optical and SAR observations")
    assert decision.task == TaskType.OPTICAL_SAR_ANALYSIS.value


def test_agent_run_raises_for_unknown_file():
    from app.services.agent import run, AgentError
    import pytest

    with pytest.raises(AgentError):
        run(["not-a-real-id"], "What is in this image?")
