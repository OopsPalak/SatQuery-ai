import { useState } from 'react'
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Compass, Grid3x3 } from 'lucide-react'
import type { EvidenceItem, SceneMeta } from '../types'
import LayerControl, { type LayerState } from './LayerControl'

const EVIDENCE_COLOR: Record<EvidenceItem['kind'], string> = {
  'built-up': '#e8615f',
  water: '#5fd4e0',
  vegetation: '#4fd48a',
  change: '#e8a94f',
  'bare-soil': '#c9a06c',
}

// Deterministic pseudo-random boxes so the same evidence item always lands
// in the same place — stand-ins for real model-returned polygons.
const BOX_LAYOUT = [
  { x: 14, y: 18, w: 30, h: 22 },
  { x: 54, y: 12, w: 26, h: 18 },
  { x: 22, y: 52, w: 34, h: 26 },
  { x: 60, y: 48, w: 24, h: 20 },
]

export default function ImageViewer({
  scene,
  evidence,
  layers,
  onLayersChange,
  processing,
}: {
  scene: SceneMeta
  evidence: EvidenceItem[]
  layers: LayerState
  onLayersChange: (l: LayerState) => void
  processing?: boolean
}) {
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className={`panel flex flex-col overflow-hidden ${fullscreen ? 'fixed inset-4 z-50' : 'h-full'}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="tech-label text-slate-300">{scene.name}</span>
          <span className="text-slate-600">·</span>
          <span>{scene.sensor}</span>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} icon={ZoomIn} />
          <IconBtn onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} icon={ZoomOut} />
          <IconBtn onClick={() => setZoom(1)} icon={RotateCcw} />
          <IconBtn onClick={() => setShowGrid((g) => !g)} icon={Grid3x3} active={showGrid} />
          <IconBtn onClick={() => setFullscreen((f) => !f)} icon={Maximize2} />
        </div>
      </div>

      <div className="relative flex-1 min-h-[340px] bg-void-950 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={scene.thumbnail}
            alt={scene.name}
            className="w-full h-full object-cover opacity-90"
            draggable={false}
          />
          {showGrid && <div className="absolute inset-0 grid-overlay pointer-events-none" />}

          {layers.detection &&
            evidence.map((item, i) => {
              const box = BOX_LAYOUT[i % BOX_LAYOUT.length]
              const color = EVIDENCE_COLOR[item.kind]
              return (
                <div
                  key={item.id}
                  className="absolute rounded-sm pointer-events-none"
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                    border: `1.5px solid ${color}`,
                    boxShadow: `0 0 12px -2px ${color}88`,
                    background: `${color}14`,
                  }}
                >
                  <span
                    className="absolute -top-5 left-0 text-[10px] font-mono px-1.5 py-0.5 rounded-sm whitespace-nowrap"
                    style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
                  >
                    {item.label} · {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )
            })}

          {layers.changeMap && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-screen"
              style={{
                background:
                  'radial-gradient(circle at 30% 70%, rgba(232,97,95,0.35), transparent 40%), radial-gradient(circle at 70% 30%, rgba(232,169,79,0.25), transparent 35%)',
              }}
            />
          )}
        </div>

        {processing && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scan" />
          </div>
        )}

        {/* Chrome overlays */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded bg-void-950/70 backdrop-blur-sm border border-white/[0.08] px-2 py-1">
          <span className="dot bg-cyan-400" />
          <span className="tech-label text-cyan-300">Sample Scene</span>
          <span className="text-slate-600">·</span>
          <span className="tech-label">{scene.modality}</span>
        </div>

        <div className="absolute top-2 right-2 rounded bg-void-950/70 backdrop-blur-sm border border-white/[0.08] p-1.5">
          <Compass size={16} className="text-slate-400" />
        </div>

        <div className="absolute bottom-2 left-2 rounded bg-void-950/70 backdrop-blur-sm border border-white/[0.08] px-2 py-1 font-mono text-[10px] text-slate-400">
          21.1458° N, 79.0882° E
        </div>

        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded bg-void-950/70 backdrop-blur-sm border border-white/[0.08] px-2 py-1">
          <div className="w-8 h-[2px] bg-slate-400" />
          <span className="font-mono text-[10px] text-slate-400">{(scene.resolutionM * 40 / zoom).toFixed(0)} m</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.06]">
        <LayerControl layers={layers} onChange={onLayersChange} />
      </div>
    </div>
  )
}

function IconBtn({ icon: Icon, onClick, active }: { icon: typeof ZoomIn; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-cyan-400/15 text-cyan-300' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]'
      }`}
    >
      <Icon size={14} strokeWidth={1.75} />
    </button>
  )
}
