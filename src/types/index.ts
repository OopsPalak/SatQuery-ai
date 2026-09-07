export type Modality = 'Optical' | 'Multispectral' | 'SAR' | 'Optical + SAR'

export type AnalysisType = 'single' | 'change' | 'fusion' | 'grounding'

export interface SceneMeta {
  id: string
  name: string
  filename: string
  width: number
  height: number
  format: 'GeoTIFF' | 'TIFF' | 'PNG' | 'JPEG'
  resolutionM: number
  crs: string
  acquisitionDate: string
  sensor: string
  modality: Modality
  thumbnail: string
  region: 'urban' | 'agricultural' | 'water' | 'coastal' | 'forest'
}

export interface AgentStep {
  id: string
  label: string
  detail: string
  status: 'pending' | 'running' | 'done'
  timestamp?: string
}

export interface EvidenceItem {
  id: string
  label: string
  kind: 'built-up' | 'water' | 'vegetation' | 'change' | 'bare-soil'
  confidence: number
}

export interface AnalysisResult {
  id: string
  query: string
  type: AnalysisType
  summary: string
  confidence: number
  evidence: EvidenceItem[]
  modelUsed: string
  modality: Modality
  timestamp: string
  scene: SceneMeta
}

export interface HistoryEntry {
  id: string
  query: string
  type: AnalysisType
  date: string
  confidence: number
  status: 'complete' | 'processing' | 'failed'
  thumbnail: string
}

export interface DatasetInfo {
  name: string
  description: string
  task: string
  size: string
}

export interface ModelInfo {
  name: string
  task: string
  modality: string
  status: 'ready' | 'loading' | 'offline'
  adaptation: string
}

export interface SystemComponentStatus {
  name: string
  status: 'online' | 'ready' | 'degraded' | 'offline'
}
