import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ScanLine,
  Settings,
  UsersRound,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
  compact: boolean
  onCompactChange: () => void
}

const primaryLinks = [
  { label: 'Overview', icon: LayoutDashboard, to: '/' },
  { label: 'Students', icon: UsersRound, to: '/students' },
  { label: 'Live Scanning', icon: ScanLine, to: '/scanning' },
  { label: 'Attendance', icon: CalendarDays, to: '/attendance' },
  { label: 'Reports', icon: BarChart3, to: '/reports' },
]

export function Sidebar({ open, onClose, compact, onCompactChange }: SidebarProps) {
  return (
    <>
      <button
        className={`fixed inset-0 z-30 bg-slate-950/35 lg:hidden ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
        aria-label="Close navigation"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-slate-200/75 bg-white/95 px-3 py-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-[width,transform] duration-300 dark:border-slate-800 dark:bg-slate-950/95 lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${compact ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        <div className="flex h-11 items-center justify-between px-2">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden" aria-label="Attendly dashboard">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <GraduationCap size={21} strokeWidth={2.3} />
            </span>
            <span className={`whitespace-nowrap text-lg font-bold tracking-tight text-slate-900 dark:text-white ${compact ? 'lg:hidden' : ''}`}>Attendly</span>
          </NavLink>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-9 space-y-1" aria-label="Primary navigation">
          {!compact && <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>}
          {primaryLinks.map(({ label, icon: Icon, to }) => (
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
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-100 pt-4 dark:border-slate-800">
          <NavLink to="/records" title={compact ? 'Attendance Records' : undefined} className={`flex h-11 items-center rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 ${compact ? 'lg:justify-center lg:px-0' : ''}`}>
            <FileText size={19} className="shrink-0" />
            <span className={`ml-3 whitespace-nowrap ${compact ? 'lg:hidden' : ''}`}>Attendance Records</span>
          </NavLink>
          <NavLink to="/settings" title={compact ? 'Settings' : undefined} className={`flex h-11 items-center rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100 ${compact ? 'lg:justify-center lg:px-0' : ''}`}>
            <Settings size={19} className="shrink-0" />
            <span className={`ml-3 whitespace-nowrap ${compact ? 'lg:hidden' : ''}`}>Settings</span>
          </NavLink>
          <button onClick={onCompactChange} className="hidden h-10 w-full items-center rounded-xl px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white lg:flex">
            <ChevronLeft size={18} className={`shrink-0 transition-transform ${compact ? 'rotate-180' : ''}`} />
            <span className={`ml-3 whitespace-nowrap ${compact ? 'hidden' : ''}`}>Collapse menu</span>
          </button>
        </div>
      </aside>
    </>
  )
}
