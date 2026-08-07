import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return <DashboardLayout><Routes><Route path="/" element={<DashboardPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></DashboardLayout>
}

export default App
