from typing import Optional, List
from pydantic import BaseModel, Field


class DatasetSummary(BaseModel):
    id: str = Field(..., description="Unique dataset identifier")
    name: str = Field(..., description="Human-readable dataset or scenario name")
    sensor: str = Field(..., description="Sensor classification (e.g. SAR, Optical, Fusion)")
    type: str = Field(..., description="Modality type (e.g. radar, optical, multimodal)")
    available: bool = Field(default=True, description="Whether this dataset is available for analysis")
    region: Optional[str] = Field(None, description="Geographic region of coverage")
    coordinates: Optional[str] = Field(None, description="Geographic coordinate center string")
    description: Optional[str] = Field(None, description="Technical and contextual description")
    preset_queries: Optional[List[str]] = Field(default=None, description="Recommended preset questions")


class DatasetListResponse(BaseModel):
    datasets: List[DatasetSummary]
