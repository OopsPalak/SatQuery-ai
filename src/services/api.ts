import type { DatasetItem, VLMQueryMessage, GroundingEvidence, AuditStep, AnalyticalMetrics } from '../types/remoteSensing';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface BackendHealth {
  status: string;
  service: string;
}

export interface BackendDataset {
  id: string;
  name: string;
  sensor: string;
  type: string;
  available: boolean;
  region?: string;
  coordinates?: string;
  description?: string;
}

export interface BackendAnalysisRawResponse {
  answer: string;
  confidence: {
    score: number;
    label: string;
    source: string;
  };
  confidence_label: string;
  targets_found: number;
  targets: Array<{
    id: string;
    label: string;
    category: string;
    layman_category: string;
    confidence: number;
    iou_score?: number;
    bbox: number[];
    coordinates: { lat: number; lon: number };
    optical_reflection?: {
      rgb: string;
      nirValue: number;
      ndvi: number;
      ndwi: number;
    };
    sar_backscatter?: {
      vv_dB: number;
      vh_dB: number;
      ratio_dB: number;
      coherence: number;
    };
    evidence_description: string;
    layman_explanation: string;
    layman_ground_type: string;
    source: string;
    is_demo: boolean;
  }>;
  evidence: Array<{
    id: string;
    label: string;
    category: string;
    layman_category: string;
    confidence: number;
    iou_score?: number;
    bbox: number[];
    coordinates: { lat: number; lon: number };
    optical_reflection?: {
      rgb: string;
      nirValue: number;
      ndvi: number;
      ndwi: number;
    };
    sar_backscatter?: {
      vv_dB: number;
      vh_dB: number;
      ratio_dB: number;
      coherence: number;
    };
    evidence_description: string;
    layman_explanation: string;
    layman_ground_type: string;
    source: string;
    is_demo: boolean;
  }>;
  dataset: Record<string, unknown>;
  audit_trail: Array<{
    step_number: number;
    title: string;
    layman_title: string;
    module: string;
    status: string;
    timestamp: string;
    details: string;
    layman_details: string;
    telemetry: Record<string, string | number>;
  }>;
  status: string;
  analytical_metrics?: {
    signal_to_noise_ratio: string;
    spatial_uncertainty: string;
    optical_cloud_cover: string;
    sar_backscatter_std_dev: string;
    model_latency_ms: number;
    cross_attention_score: number;
    layman_cloud_cover_text: string;
    layman_accuracy_text: string;
  };
}

/**
 * Check connectivity to FastAPI backend.
 */
export async function checkBackendHealth(): Promise<BackendHealth> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with status: ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch dataset catalog records from backend.
 */
export async function fetchBackendDatasets(): Promise<BackendDataset[]> {
  const res = await fetch(`${API_BASE_URL}/datasets`);
  if (!res.ok) {
    throw new Error(`Failed to fetch datasets: ${res.status}`);
  }
  const data = await res.json();
  return data.datasets || [];
}

/**
 * Submit analysis query to POST /api/analyze and format as VLMQueryMessage.
 */
export async function analyzeSatelliteQuery(
  question: string,
  dataset: DatasetItem
): Promise<VLMQueryMessage> {
  // Extract center coordinates if available from metadata bounds
  const bounds = dataset.opticalMetadata?.bounds;
  const lat = bounds ? (bounds.minLat + bounds.maxLat) / 2 : undefined;
  const lon = bounds ? (bounds.minLon + bounds.maxLon) / 2 : undefined;

  const payload = {
    question,
    dataset_id: dataset.id,
    region: {
      latitude: lat,
      longitude: lon,
      name: dataset.region
    }
  };

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Backend analysis failed (${res.status}): ${errorBody}`);
  }

  const data: BackendAnalysisRawResponse = await res.json();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  // Map backend evidence to frontend GroundingEvidence
  const evidence: GroundingEvidence[] = (data.evidence || []).map((ev) => ({
    id: ev.id,
    label: ev.label,
    category: ev.category as GroundingEvidence['category'],
    laymanCategory: ev.layman_category || ev.category,
    confidence: ev.confidence,
    iouScore: ev.iou_score ?? 0.90,
    bbox: (ev.bbox.length === 4 ? ev.bbox : [20, 20, 20, 20]) as [number, number, number, number],
    coordinates: ev.coordinates,
    opticalReflection: ev.optical_reflection,
    sarBackscatter: ev.sar_backscatter,
    evidenceDescription: ev.evidence_description,
    laymanExplanation: ev.layman_explanation,
    laymanGroundType: ev.layman_ground_type
  }));

  // Map backend audit trail to frontend AuditStep
  const auditTrail: AuditStep[] = (data.audit_trail || []).map((step) => ({
    stepNumber: step.step_number,
    title: step.title,
    laymanTitle: step.layman_title,
    module: step.module as AuditStep['module'],
    status: (step.status === 'flagged' ? 'flagged' : 'verified') as AuditStep['status'],
    timestamp: step.timestamp,
    details: step.details,
    laymanDetails: step.layman_details,
    telemetry: step.telemetry
  }));

  // Map analytical metrics
  let analyticalMetrics: AnalyticalMetrics | undefined;
  if (data.analytical_metrics) {
    analyticalMetrics = {
      signalToNoiseRatio: data.analytical_metrics.signal_to_noise_ratio,
      spatialUncertainty: data.analytical_metrics.spatial_uncertainty,
      opticalCloudCover: data.analytical_metrics.optical_cloud_cover,
      sarBackscatterStdDev: data.analytical_metrics.sar_backscatter_std_dev,
      modelLatencyMs: data.analytical_metrics.model_latency_ms,
      crossAttentionScore: data.analytical_metrics.cross_attention_score,
      laymanCloudCoverText: data.analytical_metrics.layman_cloud_cover_text,
      laymanAccuracyText: data.analytical_metrics.layman_accuracy_text
    };
  }

  return {
    id: `vlm-resp-${Date.now()}`,
    sender: 'vlm',
    timestamp,
    text: data.answer,
    evidence,
    overallConfidence: data.confidence?.score ?? 0,
    auditTrail,
    analyticalMetrics
  };
}
