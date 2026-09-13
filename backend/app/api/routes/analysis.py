from fastapi import APIRouter
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.analysis_service import analysis_service

router = APIRouter(tags=["Analysis"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_satellite_data(request: AnalysisRequest):
    """
    Primary satellite intelligence analysis endpoint.

    Accepts:
      - question: Natural-language inquiry
      - dataset_id: Identifier of the satellite scene
      - region: Geographic coordinates or bounds (optional)

    Returns structured analytical results including answer, confidence telemetry,
    grounded target evidence, diagnostic metrics, and auditable reasoning trail.
    """
    return await analysis_service.analyze(request)
