from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.schemas.analysis import (
    AnalyzeRequest,
    AnalyzeResponse,
    CaptionRequest,
    CaptionResponse,
    GroundingRequest,
    GroundingResponse,
)
from app.schemas.common import ErrorCode
from app.services import evidence as evidence_service
from app.services.agent import AgentError, run as run_agent
from app.storage import file_storage, history_storage

router = APIRouter(tags=["analysis"])


@router.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    try:
        result = run_agent(req.file_ids, req.query, req.mode)
    except AgentError as exc:
        status = 404 if exc.code == "FILE_NOT_FOUND" else 422
        raise HTTPException(status_code=status, detail={"error": True, "code": exc.code, "message": exc.message}) from exc

    history_storage.save_analysis(
        analysis_id=result["analysis_id"],
        task=result["task"],
        query=result["query"],
        input_files=req.file_ids,
        result=result,
        confidence=result["confidence"],
    )
    return result


@router.post("/api/analyze/caption", response_model=CaptionResponse)
def analyze_caption(req: CaptionRequest):
    record = file_storage.get_file_record(req.file_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail={"error": True, "code": ErrorCode.FILE_NOT_FOUND.value, "message": f"No file with id '{req.file_id}'."},
        )
    from app.models import captioning, vqa
    from app.services.agent import _step
    from app.schemas.common import StepStatus

    path = Path(record["path"])
    caption, conf = captioning.caption(path)
    labels = vqa.scene_labels(path)

    trace = [
        _step(1, "Input Validation", StepStatus.COMPLETED, "File resolved"),
        _step(2, "Specialist Selection", StepStatus.COMPLETED, "Remote Sensing VLM (Captioning)"),
        _step(3, "Analysis Execution", StepStatus.COMPLETED, "Caption generated"),
    ]
    return CaptionResponse(
        caption=caption,
        confidence=conf,
        evidence=evidence_service.evidence_from_labels(labels),
        execution_trace=trace,
    )


@router.post("/api/analyze/ground", response_model=GroundingResponse)
def analyze_ground(req: GroundingRequest):
    record = file_storage.get_file_record(req.file_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail={"error": True, "code": ErrorCode.FILE_NOT_FOUND.value, "message": f"No file with id '{req.file_id}'."},
        )
    from app.models import grounding
    from app.geospatial.raster import read_raster_info
    from app.geospatial.overlays import draw_bounding_boxes
    from app.geospatial.raster import read_raster_array
    from app.config import get_settings
    from app.services.agent import _step
    from app.schemas.common import StepStatus
    import uuid

    path = Path(record["path"])
    info = read_raster_info(path)
    detections, conf = grounding.ground(path, req.query, info)

    settings = get_settings()
    viz_url = None
    try:
        array = read_raster_array(path, max_size=768)
        scale_x = array.shape[1] / max(info.width, 1)
        scale_y = array.shape[0] / max(info.height, 1)
        boxes = [
            {
                "bbox": [d.bbox[0] * scale_x, d.bbox[1] * scale_y, d.bbox[2] * scale_x, d.bbox[3] * scale_y],
                "label": d.label,
                "confidence": d.confidence,
            }
            for d in detections
        ]
        out_path = settings.result_path / f"grounding_{uuid.uuid4().hex[:10]}.png"
        draw_bounding_boxes(array, boxes, out_path)
        viz_url = f"/results/{out_path.name}"
    except Exception:  # noqa: BLE001 - visualization is best-effort
        viz_url = None

    trace = [
        _step(1, "Input Validation", StepStatus.COMPLETED, "File resolved"),
        _step(2, "Query Classification", StepStatus.COMPLETED, "Region Grounding"),
        _step(3, "Specialist Selection", StepStatus.COMPLETED, "Grounding Head"),
        _step(4, "Analysis Execution", StepStatus.COMPLETED, f"{len(detections)} region(s) located"),
        _step(5, "Evidence Generation", StepStatus.COMPLETED, "Bounding box overlay generated" if viz_url else "No overlay generated"),
    ]

    return GroundingResponse(
        query=req.query,
        detections=detections,
        visualization_url=viz_url,
        confidence=conf,
        execution_trace=trace,
    )
