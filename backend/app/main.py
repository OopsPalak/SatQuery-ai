"""SatQuery AI backend — FastAPI application entry point.

Wires together CORS, static file serving for generated evidence /
previews, structured error handling, and every route module under
app/api/routes/.
"""
from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.schemas.common import ErrorCode

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("satquery")

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend for SatQuery AI — an agentic vision-language assistant for multimodal remote sensing image analysis.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static mounts for generated/uploaded imagery so the frontend can render
# previews, bounding-box overlays, change heatmaps, and downloadable reports
# directly by URL.
app.mount("/uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")
app.mount("/processed", StaticFiles(directory=str(settings.processed_path)), name="processed")
app.mount("/results", StaticFiles(directory=str(settings.result_path)), name="results")


# ---------------------------------------------------------------------------
# Structured error handling — never let the server crash on bad input, and
# always return the {error, code, message} envelope described in the spec.
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail:
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "code": ErrorCode.INVALID_REQUEST.value, "message": str(detail)},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error while processing %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"error": True, "code": ErrorCode.INTERNAL_ERROR.value, "message": "An unexpected server error occurred."},
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
from app.api.routes import (  # noqa: E402
    analysis,
    change_detection,
    demo,
    health,
    history,
    models,
    multimodal,
    reports,
    system,
    upload,
)

app.include_router(health.router)
app.include_router(system.router)
app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(change_detection.router)
app.include_router(multimodal.router)
app.include_router(history.router)
app.include_router(reports.router)
app.include_router(models.router)
app.include_router(demo.router)


@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/health",
    }
