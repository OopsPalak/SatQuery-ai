import { Brain } from 'lucide-react'
import type { ModelInfo } from '../types'

const STATUS_COLOR: Record<ModelInfo['status'], string> = {
  ready: 'bg-signal-green',
  loading: 'bg-signal-amber',
  offline: 'bg-slate-600',
}

export default function ModelCard({ model }: { model: ModelInfo }) {
  return (
    <div className="panel p-4 space-y-2.5 hover:border-white/20 transition-colors duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={15} className="text-cyan-400" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-slate-200">{model.name}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`dot ${STATUS_COLOR[model.status]}`} />
          <span className="tech-label capitalize">{model.status}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500">{model.adaptation}</p>
      <div className="flex items-center gap-3 pt-1 border-t border-white/[0.06] text-[11px]">
        <span className="text-slate-400">{model.task}</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500">{model.modality}</span>
      </div>
    </div>
  )
}
