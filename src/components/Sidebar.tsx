import { NavLink } from 'react-router-dom'
import {
  Satellite,
  LayoutGrid,
  ScanSearch,
  History,
  Database,
  Brain,
  FileText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  CircleUser,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/analysis', label: 'New Analysis', icon: ScanSearch },
  { to: '/history', label: 'Analysis History', icon: History },
  { to: '/datasets', label: 'Datasets', icon: Database },
  { to: '/models', label: 'Models', icon: Brain },
  { to: '/reports', label: 'Reports', icon: FileText },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r border-white/[0.06] bg-void-900/60 backdrop-blur-sm transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-white/[0.06]">
        <Satellite className="text-cyan-400 shrink-0" size={20} strokeWidth={1.75} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight text-slate-100 truncate">SATQUERY AI</div>
            <div className="tech-label truncate">Remote Sensing Intelligence</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`
            }
          >
            <Icon size={17} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 pb-3 space-y-0.5 border-t border-white/[0.06] pt-3">
        <div className={`flex items-center gap-2 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <span className="dot bg-signal-green animate-pulse-soft" />
          {!collapsed && <span className="tech-label text-signal-green/90">AI Engine Online</span>}
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
              isActive ? 'text-cyan-300 bg-cyan-400/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`
          }
        >
          <Settings size={17} strokeWidth={1.75} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400">
          <CircleUser size={17} strokeWidth={1.75} />
          {!collapsed && <span className="truncate">Analyst · Bye</span>}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
        >
          {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
