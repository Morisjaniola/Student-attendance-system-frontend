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
import { NotificationsPage } from './pages/NotificationsPage'
import { StudentManagementPage } from './pages/StudentManagementPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { SystemSettingsPage } from './pages/SystemSettingsPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { RolesPermissionsPage } from './pages/RolesPermissionsPage'
import { ReportsPage } from './pages/ReportsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute module="Dashboard"><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute module="Student Management"><DashboardLayout><StudentManagementPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/qr-codes" element={<ProtectedRoute module="QR Code Management"><DashboardLayout><QRCodeManagementPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/rfid" element={<ProtectedRoute module="RFID Management"><DashboardLayout><RFIDManagementPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/attendance-monitoring" element={<ProtectedRoute module="Attendance Monitoring"><DashboardLayout><AttendanceMonitoringPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/scanning" element={<ProtectedRoute module="Attendance Monitoring"><DashboardLayout><AttendanceMonitoringPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/attendance-records" element={<ProtectedRoute module="Attendance Records"><DashboardLayout><AttendanceRecordsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute module="Reports"><DashboardLayout><ReportsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute module="Analytics"><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute module="Analytics"><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute module="Notifications"><DashboardLayout><NotificationsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute module="User Management"><DashboardLayout><UserManagementPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute module="System Settings"><DashboardLayout><SystemSettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute module="Audit Logs"><DashboardLayout><AuditLogsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/roles-permissions" element={<ProtectedRoute module="Roles & Permissions"><DashboardLayout><RolesPermissionsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
