import { useRef, useState } from 'react'
import type { SceneMeta } from '../types'

export default function ComparisonViewer({ before, after }: { before: SceneMeta; after: SceneMeta }) {
  const [split, setSplit] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateSplit = (clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setSplit(Math.min(98, Math.max(2, pct)))
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <span className="tech-label text-slate-400">Bi-temporal comparison</span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-slate-500">{before.acquisitionDate}</span>
          <span className="text-slate-700">→</span>
          <span className="text-slate-300">{after.acquisitionDate}</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative h-[320px] select-none cursor-ew-resize"
        onMouseMove={(e) => dragging.current && updateSplit(e.clientX)}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        onTouchMove={(e) => updateSplit(e.touches[0].clientX)}
      >
        <img src={after.thumbnail} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${split}%` }}>
          <img
            src={before.thumbnail}
            alt="Before"
            className="h-full object-cover"
            style={{ width: `${containerRef.current?.clientWidth ?? 800}px`, maxWidth: 'none' }}
            draggable={false}
          />
        </div>

        <div className="absolute top-2 left-2 tech-label bg-void-950/70 border border-white/[0.08] rounded px-2 py-1">Before</div>
        <div className="absolute top-2 right-2 tech-label bg-void-950/70 border border-white/[0.08] rounded px-2 py-1">After</div>

        <div
          className="absolute top-0 bottom-0 w-[2px] bg-cyan-400/80"
          style={{ left: `${split}%` }}
          onMouseDown={() => (dragging.current = true)}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-cyan-400 flex items-center justify-center shadow-glow cursor-ew-resize"
            onMouseDown={() => (dragging.current = true)}
          >
            <div className="w-3 h-3 border-l border-r border-void-950" />
          </div>
        </div>
      </div>
    </div>
  )
}
