from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.schemas.analysis import AnalysisResponse, RegionInput


class AnalysisProvider(ABC):
    """
    Abstract interface for satellite intelligence analysis providers.

    Architectural design separates the API route and orchestration service from
    specific AI/ML model or remote sensing data providers.

    Current implementation:
      DemoAnalysisProvider (isolated development provider returning deterministic,
      clearly marked demo evidence and reproducible audit trails).

    Future implementations:
      - SentinelHubAnalysisProvider (Sentinel-1 / Sentinel-2 STAC imagery retrieval)
      - IsroBhuvanAnalysisProvider (ISRO open data pipelines)
      - GeminiVLMAnalysisProvider (Multimodal remote sensing vision-language model)
    """

    @abstractmethod
    async def analyze(
        self,
        question: str,
        dataset: Dict[str, Any],
        region: Optional[RegionInput] = None
    ) -> AnalysisResponse:
        """
        Execute analysis on the given question, dataset metadata, and optional region.
        """
        pass
