import type {
  SceneMeta,
  AgentStep,
  EvidenceItem,
  HistoryEntry,
  DatasetInfo,
  ModelInfo,
  SystemComponentStatus,
} from '../types'

// Unsplash-hosted aerial/satellite-style imagery used as visual stand-ins for
// real GeoTIFF scenes. Swap for signed URLs from the imagery service in prod.
export const SAMPLE_SCENES: SceneMeta[] = [
  {
    id: 'scene-urban',
    name: 'Urban Corridor',
    filename: 'S2_MSI_urban_20260612.tif',
    width: 4096,
    height: 4096,
    format: 'GeoTIFF',
    resolutionM: 10,
    crs: 'EPSG:32643',
    acquisitionDate: '2026-06-12',
    sensor: 'Sentinel-2 MSI',
    modality: 'Multispectral',
    region: 'urban',
    thumbnail:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'scene-agri',
    name: 'Agricultural Belt',
    filename: 'S2_MSI_agri_20260603.tif',
    width: 3600,
    height: 3600,
    format: 'GeoTIFF',
    resolutionM: 10,
    crs: 'EPSG:32644',
    acquisitionDate: '2026-06-03',
    sensor: 'Sentinel-2 MSI',
    modality: 'Multispectral',
    region: 'agricultural',
    thumbnail:
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'scene-water',
    name: 'River Basin',
    filename: 'S2_MSI_river_20260528.tif',
    width: 3200,
    height: 3200,
    format: 'GeoTIFF',
    resolutionM: 10,
    crs: 'EPSG:32643',
    acquisitionDate: '2026-05-28',
    sensor: 'Sentinel-2 MSI',
    modality: 'Optical',
    region: 'water',
    thumbnail:
      'https://images.unsplash.com/photo-1508614999368-9260051292e5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'scene-coastal',
    name: 'Coastal Zone',
    filename: 'S1_SAR_coastal_20260619.tif',
    width: 2800,
    height: 2800,
    format: 'GeoTIFF',
    resolutionM: 20,
    crs: 'EPSG:32643',
    acquisitionDate: '2026-06-19',
    sensor: 'Sentinel-1 SAR',
    modality: 'SAR',
    region: 'coastal',
    thumbnail:
      'https://images.unsplash.com/photo-1483168527879-c66136b56105?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'scene-forest',
    name: 'Forest Reserve',
    filename: 'S2_MSI_forest_20260530.tif',
    width: 3400,
    height: 3400,
    format: 'GeoTIFF',
    resolutionM: 10,
    crs: 'EPSG:32644',
    acquisitionDate: '2026-05-30',
    sensor: 'Sentinel-2 MSI',
    modality: 'Multispectral',
    region: 'forest',
    thumbnail:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
  },
]

export const QUERY_SUGGESTIONS = [
  'Describe the land cover in this image.',
  'Highlight the water bodies.',
  'What changed between these two dates?',
  'Has the built-up area increased?',
  'Use optical and SAR data to identify built-up regions.',
]

export function buildAgentTrace(query: string, modality: string): AgentStep[] {
  return [
    { id: 's1', label: 'Input validated', detail: 'Georeference and band integrity confirmed', status: 'done' },
    { id: 's2', label: 'Modality detected', detail: modality, status: 'done' },
    { id: 's3', label: 'Query classified', detail: classifyQuery(query), status: 'done' },
    { id: 's4', label: 'Specialist model selected', detail: 'Remote Sensing VLM', status: 'done' },
    { id: 's5', label: 'Visual reasoning executed', detail: 'Patch-level attention over scene tiles', status: 'done' },
    { id: 's6', label: 'Evidence extracted', detail: 'Region proposals cross-checked against classes', status: 'done' },
    { id: 's7', label: 'Confidence estimated', detail: 'Calibrated against validation benchmark', status: 'done' },
    { id: 's8', label: 'Final response generated', detail: 'Grounded natural-language answer composed', status: 'done' },
  ]
}

function classifyQuery(query: string): string {
  const q = query.toLowerCase()
  if (q.includes('chang') || q.includes('increas') || q.includes('decreas')) return 'Change detection'
  if (q.includes('water')) return 'Region grounding — water'
  if (q.includes('sar')) return 'Cross-modal fusion'
  if (q.includes('built') || q.includes('urban')) return 'Land-cover analysis — built-up'
  return 'Land-cover analysis'
}

