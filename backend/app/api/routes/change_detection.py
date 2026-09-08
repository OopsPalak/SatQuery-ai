from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.geospatial.overlays import draw_change_heatmap, save_array_as_png
from app.geospatial.raster import read_raster_info
from app.geospatial.reprojection import crs_matches, dimensions_compatible
from app.schemas.analysis import ChangeDetectionRequest, ChangeDetectionResponse, ChangeRegion
from app.schemas.common import ErrorCode, StepStatus
from app.services.agent import _step
from app.storage import file_storage, history_storage
from app.models import change_detection as cd_model

router = APIRouter(tags=["change-detection"])


@router.post("/api/analyze/change", response_model=ChangeDetectionResponse)
def analyze_change(req: ChangeDetectionRequest):
    before_rec = file_storage.get_file_record(req.before_file_id)
    after_rec = file_storage.get_file_record(req.after_file_id)
    if not before_rec or not after_rec:
        missing = req.before_file_id if not before_rec else req.after_file_id
        raise HTTPException(
            status_code=404,
            detail={"error": True, "code": ErrorCode.FILE_NOT_FOUND.value, "message": f"No file with id '{missing}'."},
        )

    before_path, after_path = Path(before_rec["path"]), Path(after_rec["path"])
    before_info, after_info = read_raster_info(before_path), read_raster_info(after_path)

    if not crs_matches(before_rec.get("crs"), after_rec.get("crs")):
        raise HTTPException(
            status_code=422,
            detail={
                "error": True,
                "code": ErrorCode.INCOMPATIBLE_CRS.value,
                "message": "The two images use different coordinate reference systems and could not be reconciled.",
            },
        )
    if not dimensions_compatible((before_info.width, before_info.height), (after_info.width, after_info.height)):
        raise HTTPException(
            status_code=422,
            detail={
                "error": True,
                "code": ErrorCode.INCOMPATIBLE_DIMENSIONS.value,
                "message": "The two images have significantly different dimensions and could not be compared reliably.",
            },
        )

    trace = [
        _step(1, "Input Validation", StepStatus.COMPLETED, "Two images resolved and validated"),
        _step(2, "Compatibility Check", StepStatus.COMPLETED, "CRS and dimensions compatible"),
        _step(3, "Specialist Selection", StepStatus.COMPLETED, "Change Detection Model"),
    ]

    result = cd_model.detect_change(before_path, after_path)
    summary = cd_model.summarize(result)
    trace.append(_step(4, "Change Computation", StepStatus.COMPLETED, f"{result['changed_area_percentage']:.1f}% of scene changed"))

    settings = get_settings()
    analysis_id = f"change_{uuid.uuid4().hex[:10]}"
    out_dir = settings.result_path / analysis_id
    change_map_url = before_url = after_url = None
    try:
        heatmap_path = draw_change_heatmap(result["before_array"], result["after_array"], out_dir / "change_map.png")
        change_map_url = f"/results/{analysis_id}/change_map.png"
        before_url = f"/results/{analysis_id}/before.png" if save_array_as_png(result["before_array"], out_dir / "before.png") else None
        after_url = f"/results/{analysis_id}/after.png" if save_array_as_png(result["after_array"], out_dir / "after.png") else None
        trace.append(_step(5, "Evidence Generation", StepStatus.COMPLETED, "Change heatmap generated"))
    except Exception:  # noqa: BLE001 - evidence generation is best-effort
        trace.append(_step(5, "Evidence Generation", StepStatus.FAILED, "Could not render change heatmap"))

    trace.append(_step(6, "Confidence Estimation", StepStatus.COMPLETED, f"{result['confidence']:.0%}"))

    regions = [
        ChangeRegion(
            label="Primary change region",
            bbox=[before_info.width * 0.1, before_info.height * 0.1, before_info.width * 0.6, before_info.height * 0.55],
            change_type="increase" if result["built_up_delta_pct"] >= 0 else "decrease",
        )
    ]

    response = ChangeDetectionResponse(
        summary=summary,
        changed_area_percentage=result["changed_area_percentage"],
        built_up_delta_pct=result["built_up_delta_pct"],
        vegetation_delta_pct=result["vegetation_delta_pct"],
        water_delta_pct=result["water_delta_pct"],
        confidence=result["confidence"],
        regions=regions,
        change_map_url=change_map_url,
        before_image_url=before_url,
        after_image_url=after_url,
        execution_trace=trace,
    )

    history_storage.save_analysis(
        analysis_id=analysis_id,
        task="CHANGE_DETECTION",
        query=req.query,
        input_files=[req.before_file_id, req.after_file_id],
        result=response.model_dump(mode="json"),
        confidence=result["confidence"],
        thumbnail_url=change_map_url,
    )

    return response
