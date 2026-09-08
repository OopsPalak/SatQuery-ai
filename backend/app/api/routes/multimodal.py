from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.geospatial.overlays import save_array_as_png
from app.geospatial.raster import read_raster_info
from app.geospatial.reprojection import crs_matches, dimensions_compatible
from app.models import optical_sar as optical_sar_model
from app.schemas.analysis import OpticalSarRequest, OpticalSarResponse
from app.schemas.common import ErrorCode, Modality, StepStatus
from app.schemas.results import Visualization
from app.services.agent import _step
from app.storage import file_storage, history_storage

router = APIRouter(tags=["multimodal"])


@router.post("/api/analyze/multimodal", response_model=OpticalSarResponse)
def analyze_multimodal(req: OpticalSarRequest):
    optical_rec = file_storage.get_file_record(req.optical_file_id)
    sar_rec = file_storage.get_file_record(req.sar_file_id)
    if not optical_rec or not sar_rec:
        missing = req.optical_file_id if not optical_rec else req.sar_file_id
        raise HTTPException(
            status_code=404,
            detail={"error": True, "code": ErrorCode.FILE_NOT_FOUND.value, "message": f"No file with id '{missing}'."},
        )

    optical_path, sar_path = Path(optical_rec["path"]), Path(sar_rec["path"])
    optical_info, sar_info = read_raster_info(optical_path), read_raster_info(sar_path)

    trace = [
        _step(1, "Input Validation", StepStatus.COMPLETED, "Optical and SAR files resolved"),
    ]

    if not dimensions_compatible((optical_info.width, optical_info.height), (sar_info.width, sar_info.height)):
        trace.append(_step(2, "Compatibility Check", StepStatus.FAILED, "Dimension mismatch"))
        raise HTTPException(
            status_code=422,
            detail={
                "error": True,
                "code": ErrorCode.INCOMPATIBLE_DIMENSIONS.value,
                "message": "Optical and SAR scenes have incompatible dimensions and could not be co-registered.",
            },
        )
    if not crs_matches(optical_rec.get("crs"), sar_rec.get("crs")):
        trace.append(_step(2, "Compatibility Check", StepStatus.FAILED, "CRS mismatch"))
        raise HTTPException(
            status_code=422,
            detail={
                "error": True,
                "code": ErrorCode.INCOMPATIBLE_CRS.value,
                "message": "Optical and SAR scenes use different coordinate reference systems.",
            },
        )
    trace.append(_step(2, "Compatibility Check", StepStatus.COMPLETED, "Grids co-registered"))
    trace.append(_step(3, "Specialist Selection", StepStatus.COMPLETED, "SAR Analysis Model + Remote Sensing VLM"))

    result = optical_sar_model.analyze_optical_sar(optical_path, sar_path, req.query)
    trace.append(_step(4, "Cross-Modal Fusion", StepStatus.COMPLETED, "Optical and SAR representations fused"))

    settings = get_settings()
    analysis_id = f"fusion_{uuid.uuid4().hex[:10]}"
    out_dir = settings.result_path / analysis_id
    visualizations = []
    try:
        opt_path = save_array_as_png(result["optical_array"], out_dir / "optical.png")
        sar_path_png = save_array_as_png(result["sar_array"], out_dir / "sar.png")
        visualizations = [
            Visualization(kind="comparison", url=f"/results/{analysis_id}/optical.png", label="Optical"),
            Visualization(kind="comparison", url=f"/results/{analysis_id}/sar.png", label="SAR"),
        ]
        trace.append(_step(5, "Evidence Generation", StepStatus.COMPLETED, "Optical/SAR comparison layers generated"))
    except Exception:  # noqa: BLE001
        trace.append(_step(5, "Evidence Generation", StepStatus.FAILED, "Could not render comparison layers"))

    trace.append(_step(6, "Confidence Estimation", StepStatus.COMPLETED, f"{result['confidence']:.0%}"))

    response = OpticalSarResponse(
        answer=result["answer"],
        optical_observations=result["optical_observations"],
        sar_observations=result["sar_observations"],
        fused_observations=result["fused_observations"],
        confidence=result["confidence"],
        visualizations=visualizations,
        execution_trace=trace,
    )

    history_storage.save_analysis(
        analysis_id=analysis_id,
        task="OPTICAL_SAR_ANALYSIS",
        query=req.query,
        input_files=[req.optical_file_id, req.sar_file_id],
        result=response.model_dump(mode="json"),
        confidence=result["confidence"],
    )

    return response
