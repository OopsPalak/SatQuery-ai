from fastapi import APIRouter

from app.config import get_settings
from app.models.vlm import HAS_HF_STACK

router = APIRouter(tags=["system"])


@router.get("/api/system/status")
def system_status():
    settings = get_settings()
    ml_ready = "ready" if (HAS_HF_STACK or settings.mock_inference) else "degraded"
    return {
        "backend": "online",
        "agent": "ready",
        "vlm": "loaded" if settings.mock_inference else ("loaded" if HAS_HF_STACK else "unavailable"),
        "change_detection": "ready",
        "optical_sar": "ready",
        "storage": "ready",
        "mock_inference": settings.mock_inference,
        "device": settings.model_device,
    }
