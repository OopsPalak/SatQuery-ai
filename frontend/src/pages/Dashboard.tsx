import { Link } from 'react-router-dom'
import { ImageIcon, GitCompareArrows, Layers, Crosshair, ArrowRight, Satellite } from 'lucide-react'
import Header from '../components/Header'

const CARDS = [
  {
    to: '/analysis?type=single',
    icon: ImageIcon,
    title: 'Single Image',
    desc: 'Ask questions about a satellite image.',
    example: '"Describe the land cover in this scene."',
  },
  {
    to: '/analysis?type=change',
    icon: GitCompareArrows,
    title: 'Change Analysis',
    desc: 'Compare imagery across two dates.',
    example: '"Has the built-up area increased?"',
  },
  {
    to: '/analysis?type=fusion',
    icon: Layers,
    title: 'Optical + SAR',
    desc: 'Combine optical and SAR observations.',
    example: '"Identify built-up and water regions."',
  },
  {
    to: '/analysis?type=grounding',
    icon: Crosshair,
    title: 'Region Grounding',
    desc: 'Locate objects and regions in imagery.',
    example: '"Highlight the water body."',
  },
]

export default function Dashboard() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header title="SatQuery AI" subtitle="Ask questions. Analyze satellites. Understand Earth." />
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-8">
        <section className="relative overflow-hidden panel px-8 py-10">
          <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
          <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-70 hidden lg:block">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full border border-cyan-400/15 animate-orbit" />
              <div className="absolute inset-6 rounded-full border border-violet-400/15 animate-orbit-slow" />
              <Satellite size={26} className="absolute top-2 left-1/2 -translate-x-1/2 text-cyan-400" />
            </div>
          </div>
          <div className="relative max-w-lg">
            <p className="tech-label text-cyan-400 mb-3">Multimodal Remote Sensing</p>
            <h2 className="text-3xl font-semibold text-slate-50 tracking-tight leading-tight">
              Understand Earth from space.
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Query optical, multispectral and SAR imagery using multimodal AI.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link to="/analysis" className="btn-primary">
                + New Analysis
              </Link>
              <Link to="/history" className="btn-secondary">
                Explore Demo
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Quick Analysis</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {CARDS.map(({ to, icon: Icon, title, desc, example }) => (
              <Link
                key={title}
                to={to}
                className="group panel p-5 space-y-3 hover:border-cyan-400/25 hover:shadow-glow transition-all duration-150"
              >
                <div className="w-9 h-9 rounded-md bg-cyan-400/10 flex items-center justify-center group-hover:bg-cyan-400/15 transition-colors">
                  <Icon size={17} className="text-cyan-300" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
                <p className="text-[11px] font-mono text-slate-600 pt-2 border-t border-white/[0.06]">{example}</p>
                <span className="flex items-center gap-1 text-[11px] text-cyan-400/0 group-hover:text-cyan-400 transition-colors">
                  Start <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
