import { useState } from 'react'
import { Layers, Waves, Satellite as SatelliteIcon } from 'lucide-react'
import type { SceneMeta } from '../types'
import ConfidenceScore from './ConfidenceScore'

interface FusionLayers {
  optical: boolean
  sar: boolean
  fused: boolean
}

export default function CrossModalViewer({
  scene,
  interpretation,
  confidence,
}: {
  scene: SceneMeta
  interpretation: string | null
  confidence: number | null
}) {
  const [layers, setLayers] = useState<FusionLayers>({ optical: true, sar: true, fused: true })

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-violet-400" />
          <span className="tech-label text-slate-300">Cross-Modal Workspace</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: 'optical', label: 'Optical' },
              { key: 'sar', label: 'SAR' },
              { key: 'fused', label: 'Fused Interpretation' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
              className={`flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] transition-colors ${
                layers[key]
                  ? 'border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200'
                  : 'border-white/[0.07] text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-sm border ${layers[key] ? 'bg-cyan-400 border-cyan-400' : 'border-slate-600'}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06]">
        {layers.optical && (
          <div className="relative bg-void-950 h-[220px]">
            <img src={scene.thumbnail} alt="Optical" className="w-full h-full object-cover opacity-90" />
            <Badge icon={SatelliteIcon} label="Optical · Sentinel-2" />
          </div>
        )}
        {layers.sar && (
          <div className="relative bg-void-950 h-[220px]">
            <img
              src={scene.thumbnail}
              alt="SAR"
              className="w-full h-full object-cover opacity-80"
              style={{ filter: 'grayscale(1) contrast(1.25) brightness(0.85)' }}
            />
            <div
              className="absolute inset-0 mix-blend-overlay opacity-40"
              style={{ background: 'repeating-linear-gradient(0deg, rgba(95,212,224,0.15) 0 1px, transparent 1px 3px)' }}
            />
            <Badge icon={Waves} label="SAR · Sentinel-1" />
          </div>
        )}
      </div>

      {layers.fused && (
        <div className="p-4 space-y-3 border-t border-white/[0.06]">
          <p className="tech-label">Cross-Modal Interpretation</p>
          {interpretation ? (
            <>
              <p className="text-sm text-slate-200 leading-relaxed">{interpretation}</p>
              {confidence !== null && <ConfidenceScore value={confidence} />}
            </>
          ) : (
            <p className="text-sm text-slate-600">Run a query below to fuse optical and SAR observations.</p>
          )}
        </div>
      )}
    </div>
  )
}

function Badge({ icon: Icon, label }: { icon: typeof Waves; label: string }) {
  return (
    <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded bg-void-950/70 backdrop-blur-sm border border-white/[0.08] px-2 py-1">
      <Icon size={12} className="text-cyan-300" />
      <span className="tech-label text-cyan-200">{label}</span>
    </div>
  )
}
