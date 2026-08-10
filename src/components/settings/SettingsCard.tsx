import type { ReactNode } from 'react'
import { LoaderCircle, Save } from 'lucide-react'

interface SettingsCardProps {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
  onSave: () => void
  saving: boolean
  saveLabel?: string
}

export function SettingsCard({ title, description, icon, children, onSave, saving, saveLabel = 'Save changes' }: SettingsCardProps) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">{icon}</span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </header>
      <div className="flex-1 px-5 py-2 sm:px-6">{children}</div>
      <footer className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/30 sm:px-6">
        <button type="button" onClick={onSave} disabled={saving} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
          {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}{saving ? 'Saving…' : saveLabel}
        </button>
      </footer>
    </section>
  )
}
