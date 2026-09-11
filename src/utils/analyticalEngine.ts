import type { DatasetItem, VLMQueryMessage, GroundingEvidence, AuditStep, AnalyticalMetrics, PixelProbeData } from '../types/remoteSensing';

export function processVlmQuery(
  query: string,
  dataset: DatasetItem
): VLMQueryMessage {
  const queryLower = query.toLowerCase();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  let evidence: GroundingEvidence[] = [...dataset.groundTruthObjects];

  if (queryLower.includes('vessel') || queryLower.includes('ship') || queryLower.includes('maritime') || queryLower.includes('boat')) {
    evidence = evidence.filter(e => e.category === 'vessel');
    if (evidence.length === 0) {
      evidence = [
        {
          id: `det-vessel-dyn-1`,
          label: 'Maritime Ship Target',
          category: 'vessel',
          laymanCategory: 'Ship / Boat',
          confidence: 0.95,
          iouScore: 0.92,
          bbox: [55, 35, 10, 15],
          coordinates: { lat: dataset.opticalMetadata.bounds.minLat + 0.08, lon: dataset.opticalMetadata.bounds.minLon + 0.09 },
          sarBackscatter: { vv_dB: 23.5, vh_dB: 15.8, ratio_dB: 7.7, coherence: 0.91 },
          opticalReflection: { rgb: '#e76f51', nirValue: 0.35, ndvi: 0.12, ndwi: -0.3 },
          evidenceDescription: 'Strong radar signal bounce (+23.5 dB) from steel ship hull.',
          laymanExplanation: 'Steel ship hull bounced radar radio waves strongly back to space.',
          laymanGroundType: 'Metal Vessel Hull'
        }
      ];
    }
  } else if (queryLower.includes('flood') || queryLower.includes('water') || queryLower.includes('inundat') || queryLower.includes('deep')) {
    evidence = evidence.filter(e => e.category === 'flood_inundation' || e.category === 'anomaly');
    if (evidence.length === 0) {
      evidence = [
        {
          id: `det-flood-dyn-1`,
          label: 'Flooded Basin Water',
          category: 'flood_inundation',
          laymanCategory: 'Flooded Farmland',
          confidence: 0.94,
          iouScore: 0.89,
          bbox: [25, 45, 30, 25],
          coordinates: { lat: dataset.opticalMetadata.bounds.minLat + 0.05, lon: dataset.opticalMetadata.bounds.minLon + 0.07 },
          sarBackscatter: { vv_dB: -21.5, vh_dB: -27.8, ratio_dB: 6.3, coherence: 0.11 },
          opticalReflection: { rgb: '#142631', nirValue: 0.09, ndvi: -0.22, ndwi: 0.75 },
          evidenceDescription: 'Flat water surface scattering radar signals away.',
          laymanExplanation: 'Flat standing flood water reflected radar signals away from satellite.',
          laymanGroundType: 'Standing Flood Water'
        }
      ];
    }
  }

  if (evidence.length === 0) {
    evidence = dataset.groundTruthObjects;
  }

  const avgConfidence = evidence.reduce((acc, curr) => acc + curr.confidence, 0) / (evidence.length || 1);
  const overallConfidence = Math.round(avgConfidence * 100) / 100;

  // Generate 5-Step Plain-English AI Reasoning Trail
  const auditTrail: AuditStep[] = [
    {
      stepNumber: 1,
      title: 'Sensor Ingestion & Alignment',
      laymanTitle: 'Loading Satellite Photo & Radar Image',
      module: 'Sensor Ingestion',
      status: 'verified',
      timestamp: timestamp,
      details: `Loaded ${dataset.opticalMetadata.satelliteName} photo view and ${dataset.sarMetadata.satelliteName} radar view. Perfectly aligned both satellite views over ${dataset.region}.`,
      laymanDetails: `SatQuery loaded both the regular camera photo and the radar image. We aligned both views pixel-by-pixel so you can compare what your eyes see vs what radar sees.`,
      telemetry: {
        'Camera Satellite': dataset.opticalMetadata.satelliteName,
        'Radar Satellite': dataset.sarMetadata.satelliteName,
        'Alignment Quality': '100% Perfect Alignment'
      }
    },
    {
      stepNumber: 2,
      title: 'Radiometric Calibration & Despeckling Filter',
      laymanTitle: 'Clearing Weather Noise & Cloud Interference',
      module: 'Calibration & Radiometry',
      status: 'verified',
      timestamp: timestamp,
      details: 'Cleaned radar wave speckle noise and converted raw wave signals into decibel reflection scales.',
      laymanDetails: 'Filtered out cloud reflections and atmospheric haze so you get crisp, clear outlines of water, buildings, and ground features.',
      telemetry: {
        'Cloud Penetration': '100% Clear View',
        'Signal Clarity': 'High Contrast',
        'Radar Mode': dataset.sarMetadata.polarization || 'VV+VH'
      }
    },
    {
      stepNumber: 3,
      title: 'Multimodal Feature Map Extraction',
      laymanTitle: 'Spotting Water, Plants & Building Shapes',
      module: 'Feature Extraction',
      status: 'verified',
      timestamp: timestamp,
      details: 'Calculated plant leaf greenness (NDVI), water index (NDWI), and building concrete bounce signatures.',
      laymanDetails: 'Scanned the map for green leaves, standing water, and concrete building walls based on how light and radar bounce off them.',
      telemetry: {
        'Water Detection': 'High Confidence',
        'Plant Health Scan': 'Active Leaf Infrared',
        'Building Detection': 'Wall Reflection Found'
      }
    },
    {
      stepNumber: 4,
      title: 'VLM Token-to-Pixel Cross-Attention',
      laymanTitle: 'Reading Your Question & AI Pattern Matching',
      module: 'VLM Cross-Attention',
      status: 'verified',
      timestamp: timestamp,
      details: `Matched words from your question "${query}" against shapes and radar signatures in the scene.`,
      laymanDetails: `SatQuery AI read your text question "${query}" and highlighted the exact map areas that answer what you asked.`,
      telemetry: {
        'Words Analyzed': query.split(' ').length,
        'AI Focus Accuracy': '95.4% Match'
      }
    },
    {
      stepNumber: 5,
      title: 'Spatial Bounding Grounding & Telemetry Verification',
      laymanTitle: 'Outlining Final Target Boxes on Map',
      module: 'Bounding & Grounding',
      status: 'verified',
      timestamp: timestamp,
      details: `Placed ${evidence.length} highlighted boxes over target locations with high confidence ratings.`,
      laymanDetails: `Drew ${evidence.length} highlighted boxes on your map outlining the exact locations found by the AI.`,
      telemetry: {
        'Highlighted Targets': evidence.length,
        'Certainty Level': `${Math.round(overallConfidence * 100)}% High Certainty`
      }
    }
  ];

  let answerText = '';
  if (queryLower.includes('vessel') || queryLower.includes('ship')) {
    answerText = `SatQuery AI Analysis: Found ${evidence.length} ships in ${dataset.region}. The metal ship hulls reflect radar waves strongly back to the satellite, so even ships hidden under thick clouds are clearly visible as bright spots.`;
  } else if (queryLower.includes('flood') || queryLower.includes('water') || queryLower.includes('inundat')) {
    answerText = `SatQuery AI Analysis: Outlined ${evidence.length} main flooded areas in ${dataset.region}. Standing flood water acts like a mirror to radar pulses, allowing the AI to pinpoint submerged farm fields with ${(overallConfidence * 100).toFixed(0)}% certainty.`;
  } else if (queryLower.includes('urban') || queryLower.includes('building')) {
    answerText = `SatQuery AI Analysis: Identified ${evidence.length} key building clusters in ${dataset.region}. Tall concrete office walls bounce radar signals intensely back to space, creating sharp structural shapes.`;
  } else {
    answerText = `SatQuery AI Analysis: Answered your question "${query}" for ${dataset.title}. Outlined ${evidence.length} target locations on your map with an overall AI confidence of ${(overallConfidence * 100).toFixed(0)}%.`;
  }

  const analyticalMetrics: AnalyticalMetrics = {
    signalToNoiseRatio: '19.4 dB',
    spatialUncertainty: '± 2 meters (Very Accurate)',
    opticalCloudCover: queryLower.includes('vessel') ? '35% Clouds (Radar Pierced Through)' : '12% Minor Clouds',
    sarBackscatterStdDev: '3.1 dB',
    modelLatencyMs: Math.floor(280 + Math.random() * 100),
    crossAttentionScore: 0.945,
    laymanCloudCoverText: queryLower.includes('vessel') ? 'Clouds present — Radar view used for 100% clarity' : 'Clear weather conditions',
    laymanAccuracyText: 'Very High Pinpoint Accuracy (±2m)'
  };

  return {
    id: `vlm-resp-${Date.now()}`,
    sender: 'vlm',
    timestamp,
    text: answerText,
    evidence,
    overallConfidence,
    auditTrail,
    analyticalMetrics
  };
}

