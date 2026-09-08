from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/api/health")
def health():
    settings = get_settings()
    return {"status": "ok", "service": settings.app_name, "version": settings.app_version}
