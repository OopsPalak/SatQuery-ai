import React from 'react';
import { X, CheckCircle2, ShieldCheck, Activity, FileText } from 'lucide-react';
import type { VLMQueryMessage } from '../types/remoteSensing';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeMessage: VLMQueryMessage | null;
  onExportReport: () => void;
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  activeMessage,
  onExportReport
}) => {
  if (!isOpen || !activeMessage || !activeMessage.auditTrail) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end transition-all select-none font-sans">
      <div className="w-full max-w-[620px] bg-[#0a101d] border-l border-[#1e2d4a] h-full flex flex-col font-sans text-xs">
        {/* Header */}
        <div className="bg-[#0e1626] px-4 py-3 border-b border-[#1e2d4a] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>HOW SATQUERY AI SOLVED YOUR QUESTION</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-[2px] hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Context Summary */}
        <div className="p-3.5 bg-[#080c14] border-b border-[#1e2d4a] space-y-2 text-xs font-sans">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
            <span>TIME: <strong className="text-slate-200">{activeMessage.timestamp}</strong></span>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% REPRODUCIBLE REASONING
            </span>
          </div>
          <div className="bg-[#0e1626] border border-[#1e2d4a] p-2.5 rounded-[2px] text-cyan-200">
            <span className="text-slate-400 font-mono">QUESTION ASKED:</span> "{activeMessage.text}"
          </div>
        </div>

        {/* 5 Simple AI Reasoning Stages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="font-sans text-xs uppercase text-cyan-400 tracking-wider mb-2 font-bold flex items-center justify-between">
            <span>5 SIMPLE STEPS TAKEN BY THE AI ASSISTANT:</span>
          </div>

          {activeMessage.auditTrail.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-[#0e1626] border border-[#1e2d4a] p-3 rounded-[2px] space-y-2 font-sans"
            >
              {/* Step Header */}
              <div className="flex items-center justify-between border-b border-[#1e2d4a] pb-2 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="bg-[#06b6d4]/20 border border-[#06b6d4]/50 text-cyan-300 px-2 py-0.5 font-bold rounded-[2px] font-mono text-[11px]">
                    STEP 0{step.stepNumber}
                  </span>
                  <span className="font-bold text-slate-100">{step.laymanTitle || step.title}</span>
                </div>

                <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 text-[10px] font-mono flex items-center gap-1 rounded-[2px]">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED
                </span>
              </div>

              {/* Step Plain-English Details */}
              <p className="text-slate-200 text-xs leading-relaxed font-sans bg-[#080c14] border border-[#1e2d4a] p-2.5 rounded-[2px]">
                {step.laymanDetails || step.details}
              </p>

              {/* Step Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono text-slate-300 bg-[#080c14] border border-[#1e2d4a] p-2 rounded-[2px]">
                {Object.entries(step.telemetry).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between pr-2">
                    <span className="text-slate-400">{key}:</span>
                    <span className="text-cyan-300 font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#0e1626] border-t border-[#1e2d4a] flex items-center justify-between font-sans">
          <div className="text-xs text-slate-400 font-mono">
            STATUS: <strong className="text-emerald-400">READY TO EXPORT</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportReport}
              className="btn-tech-primary font-sans font-semibold"
            >
              <FileText className="w-3.5 h-3.5" />
              EXPORT SUMMARY REPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
