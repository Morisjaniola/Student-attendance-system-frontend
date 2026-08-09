import { useEffect, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { useSettingsStore } from '../../stores/settingsStore'

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const themePreference = useSettingsStore((state) => state.themePreference)
  const setThemePreference = useSettingsStore((state) => state.setThemePreference)
  const [systemIsDark, setSystemIsDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const isDark = themePreference === 'Dark' || (themePreference === 'System' && systemIsDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemIsDark(mediaQuery.matches)
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} compact={compact} onCompactChange={() => setCompact((value) => !value)} />
      <div className={`min-h-screen transition-[margin] duration-300 ${compact ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <TopNavbar onMenu={() => setMenuOpen(true)} isDark={isDark} onThemeToggle={() => setThemePreference(isDark ? 'Light' : 'Dark')} />
        <main className="mx-auto w-full max-w-[1700px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
