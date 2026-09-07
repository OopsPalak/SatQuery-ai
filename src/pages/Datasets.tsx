import { useEffect, useState } from 'react'
import Header from '../components/Header'
import DatasetCard from '../components/DatasetCard'
import { fetchDatasets } from '../lib/api'
import type { DatasetInfo } from '../types'

export default function Datasets() {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([])

  useEffect(() => {
    fetchDatasets().then(setDatasets)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header title="Datasets" subtitle="Benchmarks used for model adaptation" showNewAnalysis={false} />
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {datasets.map((d) => (
            <DatasetCard key={d.name} dataset={d} />
          ))}
        </div>
      </div>
    </div>
  )
}
