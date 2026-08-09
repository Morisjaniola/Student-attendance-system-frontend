import { AlertCircle, LoaderCircle, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { RoleFormValues } from '../../types/role'
import { RoleFormFields } from './RoleFormFields'

const emptyRole = (): RoleFormValues => ({ name: '', description: '', status: 'Active', permissions: [] })
interface CreateRoleModalProps { open: boolean; loading: boolean; onSave: (values: RoleFormValues) => Promise<unknown>; onCancel: () => void }

export function CreateRoleModal({ open, loading, onSave, onCancel }: CreateRoleModalProps) {
  const [value, setValue] = useState<RoleFormValues>(emptyRole)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (open) { setValue(emptyRole()); setError(null) } }, [open])
  if (!open) return null
  const submit = async () => { setError(null); try { await onSave(value) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create role. Please try again.') } }
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="create-role-title" className="mx-auto my-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 sm:my-10"><header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6"><div><h2 id="create-role-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Plus size={19} className="text-blue-600" />Create Role</h2><p className="mt-1 text-xs text-slate-400">Add a custom role, then assign its permissions.</p></div><button type="button" onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close create role dialog"><X size={19} /></button></header><div className="p-5 sm:p-6"><RoleFormFields value={value} systemRole={false} onChange={setValue} />{error && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle size={15} />{error}</p>}<footer className="mt-6 flex justify-end gap-2"><button type="button" onClick={onCancel} disabled={loading} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button><button type="button" onClick={submit} disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60">{loading && <LoaderCircle size={14} className="animate-spin" />}{loading ? 'Creating…' : 'Create Role'}</button></footer></div></section></div>
}
