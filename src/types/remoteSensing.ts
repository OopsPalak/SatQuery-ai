export type ViewModality = 'optical' | 'sar' | 'fusion' | 'split';
export type Polarization = 'VV' | 'VH' | 'HH' | 'HV' | 'VV+VH';

export interface GroundingEvidence {
  id: string;
  label: string;
  category: 'vessel' | 'flood_inundation' | 'vegetation_loss' | 'building_structure' | 'landslide' | 'oil_slick' | 'anomaly';
  laymanCategory: string; // Plain English category (e.g. "Flooded Land", "Ship / Boat", "Building")
  confidence: number;    // 0.00 - 1.00
  iouScore: number;       // Accuracy score
  bbox: [number, number, number, number]; // [x%, y%, w%, h%]
  coordinates: { lat: number; lon: number };
  opticalReflection?: {
    rgb: string;
    nirValue: number;
    ndvi: number;
    ndwi: number;
  };
  sarBackscatter?: {
    vv_dB: number;
    vh_dB: number;
    ratio_dB: number;
    coherence: number;
  };
  evidenceDescription: string;
  laymanExplanation: string; // Easy everyday explanation of why the AI detected this
  laymanGroundType: string;  // e.g., "Deep Flooded Water", "Cargo Ship Hull", "Concrete High-Rise"
}

export interface SensorMetadata {
  satelliteName: string;
  agency: string;
  acquisitionDate: string;
  resolution: string;
  incidenceAngle?: string;
  polarization?: Polarization;
  bands?: string[];
  orbitDirection?: 'Ascending' | 'Descending';
  crs: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  laymanSensorDescription: string; // Easy explanation of what satellite was used
}

export interface AuditStep {
  stepNumber: number;
  title: string;
  laymanTitle: string; // Plain English stage title (e.g. "Loading Satellite Images", "Checking Weather Interference")
  module: 'Sensor Ingestion' | 'Calibration & Radiometry' | 'Feature Extraction' | 'VLM Cross-Attention' | 'Bounding & Grounding';
  status: 'verified' | 'processing' | 'flagged';
  timestamp: string;
  details: string;
  laymanDetails: string; // Simple explanation for everyday users
  telemetry: Record<string, string | number>;
}

export interface AnalyticalMetrics {
  signalToNoiseRatio: string;
  spatialUncertainty: string;
  opticalCloudCover: string;
  sarBackscatterStdDev: string;
  modelLatencyMs: number;
  crossAttentionScore: number;
  laymanCloudCoverText: string;
  laymanAccuracyText: string;
}

export interface VLMQueryMessage {
  id: string;
  sender: 'user' | 'vlm';
  timestamp: string;
  text: string;
  evidence?: GroundingEvidence[];
  overallConfidence?: number;
  auditTrail?: AuditStep[];
  analyticalMetrics?: AnalyticalMetrics;
}

export interface DatasetItem {
  id: string;
  title: string;
  region: string;
  coordinates: string;
  description: string;
  laymanSummary: string; // Everyday summary of what this scene shows
  isCustom?: boolean;
  opticalImageUrl: string;
  sarImageUrl: string;
  fusionImageUrl?: string;
  opticalMetadata: SensorMetadata;
  sarMetadata: SensorMetadata;
  presetQueries: string[];
  groundTruthObjects: GroundingEvidence[];
}

export interface PixelProbeData {
  xPct: number;
  yPct: number;
  lat: number;
  lon: number;
  opticalRgb: { r: number; g: number; b: number };
  nir: number;
  ndvi: number;
  ndwi: number;
  sarVv_dB: number;
  sarVh_dB: number;
  coherence: number;
  elevationMeters: number;
  // Layman Human Readouts
  laymanGroundType: string;        // e.g. "Water / Flooded Area", "Green Plant / Farm", "Concrete Building"
  laymanWaterIndexText: string;    // e.g. "High Water Level (Flooded)"
  laymanPlantHealthText: string;   // e.g. "Healthy Green Vegetation"
  laymanRadarViewText: string;     // e.g. "Clear Radar Signal (No Cloud Interference)"
}
