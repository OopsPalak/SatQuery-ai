import { useState } from 'react'
import { CheckCircle2, Loader2, Circle, ChevronDown, Activity } from 'lucide-react'
import type { AgentStep } from '../types'

export default function AgentTrace({ steps, running }: { steps: AgentStep[]; running: boolean }) {
  const [expanded, setExpanded] = useState(true)
  const [detailsFor, setDetailsFor] = useState<string | null>(null)

  return (
    <div className="panel">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">AI Agent Execution</span>
          {running && <span className="tech-label text-cyan-300 animate-pulse-soft">running</span>}
        </div>
        <ChevronDown size={15} className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="p-4">
          <ol className="relative border-l border-white/[0.08] ml-2 space-y-4">
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1
              return (
                <li key={step.id} className="ml-4">
                  <span className="absolute -left-[7px] flex items-center justify-center w-3.5 h-3.5 rounded-full bg-void-900">
                    {step.status === 'done' && <CheckCircle2 size={14} className="text-signal-green" />}
                    {step.status === 'running' && <Loader2 size={14} className="text-cyan-400 animate-spin" />}
                    {step.status === 'pending' && <Circle size={10} className="text-slate-700" />}
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm ${step.status === 'pending' ? 'text-slate-600' : 'text-slate-200'}`}>{step.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                    </div>
                    {step.status === 'done' && (
                      <button
                        onClick={() => setDetailsFor(detailsFor === step.id ? null : step.id)}
                        className="tech-label text-slate-600 hover:text-cyan-300 shrink-0"
                      >
                        {detailsFor === step.id ? 'Hide' : 'View details'}
                      </button>
                    )}
                  </div>
                  {detailsFor === step.id && (
                    <div className="mt-2 rounded-md border border-white/[0.06] bg-void-950/60 px-3 py-2 text-xs text-slate-500 font-mono">
                      action: {step.label.toLowerCase().replace(/\s+/g, '_')}() → ok
                      {!isLast && <br />}
                      {!isLast && `latency: ${(80 + i * 34) % 260}ms`}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
