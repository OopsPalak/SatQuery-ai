from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.common import ErrorCode
from app.storage import history_storage

router = APIRouter(tags=["history"])


@router.get("/api/history")
def get_history(limit: int = 50):
    entries = history_storage.list_analyses(limit=limit)
    return [
        {
            "analysis_id": e["analysis_id"],
            "query": e["query"],
            "task": e["task"],
            "confidence": e["confidence"],
            "status": e["status"],
            "thumbnail_url": e["thumbnail_url"],
            "date": e["created_at"],
        }
        for e in entries
    ]


@router.get("/api/history/{analysis_id}")
def get_history_entry(analysis_id: str):
    entry = history_storage.get_analysis(analysis_id)
    if not entry:
        raise HTTPException(
            status_code=404,
            detail={"error": True, "code": ErrorCode.NOT_FOUND.value, "message": f"No analysis with id '{analysis_id}'."},
        )
    return entry
