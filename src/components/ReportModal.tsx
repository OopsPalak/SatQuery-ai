import { X, Download, FileOutput, Satellite } from 'lucide-react'
import type { AnalysisResult } from '../types'

export default function ReportModal({ result, onClose }: { result: AnalysisResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="panel-raised w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Satellite size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">Analysis Report</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div>
            <p className="tech-label">SatQuery AI · Remote Sensing Analysis Report</p>
            <p className="text-slate-500 text-xs mt-1">{new Date(result.timestamp).toLocaleString()}</p>
          </div>

          <Section label="Input Imagery" value={`${result.scene.filename} · ${result.scene.sensor} · ${result.scene.acquisitionDate}`} />
          <Section label="Analysis Type" value={result.type} />
          <Section label="Query" value={result.query} />
          <Section label="AI Findings" value={result.summary} />
          <Section label="Confidence" value={`${(result.confidence * 100).toFixed(1)}%`} />
          <Section label="Model / Tool Selection" value={result.modelUsed} />

          <div>
            <p className="tech-label mb-1.5">Visual Evidence</p>
            <div className="flex flex-wrap gap-1.5">
              {result.evidence.map((e) => (
                <span key={e.id} className="text-xs rounded-full border border-white/[0.08] px-2.5 py-1 text-slate-400">
                  {e.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button className="btn-primary flex-1 justify-center">
            <Download size={14} />
            Download Report
          </button>
          <button className="btn-secondary flex-1 justify-center">
            <FileOutput size={14} />
            Export Evidence
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="tech-label mb-1">{label}</p>
      <p className="text-slate-300">{value}</p>
    </div>
  )
}
