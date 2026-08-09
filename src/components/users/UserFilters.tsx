import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { UserRole } from '../../types/auth'
import type { UserFilters as UserFiltersState, UserStatus } from '../../types/user'

const selectStyle = 'h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'

const ROLES: UserRole[] = ['Administrator', 'Faculty', 'Staff']
const STATUSES: UserStatus[] = ['Active', 'Inactive']

interface UserFiltersProps {
  filters: UserFiltersState
  onChange: <K extends keyof UserFiltersState>(key: K, value: UserFiltersState[K]) => void
  onClear: () => void
}

export function UserFilters({ filters, onChange, onClear }: UserFiltersProps) {
  const activeCount = Number(filters.role !== 'All') + Number(filters.status !== 'All')

  return (
    <details className="group rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-blue-600" />
          Filters
          {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{activeCount}</span>}
        </span>
        <ChevronDown size={16} className="transition group-open:rotate-180" />
      </summary>

      <div className="grid gap-3 border-t border-slate-200 p-4 min-[500px]:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
        <label className="text-[11px] font-semibold text-slate-500">
          Role
          <select name="userFilterRole" value={filters.role} onChange={(event) => onChange('role', event.target.value as UserRole | 'All')} className={`${selectStyle} mt-1.5`} aria-label="Filter by role">
            <option value="All">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>

        <label className="text-[11px] font-semibold text-slate-500">
          Status
          <select name="userFilterStatus" value={filters.status} onChange={(event) => onChange('status', event.target.value as UserStatus | 'All')} className={`${selectStyle} mt-1.5`} aria-label="Filter by status">
            <option value="All">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-blue-600 dark:hover:bg-slate-900"
          >
            <RotateCcw size={14} />Clear filters
          </button>
        </div>
      </div>
    </details>
  )
}
