from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.datasets import router as datasets_router
from app.api.routes.analysis import router as analysis_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(datasets_router)
api_router.include_router(analysis_router)

__all__ = ["api_router"]
