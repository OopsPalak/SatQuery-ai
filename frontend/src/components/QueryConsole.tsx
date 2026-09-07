import { useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { QUERY_SUGGESTIONS } from '../lib/mockData'

export default function QueryConsole({
  onSubmit,
  disabled,
}: {
  onSubmit: (query: string) => void
  disabled?: boolean
}) {
  const [value, setValue] = useState('')

  const submit = () => {
    if (!value.trim() || disabled) return
    onSubmit(value.trim())
  }

  return (
    <div className="panel-raised p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-violet-400" />
        <span className="tech-label text-slate-400">Agentic Query Console</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ask SatQuery anything about this imagery..."
          className="flex-1 bg-void-950 border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
        />
        <button onClick={submit} disabled={disabled || !value.trim()} className="btn-primary shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
          Analyze
          <ArrowRight size={15} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {QUERY_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setValue(s)}
            className="text-[11px] rounded-full border border-white/[0.08] px-2.5 py-1 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
