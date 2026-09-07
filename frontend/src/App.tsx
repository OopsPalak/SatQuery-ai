import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import History from './pages/History'
import Datasets from './pages/Datasets'
import Models from './pages/Models'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function Workspace({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-void-950 overflow-hidden">
      <Sidebar />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Workspace><Dashboard /></Workspace>} />
      <Route path="/analysis" element={<Workspace><Analysis /></Workspace>} />
      <Route path="/history" element={<Workspace><History /></Workspace>} />
      <Route path="/datasets" element={<Workspace><Datasets /></Workspace>} />
      <Route path="/models" element={<Workspace><Models /></Workspace>} />
      <Route path="/reports" element={<Workspace><Reports /></Workspace>} />
      <Route path="/settings" element={<Workspace><Settings /></Workspace>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
