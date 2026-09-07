// ---------------------------------------------------------------------------
// API client. Every function mirrors a real backend route and currently
// resolves against mock data with an artificial delay. Swap the body of each
// function for a `fetch()` call to the FastAPI backend — the call sites in
// components/pages never need to change.
// ---------------------------------------------------------------------------
import type { AnalysisResult, AnalysisType, HistoryEntry, DatasetInfo, ModelInfo, SceneMeta } from '../types'
import {
  SAMPLE_SCENES,
  EVIDENCE_BY_REGION,
  SUMMARY_BY_REGION,
  HISTORY,
  DATASETS,
  MODELS,
} from './mockData'

const LATENCY_MS = 550

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// POST /api/upload
export async function uploadImagery(file: File): Promise<SceneMeta> {
  // Real implementation: multipart upload, server returns parsed georeference metadata.
  const fallback = SAMPLE_SCENES[0]
  return delay({
    ...fallback,
    id: `upload-${Date.now()}`,
    filename: file.name,
    thumbnail: fallback.thumbnail,
  })
}

// POST /api/analyze
export async function runAnalysis(params: {
  scene: SceneMeta
  query: string
  type: AnalysisType
}): Promise<AnalysisResult> {
  const { scene, query, type } = params
  const evidence = EVIDENCE_BY_REGION[scene.region] ?? []
  const summary = SUMMARY_BY_REGION[scene.region] ?? 'Analysis complete. No dominant land-cover class detected.'
  const confidence = 0.88 + Math.random() * 0.09

  return delay(
    {
      id: `analysis-${Date.now()}`,
      query,
      type,
      summary,
      confidence,
      evidence,
      modelUsed: type === 'fusion' ? 'SAR Analysis Model + Remote Sensing VLM' : type === 'change' ? 'Change Detection Model' : 'Remote Sensing VLM',
      modality: scene.modality,
      timestamp: new Date().toISOString(),
      scene,
    },
    1400,
  )
}

// POST /api/change-detection
export async function runChangeDetection(before: SceneMeta, after: SceneMeta) {
  return delay({
    builtUpDeltaPct: 18.4,
    vegetationDeltaPct: -7.2,
    waterDeltaPct: 2.1,
    summary: 'Significant expansion of built-up regions is detected along the southern corridor.',
    before,
    after,
  })
}

// POST /api/cross-modal
export async function runCrossModal(scene: SceneMeta) {
  return delay({
    interpretation:
      'Optical imagery indicates dense urban structures, while SAR backscatter confirms persistent built-up surfaces.',
    confidence: 0.91,
    scene,
  })
}

// POST /api/grounding
export async function runGrounding(scene: SceneMeta, target: string) {
  return delay({
    className: target,
    confidence: 0.962,
    areaKm2: 24.6,
    centroid: { lat: 21.146 + Math.random() * 0.02, lon: 79.088 + Math.random() * 0.02 },
    scene,
  })
}

// GET /api/history
export async function fetchHistory(): Promise<HistoryEntry[]> {
  return delay(HISTORY)
}

// GET /api/models
export async function fetchModels(): Promise<ModelInfo[]> {
  return delay(MODELS)
}

// GET /api/datasets
export async function fetchDatasets(): Promise<DatasetInfo[]> {
  return delay(DATASETS)
}

// POST /api/report
export async function generateReport(analysis: AnalysisResult): Promise<{ url: string }> {
  return delay({ url: `#report-${analysis.id}` })
}
