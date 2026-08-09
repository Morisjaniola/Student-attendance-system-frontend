import { KeyRound, MoreVertical, Pencil, Power, UserCog } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { SystemUser } from '../../types/user'

interface UserActionsMenuProps {
  user: SystemUser
  canUpdate: boolean
  canActivate: boolean
  canAssignRole: boolean
  canResetPassword: boolean
  /** The currently logged-in user cannot be deactivated (lockout guard). */
  canDeactivate: boolean
  busy: boolean
  onEdit: () => void
  onToggleStatus: () => void
  onAssignRole: () => void
  onResetPassword: () => void
}

export function UserActionsMenu({ user, canUpdate, canActivate, canAssignRole, canResetPassword, canDeactivate, busy, onEdit, onToggleStatus, onAssignRole, onResetPassword }: UserActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  // The current user cannot deactivate their own account (lockout guard).
  const showToggle = user.status === 'Active' ? canActivate && canDeactivate : canActivate
  const toggleLabel = user.status === 'Active' ? 'Deactivate' : 'Activate'

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${user.name}`}
        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div role="menu" aria-label={`User actions for ${user.name}`} className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {canUpdate && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onEdit() }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Pencil size={15} className="shrink-0 text-blue-600" />Edit user
            </button>
          )}
          {showToggle && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onToggleStatus() }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Power size={15} className={`shrink-0 ${user.status === 'Active' ? 'text-rose-500' : 'text-emerald-600'}`} />{toggleLabel} user
            </button>
          )}
          {canAssignRole && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onAssignRole() }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <UserCog size={15} className="shrink-0 text-violet-600" />Assign role
            </button>
          )}
          {canResetPassword && (
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onResetPassword() }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <KeyRound size={15} className="shrink-0 text-amber-600" />Reset password
            </button>
          )}
          {!canUpdate && !showToggle && !canAssignRole && !canResetPassword && <p className="px-3 py-2 text-[11px] text-slate-400">No actions available.</p>}
        </div>
      )}
    </div>
  )
}
