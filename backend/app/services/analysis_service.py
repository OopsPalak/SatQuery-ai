from typing import Optional
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.dataset_service import dataset_service, DatasetService
from app.ai.base_provider import AnalysisProvider
from app.ai.demo_provider import demo_analysis_provider


class AnalysisService:
    """
    Core orchestrator service for satellite intelligence analysis.

    Responsibilities:
    - Validating the incoming analysis request.
    - Resolving target satellite dataset records.
    - Delegating inference to the appropriate AnalysisProvider (e.g., DemoAnalysisProvider).
    - Assembling structured evidence, confidence ratings, and reproducible audit trails.
    """

    def __init__(
        self,
        dataset_svc: Optional[DatasetService] = None,
        provider: Optional[AnalysisProvider] = None
    ):
        self.dataset_service = dataset_svc or dataset_service
        self.provider = provider or demo_analysis_provider

    async def analyze(self, request: AnalysisRequest) -> AnalysisResponse:
        # 1. Resolve dataset metadata
        dataset = self.dataset_service.get_dataset(request.dataset_id)
        if not dataset:
            # If dataset ID is not in registered catalog, provide an explicit fallback representation
            dataset = {
                "id": request.dataset_id,
                "name": f"Unknown Dataset ({request.dataset_id})",
                "sensor": "Unknown Sensor",
                "type": "radar",
                "available": False,
                "region": request.region.name if request.region and request.region.name else "Unknown Region"
            }

        # 2. Delegate to Analysis Provider
        response = await self.provider.analyze(
            question=request.question,
            dataset=dataset,
            region=request.region
        )

        return response


# Global singleton instance
analysis_service = AnalysisService()
