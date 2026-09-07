import { useRef, useState } from 'react'
import { UploadCloud, CheckCircle2, AlertTriangle, FileImage, Layers, GitCompareArrows, Image as ImageIcon } from 'lucide-react'
import type { AnalysisType, SceneMeta } from '../types'

const TYPE_OPTIONS: { id: AnalysisType; label: string; icon: typeof ImageIcon }[] = [
  { id: 'single', label: 'Single Image', icon: ImageIcon },
  { id: 'change', label: 'Before / After', icon: GitCompareArrows },
  { id: 'fusion', label: 'Optical + SAR', icon: Layers },
]

export default function UploadPanel({
  scene,
  analysisType,
  onAnalysisType,
  onUpload,
}: {
  scene: SceneMeta | null
  analysisType: AnalysisType
  onAnalysisType: (t: AnalysisType) => void
  onUpload: (file: File) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const ok = /\.(tif|tiff|png|jpe?g)$/i.test(file.name)
    if (!ok) {
      setWarning(`Unsupported format "${file.name.split('.').pop()}". Use GeoTIFF, TIFF, PNG or JPEG.`)
      return
    }
    setWarning(null)
    onUpload(file)
  }

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Analysis Input</h2>
        <span className="tech-label">Georeferenced</span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-150 px-4 py-8 flex flex-col items-center justify-center text-center gap-2 ${
          dragOver ? 'border-cyan-400/60 bg-cyan-400/[0.04]' : 'border-white/[0.09] hover:border-white/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".tif,.tiff,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <UploadCloud size={26} className="text-slate-500" strokeWidth={1.5} />
        <p className="text-sm text-slate-300">Drop satellite imagery here</p>
        <p className="tech-label">GeoTIFF · TIFF · PNG · JPEG</p>
      </div>

      {warning && (
        <div className="flex items-start gap-2 rounded-md border border-signal-amber/30 bg-signal-amber/[0.06] px-3 py-2 text-xs text-signal-amber">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      <div className="space-y-2">
        <p className="tech-label">Analysis Type</p>
        <div className="grid grid-cols-1 gap-1.5">
          {TYPE_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onAnalysisType(id)}
              className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm text-left transition-colors duration-150 ${
                analysisType === id
                  ? 'border-cyan-400/40 bg-cyan-400/[0.06] text-cyan-200'
                  : 'border-white/[0.07] text-slate-400 hover:border-white/15 hover:text-slate-200'
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {scene && (
        <div className="rounded-md border border-white/[0.07] p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-signal-green">
            <CheckCircle2 size={14} />
            <span>Compatible input</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <MetaRow label="Filename" value={scene.filename} icon={FileImage} span />
            <MetaRow label="Dimensions" value={`${scene.width} × ${scene.height}px`} />
            <MetaRow label="Format" value={scene.format} />
            <MetaRow label="Resolution" value={`${scene.resolutionM} m/px`} />
            <MetaRow label="CRS" value={scene.crs} />
            <MetaRow label="Acquired" value={scene.acquisitionDate} />
            <MetaRow label="Sensor" value={scene.sensor} span />
          </dl>
        </div>
      )}
    </div>
  )
}

function MetaRow({
  label,
  value,
  span,
}: {
  label: string
  value: string
  icon?: typeof FileImage
  span?: boolean
}) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-300 truncate">{value}</dd>
    </div>
  )
}
