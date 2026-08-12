import {
  BarChart3,
  Bell,
  ChevronLeft,
  ClipboardCheck,
  ClipboardList,
  Contact,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  QrCode,
  Settings,
  ShieldCheck,
  PieChart,
  UsersRound,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useNotificationsUnreadCount } from '../../hooks/useNotificationsUnreadCount'
import { useAuthStore } from '../../stores/authStore'
import { hasPermission } from '../../services/roleService'
import { useRoleStore } from '../../stores/roleStore'
import type { SystemModule } from '../../types/role'
import { ConfirmationModal } from '../dialogs/ConfirmationModal'

interface SidebarProps {
  open: boolean
  onClose: () => void
  compact: boolean
  onCompactChange: () => void
}

const primaryLinks: { label: string; icon: LucideIcon; to: string; module: SystemModule }[] = [
  { label: 'Overview', icon: LayoutDashboard, to: '/dashboard', module: 'Dashboard' },
  { label: 'Students', icon: UsersRound, to: '/students', module: 'Student Management' },
  { label: 'QR Codes', icon: QrCode, to: '/qr-codes', module: 'QR Code Management' },
  { label: 'RFID Management', icon: Contact, to: '/rfid', module: 'RFID Management' },
  { label: 'Attendance Monitoring', icon: ClipboardCheck, to: '/attendance-monitoring', module: 'Attendance Monitoring' },
  { label: 'Reports', icon: BarChart3, to: '/reports', module: 'Analytics' },
  { label: 'Analytics', icon: PieChart, to: '/analytics', module: 'Analytics' },
  { label: 'Notifications', icon: Bell, to: '/notifications', module: 'Notifications' },
  { label: 'User Management', icon: UsersRound, to: '/users', module: 'User Management' },
  { label: 'Audit Logs', icon: ClipboardList, to: '/audit-logs', module: 'Audit Logs' },
  { label: 'Roles & Permissions', icon: ShieldCheck, to: '/roles-permissions', module: 'Roles & Permissions' },
]

export function Sidebar({ open, onClose, compact, onCompactChange }: SidebarProps) {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const currentUser = useAuthStore((state) => state.user)
  const unreadCount = useNotificationsUnreadCount()
  const permissionRevision = useRoleStore((state) => state.permissionRevision)
  const { visiblePrimaryLinks, canViewAttendanceRecords, canViewSettings } = useMemo(() => ({
    visiblePrimaryLinks: primaryLinks.filter((link) => hasPermission(currentUser?.role, link.module, 'View')),
    canViewAttendanceRecords: hasPermission(currentUser?.role, 'Attendance Records', 'View'),
    canViewSettings: hasPermission(currentUser?.role, 'System Settings', 'View'),
  }), [currentUser?.role, permissionRevision])
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false)

  const confirmLogout = () => {
    logout()
    setLogoutConfirmationOpen(false)
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <button
        className={`fixed inset-0 z-30 bg-slate-950/35 lg:hidden ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
        aria-label="Close navigation"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200/75 bg-white/95 px-3 py-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-[width,transform] duration-300 dark:border-slate-800 dark:bg-slate-950/95 lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${compact ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        <div className="flex h-11 shrink-0 items-center justify-between px-2">
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden" aria-label="Attendly dashboard">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <GraduationCap size={21} strokeWidth={2.3} />
            </span>
            <span className={`whitespace-nowrap text-lg font-bold tracking-tight text-slate-900 dark:text-white ${compact ? 'lg:hidden' : ''}`}>Attendly</span>
          </NavLink>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        {!compact && <p className="mt-9 shrink-0 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>}
        <nav className={`${compact ? 'mt-9' : ''} min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:thin]`} aria-label="Primary navigation">
          {visiblePrimaryLinks.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              title={compact ? label : undefined}
              className={({ isActive }) => `group flex h-11 items-center rounded-xl px-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              } ${compact ? 'lg:justify-center lg:px-0' : ''}`}
            >
              <Icon size={19} strokeWidth={2} className="shrink-0" />
              <span className={`ml-3 whitespace-nowrap ${compact ? 'lg:hidden' : ''}`}>{label}</span>
              {to === '/notifications' && unreadCount > 0 && (
                <span className={`ml-auto grid size-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white ${compact ? 'lg:hidden' : ''}`} aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 shrink-0 space-y-1 border-t border-slate-100 pt-4 dark:border-slate-800">
          {canViewAttendanceRecords && <NavLink
            to="/attendance-records"
            onClick={onClose}
            title={compact ? 'Attendance Records' : undefined}
            className={({ isActive }) => `group flex h-11 items-center rounded-xl px-3 text-sm font-medium transition ${
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
            } ${compact ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <FileText size={19} className="shrink-0" />
            <span className={`ml-3 whitespace-nowrap ${compact ? 'lg:hidden' : ''}`}>Attendance Records</span>
          </NavLink>}
          {canViewSettings && <NavLink to="/settings" title={compact ? 'System Settings' : undefined} className={`flex h-11 items-center rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 ${compact ? 'lg:justify-center lg:px-0' : ''}`}>
            <Settings size={19} className="shrink-0" />
            <span className={`ml-3 whitespace-nowrap ${compact ? 'lg:hidden' : ''}`}>System Settings</span>
          </NavLink>}
          <button onClick={() => setLogoutConfirmationOpen(true)} title={compact ? 'Log out' : undefined} className={`flex h-11 w-full items-center rounded-xl px-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 ${compact ? 'lg:justify-center lg:px-0' : ''}`}>
            <LogOut size={19} className="shrink-0" />
            <span className={`ml-3 whitespace-nowrap ${compact ? 'lg:hidden' : ''}`}>Log out</span>
          </button>
          <button onClick={onCompactChange} className="hidden h-10 w-full items-center rounded-xl px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white lg:flex">
            <ChevronLeft size={18} className={`shrink-0 transition-transform ${compact ? 'rotate-180' : ''}`} />
            <span className={`ml-3 whitespace-nowrap ${compact ? 'hidden' : ''}`}>Collapse menu</span>
          </button>
        </div>
      </aside>
      <ConfirmationModal open={logoutConfirmationOpen} title="Logout" description="Are you sure you want to logout?" confirmLabel="Logout" tone="danger" onConfirm={confirmLogout} onCancel={() => setLogoutConfirmationOpen(false)} />
    </>
  )
}
