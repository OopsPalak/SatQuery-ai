from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.common import ErrorCode
from app.services.report_generator import generate_report
from app.storage import history_storage

router = APIRouter(tags=["reports"])


@router.post("/api/reports/{analysis_id}")
def create_report(analysis_id: str):
    entry = history_storage.get_analysis(analysis_id)
    if not entry:
        raise HTTPException(
            status_code=404,
            detail={"error": True, "code": ErrorCode.NOT_FOUND.value, "message": f"No analysis with id '{analysis_id}'."},
        )
    payload = {**entry["result"], "analysis_id": entry["analysis_id"], "query": entry["query"], "task": entry["task"]}
    report_path = generate_report(payload)
    kind = "results"
    rel = report_path.relative_to(report_path.parents[1])
    return {"report_url": f"/{kind}/{rel.as_posix()}", "format": report_path.suffix.lstrip(".")}
