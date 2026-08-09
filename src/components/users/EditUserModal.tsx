import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, LoaderCircle, Pencil, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { SystemUser, UserFormValues } from '../../types/user'
import { initials } from '../../utils/format'
import { UserFormFields } from './UserFormFields'

const editSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required.'),
  username: z.string().trim().min(2, 'Username is required.'),
  email: z.string().trim().min(1, 'Email is required.').regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'),
  role: z.enum(['Administrator', 'Faculty', 'Staff']),
  status: z.enum(['Active', 'Inactive']),
})

interface EditUserModalProps {
  open: boolean
  user: SystemUser | null
  loading: boolean
  onSave: (id: string, values: UserFormValues) => Promise<unknown>
  onCancel: () => void
}

export function EditUserModal({ open, user, loading, onSave, onCancel }: EditUserModalProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<UserFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: '', username: '', email: '', role: 'Staff', status: 'Active' },
  })

  useEffect(() => {
    if (open && user) {
      form.reset({ name: user.name, username: user.username, email: user.email, role: user.role, status: user.status })
      setServerError(null)
    }
  }, [form, open, user])

  if (!open || !user) return null

  const submit = async (values: UserFormValues) => {
    setServerError(null)
    try {
      await onSave(user.id, values)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Unable to update the user account. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="edit-user-title" className="mx-auto min-h-full w-full max-w-lg bg-white shadow-2xl dark:bg-slate-900 sm:min-h-0 sm:rounded-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h2 id="edit-user-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Pencil size={18} className="text-blue-600" />Edit user account</h2>
            <p className="mt-1 text-xs text-slate-400">Update {user.name}&rsquo;s account details.</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close edit user dialog">
            <X size={19} />
          </button>
        </header>

        <form onSubmit={form.handleSubmit(submit)} className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
            <span className={`grid size-9 place-items-center rounded-xl text-[10px] font-bold ${user.avatarColor}`}>{initials(user.name)}</span>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
              <p className="text-[11px] text-slate-400">User ID {user.id}</p>
            </div>
          </div>

          <UserFormFields register={form.register} errors={form.formState.errors} />

          {serverError && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle size={15} className="shrink-0" />{serverError}
            </p>
          )}

          <footer className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
              {loading && <LoaderCircle size={14} className="animate-spin" />}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
