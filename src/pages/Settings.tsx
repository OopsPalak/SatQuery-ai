import Header from '../components/Header'
import { SYSTEM_STATUS } from '../lib/mockData'

const STATUS_COLOR: Record<string, string> = {
  online: 'bg-signal-green',
  ready: 'bg-signal-green',
  degraded: 'bg-signal-amber',
  offline: 'bg-slate-600',
}

export default function Settings() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header title="Settings" subtitle="System status and preferences" showNewAnalysis={false} />
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6 max-w-2xl">
        <section className="panel p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">System Status</h3>
          <div className="divide-y divide-white/[0.06]">
            {SYSTEM_STATUS.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-300">{c.name}</span>
                <span className="flex items-center gap-1.5 tech-label capitalize">
                  <span className={`dot ${STATUS_COLOR[c.status]}`} />
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Analyst Profile</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="tech-label">Name</p>
              <p className="text-slate-300 mt-0.5">Bye</p>
            </div>
            <div>
              <p className="tech-label">Role</p>
              <p className="text-slate-300 mt-0.5">Analyst</p>
            </div>
            <div>
              <p className="tech-label">Workspace</p>
              <p className="text-slate-300 mt-0.5">SatQuery AI — Default</p>
            </div>
            <div>
              <p className="tech-label">API Endpoint</p>
              <p className="text-slate-300 mt-0.5 font-mono text-xs">/api/*</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
