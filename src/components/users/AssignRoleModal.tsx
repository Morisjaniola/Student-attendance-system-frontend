import { AlertCircle, GraduationCap, LoaderCircle, ShieldCheck, UserCog, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { UserRole } from '../../types/auth'
import type { SystemUser } from '../../types/user'
import { UserRoleBadge } from './UserBadges'

const ROLE_OPTIONS: { role: UserRole; description: string; icon: typeof ShieldCheck }[] = [
  { role: 'Administrator', description: 'Full system management access according to the project RBAC.', icon: ShieldCheck },
  { role: 'Faculty', description: 'Attendance and student-related access according to assigned permissions.', icon: GraduationCap },
  { role: 'Staff', description: 'System functions according to assigned permissions.', icon: UserRound },
]

interface AssignRoleModalProps {
  open: boolean
  user: SystemUser | null
  loading: boolean
  onSave: (id: string, role: UserRole) => Promise<unknown>
  onCancel: () => void
}

export function AssignRoleModal({ open, user, loading, onSave, onCancel }: AssignRoleModalProps) {
  const [selected, setSelected] = useState<UserRole>('Staff')
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (open && user) {
      setSelected(user.role)
      setServerError(null)
    }
  }, [open, user])

  if (!open || !user) return null

  const submit = async () => {
    setServerError(null)
    try {
      await onSave(user.id, selected)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to update the role. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="assign-role-title" className="mx-auto min-h-full w-full max-w-md bg-white shadow-2xl dark:bg-slate-900 sm:min-h-0 sm:rounded-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h2 id="assign-role-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><UserCog size={19} className="text-violet-600" />Assign role</h2>
            <p className="mt-1 text-xs text-slate-400">Set the role for {user.name}.</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close assign role dialog">
            <X size={19} />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
              <p className="text-[11px] text-slate-400">Current role</p>
            </div>
            <UserRoleBadge role={user.role} />
          </div>

          <div role="radiogroup" aria-label="User role" className="space-y-2">
            {ROLE_OPTIONS.map(({ role, description, icon: Icon }) => {
              const isSelected = selected === role
              return (
                <button
                  key={role}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(role)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                    isSelected ? 'border-blue-400 bg-blue-50/60 ring-4 ring-blue-600/10 dark:border-blue-500 dark:bg-blue-500/10' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>{role}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">{description}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {serverError && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle size={15} className="shrink-0" />{serverError}
            </p>
          )}

          <footer className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="button" onClick={submit} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
              {loading && <LoaderCircle size={14} className="animate-spin" />}
              {loading ? 'Saving…' : 'Save Role'}
            </button>
          </footer>
        </div>
      </section>
    </div>
  )
}
