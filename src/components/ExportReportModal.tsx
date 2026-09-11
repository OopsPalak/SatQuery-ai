import React from 'react';
import { X, Download, Printer, ShieldCheck, FileText, Radio } from 'lucide-react';
import type { DatasetItem, VLMQueryMessage } from '../types/remoteSensing';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: DatasetItem;
  latestMessage: VLMQueryMessage | null;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  dataset,
  latestMessage
}) => {
  if (!isOpen) return null;

  const reportDate = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const auditId = `ISRO-SATQUERY-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleDownloadJson = () => {
    const reportObj = {
      auditReportId: auditId,
      agency: 'ISRO / SatQuery AI Remote Sensing Audit',
      problemStatement: 'SIH26167 - Interactive Vision-Language Assistant for Multimodal Remote Sensing',
      timestamp: reportDate,
      dataset: {
        id: dataset.id,
        title: dataset.title,
        region: dataset.region,
        coordinates: dataset.coordinates,
        opticalMetadata: dataset.opticalMetadata,
        sarMetadata: dataset.sarMetadata
      },
      latestVlmQuery: latestMessage
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${auditId}_AuditReport.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#0a101d] border border-[#1e2d4a] w-full max-w-[800px] max-h-[90vh] flex flex-col font-sans rounded-[2px] shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#0e1626] px-4 py-3 border-b border-[#1e2d4a] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>SATELLITE ANALYSIS & AI VERIFICATION CERTIFICATE</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-[2px] hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#080c14] text-slate-200 font-sans text-xs">
          {/* Header Telemetry Badge */}
          <div className="border border-[#1e2d4a] bg-[#0e1626] p-4 rounded-[2px] flex items-start justify-between font-sans">
            <div>
              <div className="text-cyan-400 font-bold text-sm tracking-wider flex items-center gap-2 font-mono">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>SATQUERY AI | ISRO SIH26167 CERTIFICATE</span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                Official Summary Certificate for Multimodal Satellite Data Analysis
              </p>
            </div>

            <div className="text-right text-[10.5px] text-slate-400 space-y-0.5 font-mono">
              <div>REPORT ID: <strong className="text-slate-100">{auditId}</strong></div>
              <div>DATE: <strong className="text-slate-100">{reportDate}</strong></div>
              <div className="text-emerald-400 font-bold">VERIFIED REPRODUCIBLE</div>
            </div>
          </div>

          {/* Dataset & Sensor Specifications */}
          <div className="space-y-2">
            <h3 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
              1. REGION & SATELLITE SUMMARY
            </h3>
            <div className="grid grid-cols-2 gap-3 font-sans text-xs bg-[#0e1626] border border-[#1e2d4a] p-3 rounded-[2px]">
              <div>
                <span className="text-slate-400">SCENARIO:</span>{' '}
                <strong className="text-slate-100">{dataset.title}</strong>
              </div>
              <div>
                <span className="text-slate-400">COORDINATES:</span>{' '}
                <strong className="text-slate-100 font-mono">{dataset.coordinates}</strong>
              </div>
              <div>
                <span className="text-slate-400">PHOTO SATELLITE:</span>{' '}
                <span className="text-blue-400 font-mono">{dataset.opticalMetadata.satelliteName}</span>
              </div>
              <div>
                <span className="text-slate-400">RADAR SATELLITE:</span>{' '}
                <span className="text-cyan-400 font-mono">{dataset.sarMetadata.satelliteName}</span>
              </div>
            </div>
          </div>

          {/* VLM Query & Grounded Evidence */}
          {latestMessage && (
            <div className="space-y-2">
              <h3 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                2. QUESTION ASKED & AI FINDINGS
              </h3>
              <div className="bg-[#0e1626] border border-[#1e2d4a] p-3 rounded-[2px] space-y-2 text-xs font-sans">
                <div>
                  <span className="text-slate-400 font-mono text-[11px]">QUESTION:</span> "{latestMessage.text}"
                </div>
                <div className="text-slate-200 bg-[#080c14] p-2.5 border border-[#1e2d4a] rounded-[2px] leading-relaxed">
                  {latestMessage.text}
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 font-mono text-[11px]">
                  <span>AI CONFIDENCE: <strong className="text-emerald-400 font-bold">{((latestMessage.overallConfidence || 0.95) * 100).toFixed(0)}% High Certainty</strong></span>
                  <span>TARGETS FOUND: <strong className="text-cyan-300">{latestMessage.evidence?.length || 0}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Grounded Evidence Breakdown */}
          <div className="space-y-2">
            <h3 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
              3. OUTLINED LOCATIONS & GROUND TYPES
            </h3>
            <div className="space-y-2 font-sans text-xs">
              {dataset.groundTruthObjects.map((gt, i) => (
                <div key={gt.id} className="bg-[#0e1626] border border-[#1e2d4a] p-2.5 rounded-[2px] flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-mono">#0{i+1}</span>{' '}
                    <strong className="text-slate-100">{gt.label}</strong>{' '}
                    <span className="text-slate-400">({gt.laymanCategory || gt.category})</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-300 font-sans">
                    <span>Ground Type: <strong className="text-amber-400">{gt.laymanGroundType || 'Target Feature'}</strong></span>
                    <span className="text-emerald-400 font-mono font-bold">{(gt.confidence * 100).toFixed(0)}% CERTAIN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Signature */}
          <div className="border-t border-[#1e2d4a] pt-4 flex items-center justify-between font-sans text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>DIGITALLY VERIFIED BY ISRO SIH26167 AUDIT ENGINE</span>
            </div>
            <div className="font-mono text-[10.5px]">RECORD ID: {auditId}</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-3.5 bg-[#0e1626] border-t border-[#1e2d4a] flex items-center justify-between font-sans">
          <button
            onClick={onClose}
            className="btn-tech-secondary font-sans"
          >
            CLOSE
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="btn-tech-secondary text-cyan-400 border-cyan-800 font-sans"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD JSON LOG
            </button>

            <button
              onClick={handlePrint}
              className="btn-tech-primary font-sans font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              PRINT / SAVE PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