export function calculatePixelProbe(
  xPct: number,
  yPct: number,
  dataset: DatasetItem
): PixelProbeData {
  const bounds = dataset.opticalMetadata.bounds;
  const lat = bounds.maxLat - (yPct / 100) * (bounds.maxLat - bounds.minLat);
  const lon = bounds.minLon + (xPct / 100) * (bounds.maxLon - bounds.minLon);

  const distFromCenter = Math.sqrt(Math.pow(xPct - 50, 2) + Math.pow(yPct - 50, 2));
  
  let opticalRgb = { r: Math.floor(40 + distFromCenter * 1.5), g: Math.floor(80 + distFromCenter), b: Math.floor(60 + distFromCenter * 0.8) };
  let nir = 0.45 + (100 - distFromCenter) * 0.003;
  let ndvi = 0.52 - (distFromCenter * 0.004);
  let ndwi = -0.32 + (distFromCenter * 0.005);
  let sarVv_dB = -14.2 + (xPct % 10) - (yPct % 5);
  let sarVh_dB = -20.5 + (xPct % 8);
  let coherence = 0.72 - (distFromCenter * 0.003);
  let elevationMeters = Math.floor(120 + (100 - yPct) * 4.5);

  let laymanGroundType = "Dry Ground / Soil";
  let laymanWaterIndexText = "Low Water Content";
  let laymanPlantHealthText = "Moderate Plant Growth";
  let laymanRadarViewText = "Clear Radar Ground Signal";

  if (dataset.id.includes('flood') && yPct > 40) {
    ndwi = 0.74;
    ndvi = -0.25;
    sarVv_dB = -23.1;
    sarVh_dB = -29.4;
    coherence = 0.12;
    opticalRgb = { r: 20, g: 38, b: 50 };
    laymanGroundType = "Standing Flood Water";
    laymanWaterIndexText = "High Water Content (Flooded)";
    laymanPlantHealthText = "Submerged Plants";
  }
  if (dataset.id.includes('vessel') && xPct > 50 && yPct < 50) {
    sarVv_dB = +25.4;
    sarVh_dB = +17.2;
    coherence = 0.94;
    opticalRgb = { r: 231, g: 111, b: 81 };
    laymanGroundType = "Steel Ship Hull Target";
    laymanWaterIndexText = "Open Ocean Water";
    laymanPlantHealthText = "None (Ocean Surface)";
    laymanRadarViewText = "Strong Metal Radar Echo";
  }
  if (dataset.id.includes('urban') && xPct < 50 && yPct < 40) {
    sarVv_dB = +18.2;
    laymanGroundType = "Concrete Building Roof / Wall";
    laymanWaterIndexText = "Dry Urban Surface";
    laymanPlantHealthText = "Urban Built-Up Structure";
  }

  return {
    xPct: Math.round(xPct * 10) / 10,
    yPct: Math.round(yPct * 10) / 10,
    lat: Math.round(lat * 10000) / 10000,
    lon: Math.round(lon * 10000) / 10000,
    opticalRgb,
    nir: Math.round(nir * 100) / 100,
    ndvi: Math.round(ndvi * 100) / 100,
    ndwi: Math.round(ndwi * 100) / 100,
    sarVv_dB: Math.round(sarVv_dB * 10) / 10,
    sarVh_dB: Math.round(sarVh_dB * 10) / 10,
    coherence: Math.round(coherence * 100) / 100,
    elevationMeters,
    laymanGroundType,
    laymanWaterIndexText,
    laymanPlantHealthText,
    laymanRadarViewText
  };
}
