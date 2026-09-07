import { useEffect, useState } from 'react'
import { GitCompareArrows, Crosshair, Layers, ImageIcon, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import { fetchHistory } from '../lib/api'
import type { AnalysisType, HistoryEntry } from '../types'

const TYPE_ICON: Record<AnalysisType, typeof ImageIcon> = {
  single: ImageIcon,
  change: GitCompareArrows,
  fusion: Layers,
  grounding: Crosshair,
}

const TYPE_LABEL: Record<AnalysisType, string> = {
  single: 'Single Image',
  change: 'Change Analysis',
  fusion: 'Cross-Modal',
  grounding: 'Region Grounding',
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [active, setActive] = useState<HistoryEntry | null>(null)

  useEffect(() => {
    fetchHistory().then(setEntries)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header title="Analysis History" subtitle="Previous queries and their results" />
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {entries.map((entry) => {
            const Icon = TYPE_ICON[entry.type]
            return (
              <button
                key={entry.id}
                onClick={() => setActive(entry)}
                className="panel overflow-hidden text-left hover:border-white/20 transition-colors duration-150"
              >
                <div className="h-28 overflow-hidden">
                  <img src={entry.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="p-3.5 space-y-2">
                  <p className="text-sm text-slate-200 leading-snug">{entry.query}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Icon size={13} strokeWidth={1.75} />
                      <span className="tech-label">{TYPE_LABEL[entry.type]}</span>
                    </div>
                    <span className="text-signal-green flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {(entry.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{entry.date}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setActive(null)}>
          <div className="panel-raised w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={active.thumbnail} alt="" className="w-full h-40 object-cover opacity-80" />
            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-200">{active.query}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="tech-label">{TYPE_LABEL[active.type]}</span>
                <span>·</span>
                <span>{active.date}</span>
                <span>·</span>
                <span className="text-signal-green">{(active.confidence * 100).toFixed(0)}% confidence</span>
              </div>
              <button onClick={() => setActive(null)} className="btn-secondary w-full justify-center mt-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