export const EVIDENCE_BY_REGION: Record<string, EvidenceItem[]> = {
  urban: [
    { id: 'e1', label: 'Built-up region detected', kind: 'built-up', confidence: 0.94 },
    { id: 'e2', label: 'Road network identified', kind: 'built-up', confidence: 0.88 },
    { id: 'e3', label: 'Residual vegetation patches', kind: 'vegetation', confidence: 0.71 },
  ],
  agricultural: [
    { id: 'e1', label: 'Cropland parcels detected', kind: 'vegetation', confidence: 0.93 },
    { id: 'e2', label: 'Irrigation channel identified', kind: 'water', confidence: 0.81 },
    { id: 'e3', label: 'Bare soil field margins', kind: 'bare-soil', confidence: 0.76 },
  ],
  water: [
    { id: 'e1', label: 'Water body detected', kind: 'water', confidence: 0.96 },
    { id: 'e2', label: 'Riparian vegetation identified', kind: 'vegetation', confidence: 0.82 },
  ],
  coastal: [
    { id: 'e1', label: 'Shoreline boundary detected', kind: 'water', confidence: 0.91 },
    { id: 'e2', label: 'Built-up region detected', kind: 'built-up', confidence: 0.79 },
  ],
  forest: [
    { id: 'e1', label: 'Dense canopy detected', kind: 'vegetation', confidence: 0.95 },
    { id: 'e2', label: 'Clearing / disturbance patch', kind: 'change', confidence: 0.68 },
  ],
}

export const SUMMARY_BY_REGION: Record<string, string> = {
  urban:
    'Built-up areas are concentrated in the north-western portion of the scene, while the central region is predominantly agricultural. A major water body is visible along the eastern boundary.',
  agricultural:
    'The scene is dominated by regularly-spaced cropland parcels, with an irrigation channel running along the southern edge. Field margins show early-stage bare soil consistent with recent tillage.',
  water:
    'A major river channel runs diagonally through the scene, bordered by dense riparian vegetation. Water extent appears stable relative to the seasonal average for this basin.',
  coastal:
    'The shoreline shows a mixed built-up and natural boundary, with development concentrated near the inlet. SAR backscatter confirms persistent hard surfaces along the coastal built-up strip.',
  forest:
    'Canopy cover is dense and continuous across most of the scene, with one clearing consistent with recent disturbance in the south-eastern quadrant.',
}

export const HISTORY: HistoryEntry[] = [
  {
    id: 'h1',
    query: 'Has built-up area increased?',
    type: 'change',
    date: '2026-08-29 · 14:12',
    confidence: 0.94,
    status: 'complete',
    thumbnail: SAMPLE_SCENES[0].thumbnail,
  },
  {
    id: 'h2',
    query: 'Identify water bodies',
    type: 'grounding',
    date: '2026-08-27 · 09:40',
    confidence: 0.96,
    status: 'complete',
    thumbnail: SAMPLE_SCENES[2].thumbnail,
  },
  {
    id: 'h3',
    query: 'Optical + SAR urban analysis',
    type: 'fusion',
    date: '2026-08-24 · 18:03',
    confidence: 0.91,
    status: 'complete',
    thumbnail: SAMPLE_SCENES[3].thumbnail,
  },
  {
    id: 'h4',
    query: 'Describe the land cover in this scene',
    type: 'single',
    date: '2026-08-21 · 11:27',
    confidence: 0.89,
    status: 'complete',
    thumbnail: SAMPLE_SCENES[4].thumbnail,
  },
  {
    id: 'h5',
    query: 'Change in vegetation cover, Q2 vs Q1',
    type: 'change',
    date: '2026-08-18 · 16:55',
    confidence: 0.87,
    status: 'complete',
    thumbnail: SAMPLE_SCENES[1].thumbnail,
  },
]

export const DATASETS: DatasetInfo[] = [
  { name: 'BigEarthNet', description: 'Large-scale multispectral remote sensing benchmark used for land-cover adaptation.', task: 'Land-cover pretraining', size: '590k patches' },
  { name: 'VRSBench', description: 'Vision-language remote sensing benchmark for captioning and grounded QA.', task: 'VQA + Grounding', size: '29k image-instruction pairs' },
  { name: 'RSVQA', description: 'Remote sensing visual question answering across low- and high-resolution imagery.', task: 'Visual question answering', size: '10k+ image pairs' },
  { name: 'CDVQA', description: 'Change detection visual question answering over bi-temporal scene pairs.', task: 'Change detection QA', size: '2.9k scene pairs' },
]

export const MODELS: ModelInfo[] = [
  { name: 'Remote Sensing VLM', task: 'VQA + Captioning', modality: 'Optical / Multispectral', status: 'ready', adaptation: 'LoRA fine-tune on VRSBench + RSVQA' },
  { name: 'Change Detection Model', task: 'Bi-temporal analysis', modality: 'Optical', status: 'ready', adaptation: 'Siamese encoder, CDVQA-adapted' },
  { name: 'SAR Analysis Model', task: 'SAR interpretation', modality: 'SAR', status: 'ready', adaptation: 'Backscatter-aware fine-tune' },
  { name: 'Grounding Head', task: 'Region + object grounding', modality: 'Optical / SAR', status: 'ready', adaptation: 'Referring-expression adapter' },
]

export const SYSTEM_STATUS: SystemComponentStatus[] = [
  { name: 'AI Engine', status: 'online' },
  { name: 'Vision-Language Model', status: 'ready' },
  { name: 'Change Detection', status: 'ready' },
  { name: 'SAR Processor', status: 'ready' },
  { name: 'Geospatial Engine', status: 'ready' },
  { name: 'Agent Controller', status: 'online' },
]
