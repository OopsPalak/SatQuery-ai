from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field


class RegionInput(BaseModel):
    latitude: Optional[float] = Field(None, description="Latitude center coordinate")
    longitude: Optional[float] = Field(None, description="Longitude center coordinate")
    name: Optional[str] = Field(None, description="Region or landmark name")
    bounds: Optional[Dict[str, float]] = Field(None, description="Bounding coordinates minLat, maxLat, minLon, maxLon")


class AnalysisRequest(BaseModel):
    question: str = Field(..., min_length=2, description="Natural language question about satellite imagery")
    dataset_id: str = Field(..., description="Target satellite dataset ID")
    region: Optional[RegionInput] = Field(None, description="Geographic location/region information")


class ConfidenceInfo(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    label: str = Field(..., description="Human-readable confidence category (e.g. high, medium, low, insufficient)")
    source: str = Field(default="demo", description="Origin of confidence calibration ('demo', 'model', or 'analysis')")


class EvidenceItem(BaseModel):
    id: str = Field(..., description="Unique evidence detection ID")
    type: str = Field(default="spatial_detection", description="Type of evidence observation")
    label: str = Field(..., description="Formal technical target label")
    category: str = Field(..., description="Standardized intelligence category")
    layman_category: str = Field(..., description="Plain-English category for non-technical users")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection certainty")
    iou_score: Optional[float] = Field(None, description="Spatial overlap accuracy score")
    bbox: List[float] = Field(default_factory=list, description="Normalized bounding box [x%, y%, w%, h%]")
    coordinates: Dict[str, float] = Field(default_factory=dict, description="Center geographic coordinates {lat, lon}")
    optical_reflection: Optional[Dict[str, Any]] = Field(None, description="Spectral reflection characteristics")
    sar_backscatter: Optional[Dict[str, Any]] = Field(None, description="Radar microwave scattering telemetry")
    evidence_description: str = Field(..., description="Technical rationale and radar/optical evidence")
    layman_explanation: str = Field(..., description="Everyday explanation of why this target was identified")
    layman_ground_type: str = Field(..., description="Observable ground surface or structure type")
    source: str = Field(default="demo", description="Evidence origin identifier (e.g. 'demo', 'sentinel-hub', 'model')")
    dataset: Optional[str] = Field(None, description="Dataset ID from which evidence originated")
    is_demo: bool = Field(default=True, description="Flag indicating development/mock evidence")


class AuditStep(BaseModel):
    step_number: int = Field(..., description="Chronological sequence number")
    title: str = Field(..., description="Technical engineering stage title")
    layman_title: str = Field(..., description="Plain-English stage title")
    module: str = Field(..., description="Pipeline subsystem component")
    status: str = Field(default="verified", description="Stage validation status (verified, flagged, processing)")
    timestamp: str = Field(..., description="Execution timestamp UTC")
    details: str = Field(..., description="Technical audit logs and operations performed")
    layman_details: str = Field(..., description="Clear explanation of the stage for everyday users")
    telemetry: Dict[str, Any] = Field(default_factory=dict, description="Key sensor telemetry and algorithm metrics")


class AnalyticalMetrics(BaseModel):
    signal_to_noise_ratio: str = Field(..., description="Signal-to-noise ratio in decibels")
    spatial_uncertainty: str = Field(..., description="Spatial geolocation accuracy margin")
    optical_cloud_cover: str = Field(..., description="Percentage of optical cloud obstruction")
    sar_backscatter_std_dev: str = Field(..., description="SAR speckle standard deviation")
    model_latency_ms: int = Field(..., description="Inference latency in milliseconds")
    cross_attention_score: float = Field(..., description="Cross-modal attention alignment score")
    layman_cloud_cover_text: str = Field(..., description="Everyday description of cloud visibility")
    layman_accuracy_text: str = Field(..., description="Everyday description of geolocation precision")


class AnalysisResponse(BaseModel):
    answer: str = Field(..., description="Natural language response summarizing the findings")
    confidence: ConfidenceInfo = Field(..., description="Structured confidence telemetry")
    confidence_label: str = Field(..., description="Confidence level label (high, medium, low, insufficient)")
    targets_found: int = Field(..., description="Total count of distinct grounded targets")
    targets: List[EvidenceItem] = Field(default_factory=list, description="List of detected spatial targets")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="List of validated evidence items")
    dataset: Dict[str, Any] = Field(default_factory=dict, description="Metadata of the analyzed dataset")
    audit_trail: List[AuditStep] = Field(default_factory=list, description="Step-by-step reproducible audit trail")
    status: str = Field(default="success", description="Overall execution status: 'success' or 'insufficient_evidence'")
    analytical_metrics: Optional[AnalyticalMetrics] = Field(None, description="Sensor and model diagnostic telemetry")
