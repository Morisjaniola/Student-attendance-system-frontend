import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Moon, Search, Sun } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationsUnreadCount } from '../../hooks/useNotificationsUnreadCount'
import { useSystemSettings } from '../../hooks/useSystemSettings'
import { GlobalSearch } from '../search/GlobalSearch'
import { ConfirmationModal } from '../dialogs/ConfirmationModal'

interface TopNavbarProps {
  onMenu: () => void
  isDark: boolean
  onThemeToggle: () => void
}

export function TopNavbar({ onMenu, isDark, onThemeToggle }: TopNavbarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const notificationsEnabled = useSystemSettings((settings) => settings.notifications.notificationsEnabled)
  const unreadCount = useNotificationsUnreadCount()
  const showNotificationDot = notificationsEnabled && unreadCount > 0
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const { schoolName: schoolNameSetting, logoUrl: schoolLogo } = useSystemSettings((settings) => settings.schoolInformation)
  const schoolName = schoolNameSetting || 'Attendly'
  const initials = user?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? 'AD'

  const confirmLogout = () => {
    logout()
    setLogoutConfirmOpen(false)
    setProfileOpen(false)
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!profileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [profileOpen])

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/75 bg-slate-50/80 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="grid size-10 place-items-center rounded-xl text-slate-600 hover:bg-white hover:shadow-sm lg:hidden dark:text-slate-300 dark:hover:bg-slate-900" aria-label="Open navigation">
          <Menu size={21} />
        </button>
        <span className="flex min-w-0 items-center gap-2 md:hidden">
          {schoolLogo ? <img src={schoolLogo} alt="" className="size-7 shrink-0 rounded-lg object-cover" /> : <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-600 text-[10px] font-bold text-white">{schoolName.slice(0, 2).toUpperCase()}</span>}
          <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{schoolName}</span>
        </span>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-400 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-600/10 sm:flex dark:border-slate-800 dark:bg-slate-900">
          <Search size={17} />
          <GlobalSearch />
          <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 xl:block dark:border-slate-700 dark:bg-slate-800">⌘ K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button onClick={onThemeToggle} className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" aria-label={isDark ? 'Use light mode' : 'Use dark mode'}>
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <button onClick={() => navigate('/notifications')} className="relative grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" aria-label="Open notifications">
          <Bell size={19} />
          {showNotificationDot && <span className="absolute right-2.5 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-slate-50 dark:ring-slate-950" />}
        </button>
        <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setProfileOpen(false) }}>
          <button
            onClick={() => setProfileOpen((value) => !value)}
            className="ml-1 flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white hover:shadow-sm dark:hover:bg-slate-900"
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">{initials}</span>
            <span className="hidden text-left sm:block"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.name ?? 'Administrator'}</span><span className="block text-[11px] text-slate-400">{user?.role ?? 'Administrator'}</span></span>
            <ChevronDown size={15} className={`hidden text-slate-400 transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`} />
          </button>
          {profileOpen && (
            <div role="menu" aria-label="User menu" className="absolute right-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user?.name ?? 'Administrator'}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">{user?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5"><span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{user?.role ?? 'Administrator'}</span><span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{schoolName}</span></div>
              </div>
              <button role="menuitem" onClick={() => { setProfileOpen(false); setLogoutConfirmOpen(true) }} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
                <LogOut size={14} />Log out
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal open={logoutConfirmOpen} title="Logout" description="Are you sure you want to logout?" confirmLabel="Logout" tone="danger" onConfirm={confirmLogout} onCancel={() => setLogoutConfirmOpen(false)} />
    </header>
  )
}
