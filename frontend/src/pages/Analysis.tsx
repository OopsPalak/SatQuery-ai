import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlayCircle, Crosshair, MapPin } from 'lucide-react'
import Header from '../components/Header'
import UploadPanel from '../components/UploadPanel'
import ImageViewer from '../components/ImageViewer'
import QueryConsole from '../components/QueryConsole'
import AgentTrace from '../components/AgentTrace'
import AnalysisResultPanel from '../components/AnalysisResult'
import ComparisonViewer from '../components/ComparisonViewer'
import CrossModalViewer from '../components/CrossModalViewer'
import ReportModal from '../components/ReportModal'
import type { LayerState } from '../components/LayerControl'
import { SAMPLE_SCENES, buildAgentTrace } from '../lib/mockData'
import { runAnalysis, runChangeDetection, uploadImagery } from '../lib/api'
import type { AgentStep, AnalysisResult, AnalysisType, SceneMeta } from '../types'

const DEFAULT_LAYERS: LayerState = { original: true, detection: true, grounding: false, changeMap: false }

export default function Analysis() {
  const [params] = useSearchParams()
  const initialType = (params.get('type') as AnalysisType) || 'single'

  const [scene, setScene] = useState<SceneMeta | null>(SAMPLE_SCENES[0])
  const [afterScene, setAfterScene] = useState<SceneMeta>(SAMPLE_SCENES[1])
  const [analysisType, setAnalysisType] = useState<AnalysisType>(initialType)
  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS)
  const [processing, setProcessing] = useState(false)
  const [steps, setSteps] = useState<AgentStep[]>([])
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [changeStats, setChangeStats] = useState<{ builtUpDeltaPct: number; vegetationDeltaPct: number; waterDeltaPct: number } | null>(null)

  useEffect(() => {
    setAnalysisType(initialType)
  }, [initialType])

  useEffect(() => {
    if (analysisType === 'change' && scene) {
      runChangeDetection(scene, afterScene).then(setChangeStats)
    }
  }, [analysisType, scene, afterScene])

  const handleUpload = async (file: File) => {
    const meta = await uploadImagery(file)
    setScene(meta)
    setResult(null)
  }

  const handleQuery = async (query: string) => {
    if (!scene) return
    setResult(null)
    setProcessing(true)
    const trace = buildAgentTrace(query, scene.modality)
    // reveal steps progressively to simulate real execution
    setSteps(trace.map((s) => ({ ...s, status: 'pending' })))
    for (let i = 0; i < trace.length; i++) {
      await new Promise((r) => setTimeout(r, 220))
      setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'running' } : s)))
      await new Promise((r) => setTimeout(r, 200))
      setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'done' } : s)))
    }
    const res = await runAnalysis({ scene, query, type: analysisType })
    setResult(res)
    setProcessing(false)
  }

  const loadDemo = () => {
    const demoScene = SAMPLE_SCENES[2]
    setScene(demoScene)
    setAnalysisType('grounding')
    handleQuery('Highlight the water body.')
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header title="New Analysis" subtitle="Analysis Workspace" showNewAnalysis={false} />

      <div className="flex items-center justify-between px-6 md:px-8 py-3 border-b border-white/[0.06]">
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_SCENES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setScene(s)
                setResult(null)
              }}
              className={`text-xs rounded-full border px-3 py-1 transition-colors ${
                scene?.id === s.id
                  ? 'border-cyan-400/40 bg-cyan-400/[0.08] text-cyan-200'
                  : 'border-white/[0.07] text-slate-500 hover:text-slate-300'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button onClick={loadDemo} className="btn-secondary shrink-0">
          <PlayCircle size={14} />
          Try Demo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_320px] gap-4 items-start">
          <UploadPanel scene={scene} analysisType={analysisType} onAnalysisType={setAnalysisType} onUpload={handleUpload} />

          <div className="space-y-4 min-w-0">
            {analysisType === 'change' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <SceneSelect label="Before" scenes={SAMPLE_SCENES} value={scene ?? SAMPLE_SCENES[0]} onChange={setScene} />
                  <SceneSelect label="After" scenes={SAMPLE_SCENES} value={afterScene} onChange={setAfterScene} />
                </div>
                {scene && <ComparisonViewer before={scene} after={afterScene} />}
                {changeStats && (
                  <div className="panel p-4 space-y-3">
                    <p className="tech-label">Change Summary</p>
                    <div className="grid grid-cols-3 gap-3">
                      <ChangeStat label="Built-up Area" value={changeStats.builtUpDeltaPct} />
                      <ChangeStat label="Vegetation" value={changeStats.vegetationDeltaPct} />
                      <ChangeStat label="Water" value={changeStats.waterDeltaPct} />
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06] text-[11px] text-slate-500">
                      <span>Low Change</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-void-700 via-signal-amber to-signal-red" />
                      <span>High Change</span>
                    </div>
                  </div>
                )}
              </>
            ) : analysisType === 'fusion' ? (
              scene && (
                <CrossModalViewer
                  scene={scene}
                  interpretation={result?.summary ?? null}
                  confidence={result?.confidence ?? null}
                />
              )
            ) : (
              scene && (
                <div className="h-[420px]">
                  <ImageViewer
                    scene={scene}
                    evidence={result?.evidence ?? []}
                    layers={layers}
                    onLayersChange={setLayers}
                    processing={processing}
                  />
                </div>
              )
            )}

            <QueryConsole onSubmit={handleQuery} disabled={processing} />

            {analysisType === 'grounding' && result && (
              <div className="panel p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Crosshair size={14} className="text-signal-red" />
                  <span className="tech-label text-slate-300">Detected Region</span>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Class</dt>
                    <dd className="text-slate-200">{result.evidence[0]?.label.replace(' detected', '') ?? 'Water Body'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Confidence</dt>
                    <dd className="text-slate-200">{((result.evidence[0]?.confidence ?? 0.96) * 100).toFixed(1)}%</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Approx. Area</dt>
                    <dd className="text-slate-200">24.6 km²</dd>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={11} className="text-slate-500" />
                    <dd className="text-slate-200 font-mono">21.1458°N, 79.0882°E</dd>
                  </div>
                </dl>
                <button className="btn-ghost !px-0 text-xs">Export Region →</button>
              </div>
            )}

            {(steps.length > 0 || processing) && <AgentTrace steps={steps} running={processing} />}
          </div>

          <div className="min-w-0">
            {result ? (
              <AnalysisResultPanel result={result} onGenerateReport={() => setShowReport(true)} />
            ) : (
              <div className="panel p-6 text-center text-sm text-slate-600">
                Ask a question below to see SatQuery's analysis, confidence and evidence here.
              </div>
            )}
          </div>
        </div>
      </div>

      {showReport && result && <ReportModal result={result} onClose={() => setShowReport(false)} />}
    </div>
  )
}

function ChangeStat({ label, value }: { label: string; value: number }) {
  const positive = value >= 0
  return (
    <div>
      <p className="tech-label">{label}</p>
      <p className={`text-lg font-semibold mt-0.5 ${positive ? 'text-signal-red' : 'text-signal-green'}`}>
        {positive ? '+' : ''}
        {value.toFixed(1)}%
      </p>
    </div>
  )
}

function SceneSelect({
  label,
  scenes,
  value,
  onChange,
}: {
  label: string
  scenes: SceneMeta[]
  value: SceneMeta
  onChange: (s: SceneMeta) => void
}) {
  return (
    <label className="panel p-3 flex items-center justify-between gap-2 text-xs">
      <span className="tech-label">{label}</span>
      <select
        className="bg-void-950 border border-white/[0.08] rounded px-2 py-1 text-slate-300 text-xs focus:outline-none"
        value={value.id}
        onChange={(e) => onChange(scenes.find((s) => s.id === e.target.value)!)}
      >
        {scenes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  )
}
