import React from 'react';
import { Target } from 'lucide-react';
import type { GroundingEvidence } from '../types/remoteSensing';

interface VisualEvidencePanelProps {
  evidenceList: GroundingEvidence[];
  selectedEvidenceId: string | null;
  onSelectEvidence: (id: string | null) => void;
}

export const VisualEvidencePanel: React.FC<VisualEvidencePanelProps> = ({
  evidenceList,
  selectedEvidenceId,
  onSelectEvidence
}) => {
  return (
    <div className="w-full lg:w-[320px] flex flex-col h-full bg-[#0a101d] border border-[#1e2d4a] rounded-[2px] overflow-hidden select-none font-sans">
      {/* Panel Header */}
      <div className="bg-[#0e1626] px-3.5 py-2 border-b border-[#1e2d4a] flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Target className="w-4 h-4 text-amber-400" />
          <span>DETECTED TARGETS ({evidenceList.length})</span>
        </div>
        <span className="text-[10px] text-slate-400">GROUNDED EVIDENCE</span>
      </div>

      {/* Target Evidence List */}
      <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
        {evidenceList.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs font-sans">
            No active targets outlined yet. Type a question in the chat console.
          </div>
        ) : (
          evidenceList.map((ev) => {
            const isSelected = ev.id === selectedEvidenceId;

            let categoryColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
            if (ev.category === 'vessel') categoryColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
            if (ev.category === 'flood_inundation') categoryColor = 'text-blue-400 bg-blue-950/60 border-blue-800';

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvidence(ev.id)}
                className={`p-2.5 bg-[#0e1626] border transition-all rounded-[2px] cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 ring-1 ring-cyan-400 bg-[#121c30]'
                    : 'border-[#1e2d4a] hover:border-slate-500'
                }`}
              >
                {/* Target Title & Layman Category */}
                <div className="flex items-start justify-between gap-2 mb-1.5 font-sans text-xs">
                  <span className="font-bold text-slate-100 line-clamp-1">{ev.label}</span>
                  <span className={`text-[9.5px] font-sans font-semibold uppercase px-1.5 py-0.2 border shrink-0 rounded-[2px] ${categoryColor}`}>
                    {ev.laymanCategory || ev.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Certainty Meter */}
                <div className="bg-[#080c14] border border-[#1e2d4a] p-2 rounded-[2px] mb-2 space-y-1 font-sans text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">AI CERTAINTY:</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">
                      {(ev.confidence * 100).toFixed(0)}% High
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-[0px] overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full"
                      style={{ width: `${ev.confidence * 100}%` }}
                    />
                  </div>

                  <div className="text-slate-400 text-[10px] pt-0.5">
                    GROUND SPOT: <strong className="text-slate-200">{ev.laymanGroundType || 'Target Feature'}</strong>
                  </div>
                </div>

                {/* Layman Explanation of Discovery */}
                <p className="text-[11px] text-slate-300 leading-normal bg-[#080c14] border border-[#1e2d4a] p-2 rounded-[2px] font-sans">
                  <strong className="text-cyan-400 font-semibold block mb-0.5 text-[10px] uppercase font-mono">
                    WHY THE AI DETECTED THIS:
                  </strong>
                  {ev.laymanExplanation || ev.evidenceDescription}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
