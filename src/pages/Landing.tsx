import { Link } from 'react-router-dom'
import { Satellite, ArrowRight, Upload, Brain, Cpu, ScanLine, Eye, MessageSquare } from 'lucide-react'

const PERSPECTIVES = ['Optical', 'Multispectral', 'SAR', 'Bi-Temporal', 'Cross-Modal']

const FLOW = [
  { label: 'Upload', icon: Upload },
  { label: 'Understand', icon: Eye },
  { label: 'Select Model', icon: Cpu },
  { label: 'Analyze', icon: ScanLine },
  { label: 'Visualize', icon: Satellite },
  { label: 'Explain', icon: MessageSquare },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-void-950 text-slate-200">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Satellite size={19} className="text-cyan-400" strokeWidth={1.75} />
          <span className="text-sm font-semibold tracking-tight">SATQUERY AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-400">
          <a href="#capabilities" className="hover:text-slate-200 transition-colors">Overview</a>
          <a href="#capabilities" className="hover:text-slate-200 transition-colors">Capabilities</a>
          <a href="#flow" className="hover:text-slate-200 transition-colors">Technology</a>
          <a href="#demo" className="hover:text-slate-200 transition-colors">Demo</a>
        </nav>
        <Link to="/dashboard" className="btn-primary">
          Launch Workspace
          <ArrowRight size={14} />
        </Link>
      </header>

      <section className="relative overflow-hidden px-6 md:px-10 pt-20 pb-24 border-b border-white/[0.06]">
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="absolute -top-32 right-[-10%] w-[560px] h-[560px] rounded-full border border-cyan-400/[0.08]" />
        <div className="absolute -top-32 right-[-10%] w-[560px] h-[560px]">
          <div className="absolute inset-8 rounded-full border border-violet-400/[0.1] animate-orbit" />
          <div className="absolute inset-20 rounded-full border border-cyan-400/[0.12] animate-orbit-slow" />
        </div>

        <div className="relative max-w-2xl">
          <p className="tech-label text-cyan-400 mb-4">Agentic Vision-Language Intelligence</p>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-50 leading-[1.05]">
            Ask Earth.
            <br />
            Get answers.
          </h1>
          <p className="mt-6 text-base text-slate-400 leading-relaxed max-w-lg">
            An agentic vision-language assistant for intelligent analysis of multimodal satellite imagery — optical,
            multispectral, SAR and bi-temporal, queried in plain language.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link to="/analysis" className="btn-primary">
              <ArrowRight size={15} className="rotate-180 hidden" />
              + New Analysis
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              Explore Demo
            </Link>
          </div>
        </div>
      </section>

      <section id="capabilities" className="px-6 md:px-10 py-16 border-b border-white/[0.06]">
        <h2 className="text-lg font-semibold text-slate-100 mb-1">One interface. Multiple perspectives.</h2>
        <p className="text-sm text-slate-500 mb-8">Every sensing modality feeds the same reasoning engine.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PERSPECTIVES.map((p) => (
            <div key={p} className="panel px-4 py-6 text-center">
              <span className="tech-label text-slate-300">{p}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="flow" className="px-6 md:px-10 py-16 border-b border-white/[0.06]">
        <h2 className="text-lg font-semibold text-slate-100 mb-1">From image to insight</h2>
        <p className="text-sm text-slate-500 mb-8">Every query moves through a visible, auditable pipeline.</p>
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {FLOW.map(({ label, icon: Icon }, i) => (
            <div key={label} className="flex items-center gap-3 flex-1">
              <div className="panel flex-1 flex flex-col items-center gap-2 py-5">
                <Icon size={18} className="text-cyan-400" strokeWidth={1.5} />
                <span className="text-xs text-slate-300">{label}</span>
              </div>
              {i < FLOW.length - 1 && <ArrowRight size={14} className="text-slate-700 shrink-0 hidden md:block" />}
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="px-6 md:px-10 py-20 text-center">
        <Brain size={22} className="text-violet-400 mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-semibold text-slate-100">Ready to query a scene?</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Launch the workspace with a sample scene pre-loaded — no imagery required to try it.
        </p>
        <Link to="/analysis" className="btn-primary mt-6 inline-flex">
          Launch Workspace
          <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  )
}
