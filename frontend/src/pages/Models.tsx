import { useEffect, useState } from 'react'
import Header from '../components/Header'
import ModelCard from '../components/ModelCard'
import { fetchModels } from '../lib/api'
import type { ModelInfo } from '../types'

export default function Models() {
  const [models, setModels] = useState<ModelInfo[]>([])

  useEffect(() => {
    fetchModels().then(setModels)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header title="Models" subtitle="Specialist models available to the agent" showNewAnalysis={false} />
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {models.map((m) => (
            <ModelCard key={m.name} model={m} />
          ))}
        </div>
      </div>
    </div>
  )
}
