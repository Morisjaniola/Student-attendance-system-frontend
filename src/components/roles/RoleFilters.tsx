import { RotateCcw } from 'lucide-react'
import type { RoleFilters as RoleFiltersState } from '../../types/role'

interface RoleFiltersProps { filters: RoleFiltersState; onChange: (status: RoleFiltersState['status']) => void; onClear: () => void }

export function RoleFilters({ filters, onChange, onClear }: RoleFiltersProps) {
  return <div className="flex flex-wrap items-center gap-2"><label className="text-[11px] font-semibold text-slate-500">Status<select value={filters.status} onChange={(event) => onChange(event.target.value as RoleFiltersState['status'])} className="ml-2 h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300" aria-label="Filter roles by status"><option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label><button type="button" onClick={onClear} className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"><RotateCcw size={14} />Clear Filters</button></div>
}
