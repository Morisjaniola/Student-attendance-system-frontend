import { Bell, ChevronDown, Menu, Moon, Search, Sun } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { GlobalSearch } from '../search/GlobalSearch'

interface TopNavbarProps {
  onMenu: () => void
  isDark: boolean
  onThemeToggle: () => void
}

export function TopNavbar({ onMenu, isDark, onThemeToggle }: TopNavbarProps) {
  const user = useAuthStore((state) => state.user)
  const initials = user?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? 'AD'

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/75 bg-slate-50/80 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="grid size-10 place-items-center rounded-xl text-slate-600 hover:bg-white hover:shadow-sm lg:hidden dark:text-slate-300 dark:hover:bg-slate-900" aria-label="Open navigation">
          <Menu size={21} />
        </button>
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
        <button className="relative grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white" aria-label="Open notifications">
          <Bell size={19} />
          <span className="absolute right-2.5 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-slate-50 dark:ring-slate-950" />
        </button>
        <button className="ml-1 flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white hover:shadow-sm dark:hover:bg-slate-900" aria-label="Open profile menu">
          <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">{initials}</span>
          <span className="hidden text-left sm:block"><span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.name ?? 'Administrator'}</span><span className="block text-[11px] text-slate-400">{user?.role ?? 'Administrator'}</span></span>
          <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  )
}
