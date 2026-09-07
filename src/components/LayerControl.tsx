export interface LayerState {
  original: boolean
  detection: boolean
  grounding: boolean
  changeMap: boolean
}

export default function LayerControl({
  layers,
  onChange,
}: {
  layers: LayerState
  onChange: (l: LayerState) => void
}) {
  const items: { key: keyof LayerState; label: string }[] = [
    { key: 'original', label: 'Original' },
    { key: 'detection', label: 'AI Detection' },
    { key: 'grounding', label: 'Grounding' },
    { key: 'changeMap', label: 'Change Map' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange({ ...layers, [key]: !layers[key] })}
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
  )
}
