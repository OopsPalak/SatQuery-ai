import React, { useState } from 'react';
import { Send, Terminal, ShieldCheck, Activity, Sparkles } from 'lucide-react';
import type { VLMQueryMessage, DatasetItem } from '../types/remoteSensing';

interface ChatInterfaceProps {
  activeDataset: DatasetItem;
  messages: VLMQueryMessage[];
  isProcessing: boolean;
  onSendQuery: (query: string) => void;
  onOpenAuditTrail: (message: VLMQueryMessage) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeDataset,
  messages,
  isProcessing,
  onSendQuery,
  onOpenAuditTrail
}) => {
  const [inputQuery, setInputQuery] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isProcessing) return;
    onSendQuery(inputQuery);
    setInputQuery('');
  };

  const handlePresetClick = (preset: string) => {
    if (isProcessing) return;
    onSendQuery(preset);
  };

  return (
    <div className="w-full lg:w-[420px] flex flex-col h-full bg-[#0a101d] border border-[#1e2d4a] rounded-[2px] overflow-hidden select-none font-sans">
      {/* Console Header */}
      <div className="bg-[#0e1626] px-3.5 py-2 border-b border-[#1e2d4a] flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>ASK SATQUERY AI</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-[#080c14] border border-[#1e2d4a] px-2 py-0.5 rounded-[2px]">
          SATELLITE ASSISTANT
        </span>
      </div>

      {/* Preset Questions for Laymen */}
      <div className="p-3 bg-[#080c14] border-b border-[#1e2d4a]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            POPULAR QUESTIONS YOU CAN ASK:
          </span>
        </div>
        <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
          {activeDataset.presetQueries.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset)}
              disabled={isProcessing}
              className="text-left text-xs font-sans bg-[#0e1626] hover:bg-[#142036] border border-[#1e2d4a] hover:border-cyan-500/50 p-2 rounded-[2px] text-slate-200 transition-all cursor-pointer flex items-start gap-2 group disabled:opacity-50"
            >
              <span className="font-mono text-[10px] text-cyan-400 font-bold shrink-0 mt-0.5">
                0{idx + 1}.
              </span>
              <span className="line-clamp-2 group-hover:text-cyan-200">
                {preset}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-[#1e2d4a]/70 border border-[#1e2d4a] text-slate-100 p-2.5 rounded-[2px] max-w-[90%] text-xs font-sans">
                  <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1">
                    YOUR QUESTION
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="bg-[#0e1626] border border-[#1e2d4a] p-3 rounded-[2px] space-y-2 font-sans">
              <div className="flex items-center justify-between text-xs border-b border-[#1e2d4a] pb-1.5 font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  SATQUERY AI ANSWER
                </span>
                
                {msg.analyticalMetrics && (
                  <span className="text-slate-400 text-[10px]">
                    {msg.analyticalMetrics.modelLatencyMs} ms scan
                  </span>
                )}
              </div>

              {/* Conversational Text Response */}
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {msg.text}
              </p>

              {/* Layman Confidence Summary Meter */}
              {msg.overallConfidence !== undefined && (
                <div className="bg-[#080c14] border border-[#1e2d4a] p-2.5 rounded-[2px] space-y-1.5 text-xs font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">AI CERTAINTY LEVEL:</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">
                      {(msg.overallConfidence * 100).toFixed(0)}% High Confidence
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-800 h-1.5 rounded-[0px] overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full"
                      style={{ width: `${msg.overallConfidence * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[10.5px] pt-1">
                    <span>TARGETS FOUND: <strong className="text-cyan-300 font-mono">{msg.evidence?.length || 0}</strong></span>
                    <span>WEATHER SCAN: <strong className="text-slate-200">Radar Penetrated Clouds</strong></span>
                  </div>
                </div>
              )}

              {/* Action Button: AI Reasoning Steps */}
              {msg.auditTrail && (
                <button
                  onClick={() => onOpenAuditTrail(msg)}
                  className="w-full btn-tech-secondary justify-between text-[10.5px] font-sans"
                >
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Activity className="w-3.5 h-3.5" />
                    SEE HOW AI CALCULATED THIS
                  </span>
                  <span className="font-mono text-slate-400">5 SIMPLE STEPS &rarr;</span>
                </button>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="bg-[#0e1626] border border-[#06b6d4]/40 p-3 rounded-[2px] text-xs text-cyan-300 flex items-center gap-2 animate-pulse font-sans">
            <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>SatQuery AI is scanning satellite photos and radar waves...</span>
          </div>
        )}
      </div>

      {/* Question Input Form */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-[#080c14] border-t border-[#1e2d4a] flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything about satellite images..."
          disabled={isProcessing}
          className="flex-1 bg-[#0e1626] border border-[#1e2d4a] focus:border-cyan-500 text-slate-200 text-xs px-3 py-2 rounded-[2px] font-sans placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isProcessing}
          className="btn-tech-primary py-2 px-3 shrink-0 font-sans font-semibold"
        >
          <Send className="w-3.5 h-3.5" />
          <span>ASK</span>
        </button>
      </form>
    </div>
  );
};
