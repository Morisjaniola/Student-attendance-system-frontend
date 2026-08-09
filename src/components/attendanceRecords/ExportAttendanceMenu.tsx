import { ChevronDown, FileDown, FileSpreadsheet, FileText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ExportAttendanceMenuProps {
  /** Disabled when there are no filtered records to export. */
  disabled: boolean
  onExportExcel: () => void
  onExportPDF: () => void
}

export function ExportAttendanceMenu({ disabled, onExportExcel, onExportPDF }: ExportAttendanceMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <FileDown size={16} className="text-blue-600" />
        Export
        <ChevronDown size={14} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" aria-label="Export attendance records" className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onExportExcel() }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FileSpreadsheet size={16} className="shrink-0 text-emerald-600" />
            <span>
              <span className="block">Excel (.xlsx)</span>
              <span className="mt-0.5 block text-[10px] font-normal text-slate-400">Spreadsheet with the current results</span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onExportPDF() }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FileText size={16} className="shrink-0 text-rose-600" />
            <span>
              <span className="block">PDF (.pdf)</span>
              <span className="mt-0.5 block text-[10px] font-normal text-slate-400">Print-ready report of the current results</span>
            </span>
          </button>
          <p className="px-3 pb-1.5 pt-1 text-[10px] text-slate-400">Exports the filtered/search results, not the full dataset.</p>
        </div>
      )}
    </div>
  )
}
