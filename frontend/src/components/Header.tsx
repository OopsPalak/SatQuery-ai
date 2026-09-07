import { Link } from 'react-router-dom'
import { Settings, Plus, Activity } from 'lucide-react'

export default function Header({
  title,
  subtitle,
  showNewAnalysis = true,
}: {
  title: string
  subtitle?: string
  showNewAnalysis?: boolean
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 md:px-8 h-16 border-b border-white/[0.06] shrink-0">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-slate-100 leading-tight truncate">{title}</h1>
        {subtitle && <p className="tech-label mt-0.5 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/[0.06] text-slate-400">
          <Activity size={13} className="text-signal-green" />
          <span className="tech-label">System Nominal</span>
        </div>
        <Link to="/settings" className="btn-ghost !px-2">
          <Settings size={16} />
        </Link>
        {showNewAnalysis && (
          <Link to="/analysis" className="btn-primary">
            <Plus size={15} />
            New Analysis
          </Link>
        )}
      </div>
    </header>
  )
}
