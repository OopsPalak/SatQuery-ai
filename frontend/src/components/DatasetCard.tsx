import { Database } from 'lucide-react'
import type { DatasetInfo } from '../types'

export default function DatasetCard({ dataset }: { dataset: DatasetInfo }) {
  return (
    <div className="panel p-4 space-y-2.5 hover:border-white/20 transition-colors duration-150">
      <div className="flex items-center gap-2">
        <Database size={15} className="text-violet-400" strokeWidth={1.75} />
        <h3 className="text-sm font-semibold text-slate-200">{dataset.name}</h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{dataset.description}</p>
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
        <span className="tech-label">{dataset.task}</span>
        <span className="tech-label text-slate-600">{dataset.size}</span>
      </div>
    </div>
  )
}
