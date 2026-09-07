import { FileText, Download } from 'lucide-react'
import type { AnalysisResult as AnalysisResultType } from '../types'
import ConfidenceScore from './ConfidenceScore'
import EvidencePanel from './EvidencePanel'

export default function AnalysisResult({
  result,
  onGenerateReport,
}: {
  result: AnalysisResultType
  onGenerateReport: () => void
}) {
  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="tech-label text-cyan-300">SatQuery Analysis</span>
        <span className="tech-label">{result.modelUsed}</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-200">{result.summary}</p>

      <ConfidenceScore value={result.confidence} />

      <EvidencePanel evidence={result.evidence} />

      <div className="flex items-center gap-2 pt-1">
        <button onClick={onGenerateReport} className="btn-secondary flex-1 justify-center">
          <FileText size={14} />
          Generate Report
        </button>
        <button className="btn-ghost">
          <Download size={14} />
        </button>
      </div>
    </div>
  )
}
