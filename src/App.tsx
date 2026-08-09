import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { AttendanceMonitoringPage } from './pages/AttendanceMonitoringPage'
import { AttendanceRecordsPage } from './pages/AttendanceRecordsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { QRCodeManagementPage } from './pages/QRCodeManagementPage'
import { RFIDManagementPage } from './pages/RFIDManagementPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { StudentManagementPage } from './pages/StudentManagementPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><DashboardLayout><StudentManagementPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/qr-codes" element={<ProtectedRoute><DashboardLayout><QRCodeManagementPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/rfid" element={<ProtectedRoute><DashboardLayout><RFIDManagementPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/attendance-monitoring" element={<ProtectedRoute><DashboardLayout><AttendanceMonitoringPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/attendance-records" element={<ProtectedRoute><DashboardLayout><AttendanceRecordsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
