import { Building2, Droplets, Trees, Waves, Mountain } from 'lucide-react'
import type { EvidenceItem } from '../types'

const ICON: Record<EvidenceItem['kind'], typeof Building2> = {
  'built-up': Building2,
  water: Droplets,
  vegetation: Trees,
  change: Waves,
  'bare-soil': Mountain,
}

const COLOR: Record<EvidenceItem['kind'], string> = {
  'built-up': 'text-signal-red',
  water: 'text-cyan-400',
  vegetation: 'text-signal-green',
  change: 'text-signal-amber',
  'bare-soil': 'text-amber-200',
}

export default function EvidencePanel({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <div className="space-y-2">
      <p className="tech-label">Evidence</p>
      <div className="grid grid-cols-1 gap-1.5">
        {evidence.map((item) => {
          const Icon = ICON[item.kind]
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-white/[0.06] px-3 py-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon size={15} className={`${COLOR[item.kind]} shrink-0`} strokeWidth={1.75} />
                <span className="text-sm text-slate-300 truncate">{item.label}</span>
              </div>
              <span className="tech-label text-slate-500 shrink-0">{(item.confidence * 100).toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
