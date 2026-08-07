import { useEffect, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const [isDark, setIsDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} compact={compact} onCompactChange={() => setCompact((value) => !value)} />
      <div className={`min-h-screen transition-[margin] duration-300 ${compact ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <TopNavbar onMenu={() => setMenuOpen(true)} isDark={isDark} onThemeToggle={() => setIsDark((value) => !value)} />
        <main className="mx-auto w-full max-w-[1700px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
