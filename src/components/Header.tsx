import React from 'react';
import { Activity, ShieldCheck, Layers, FileText, Database, Radio, RefreshCw, Eye } from 'lucide-react';
import type { ViewModality, DatasetItem } from '../types/remoteSensing';

interface HeaderProps {
  activeDataset: DatasetItem;
  viewModality: ViewModality;
  setViewModality: (modality: ViewModality) => void;
  onOpenDatasetSelector: () => void;
  onOpenAuditReport: () => void;
  onResetView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeDataset,
  viewModality,
  setViewModality,
  onOpenDatasetSelector,
  onOpenAuditReport,
  onResetView
}) => {
  return (
    <header className="bg-[#0a101d] border-b border-[#1e2d4a] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Brand & Organization Telemetry */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#06b6d4]/10 border border-[#06b6d4]/40 px-2.5 py-1 rounded-[2px]">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono font-bold text-cyan-400 tracking-wider">SatQuery AI</span>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-slate-400 border-l border-[#1e2d4a] pl-3">
          <span className="font-mono text-[11px] bg-slate-800/80 px-1.5 py-0.5 rounded-[2px] text-slate-300 border border-slate-700">
            ISRO / SIH26167
          </span>
          <span className="hidden md:inline text-[11px] text-slate-300 font-sans">
            Satellite Assistant for Everyone
          </span>
        </div>
      </div>

      {/* Active Dataset Quick Identifier */}
      <button 
        onClick={onOpenDatasetSelector}
        className="flex items-center gap-2 bg-[#0e1626] border border-[#1e2d4a] hover:border-cyan-500/50 px-3 py-1 rounded-[2px] transition-all text-slate-200 cursor-pointer"
        title="Click to switch satellite dataset"
      >
        <Database className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-sans font-semibold text-slate-100 max-w-[200px] lg:max-w-[320px] truncate">
          {activeDataset.title}
        </span>
        <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.2">
          {activeDataset.region}
        </span>
      </button>

      {/* Modality View Controls (Plain English for Everyday Users) */}
      <div className="flex items-center gap-1.5 bg-[#080c14] border border-[#1e2d4a] p-0.5 rounded-[2px]">
        <button
          onClick={() => setViewModality('optical')}
          title="Standard Photo View: Natural colors captured by space cameras"
          className={`btn-tech ${
            viewModality === 'optical'
              ? 'bg-blue-900/40 text-blue-300 border-blue-600 font-bold'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Standard Photo
        </button>

        <button
          onClick={() => setViewModality('sar')}
          title="Radar View: Sees through clouds, haze, and night darkness"
          className={`btn-tech ${
            viewModality === 'sar'
              ? 'bg-cyan-900/40 text-cyan-300 border-cyan-600 font-bold'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Radar (Cloud-Free)
        </button>

        <button
          onClick={() => setViewModality('fusion')}
          title="Combined View: Merges photo colors with radar shape outlines"
          className={`btn-tech ${
            viewModality === 'fusion'
              ? 'bg-emerald-900/40 text-emerald-300 border-emerald-600 font-bold'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Smart Combined
        </button>

        <button
          onClick={() => setViewModality('split')}
          title="Side-by-Side Slider: Easily drag slider to compare photo vs radar"
          className={`btn-tech ${
            viewModality === 'split'
              ? 'bg-amber-900/40 text-amber-300 border-amber-600 font-bold'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Side-by-Side
        </button>
      </div>

      {/* Action Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetView}
          className="btn-tech-secondary"
          title="Reset Map View"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset View
        </button>

        <button
          onClick={onOpenAuditReport}
          className="btn-tech-primary"
          title="Generate printable summary report"
        >
          <FileText className="w-3.5 h-3.5" />
          Summary Report
        </button>

        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2 py-1 rounded-[2px] font-sans">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VERIFIED SATELLITE DATA</span>
        </div>
      </div>
    </header>
  );
};
