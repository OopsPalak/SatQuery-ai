import { useEffect, useState } from 'react'
import { FileText, Download } from 'lucide-react'
import Header from '../components/Header'
import { fetchHistory } from '../lib/api'
import type { HistoryEntry } from '../types'

export default function Reports() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    fetchHistory().then(setEntries)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header title="Reports" subtitle="Generated analysis reports" showNewAnalysis={false} />
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
        <div className="panel divide-y divide-white/[0.06]">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-slate-500 shrink-0" strokeWidth={1.75} />
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">{entry.query}</p>
                  <p className="tech-label mt-0.5">{entry.date}</p>
                </div>
              </div>
              <button className="btn-ghost shrink-0">
                <Download size={14} />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
