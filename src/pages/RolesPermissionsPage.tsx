import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, LoaderCircle, Plus, ShieldAlert, ShieldCheck, UsersRound, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ConfirmationModal } from '../components/dialogs/ConfirmationModal'
import { CreateRoleModal } from '../components/roles/CreateRoleModal'
import { EditRoleModal } from '../components/roles/EditRoleModal'
import { RoleFilters } from '../components/roles/RoleFilters'
import { RoleSearch } from '../components/roles/RoleSearch'
import { RoleTable } from '../components/roles/RoleTable'
import { roleService } from '../services/roleService'
import { useRoleStore } from '../stores/roleStore'
import type { RoleFormValues, SystemRole } from '../types/role'

type Notice = { tone: 'success' | 'error'; message: string }

export function RolesPermissionsPage() {
  const queryClient = useQueryClient()
  const { filters, setQuery, setStatus, resetFilters, refreshPermissions } = useRoleStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SystemRole | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SystemRole | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const { data: roles = [], isPending, isError } = useQuery({ queryKey: ['roles'], queryFn: roleService.list, staleTime: Infinity })
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['roles'] }); refreshPermissions() }

  const createMutation = useMutation({ mutationFn: (values: RoleFormValues) => roleService.create(values), onSuccess: async () => { await refresh(); setCreateOpen(false); setNotice({ tone: 'success', message: 'Role created successfully.' }) } })
  const updateMutation = useMutation({ mutationFn: ({ id, values }: { id: string; values: RoleFormValues }) => roleService.update(id, values), onSuccess: async () => { await refresh(); setEditTarget(null); setNotice({ tone: 'success', message: 'Role updated successfully.' }) } })
  const deleteMutation = useMutation({ mutationFn: (id: string) => roleService.remove(id), onSuccess: async () => { await refresh(); setDeleteTarget(null); setNotice({ tone: 'success', message: 'Role deleted successfully.' }) }, onError: (error) => setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to delete role. Please try again.' }) })

  const filteredRoles = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return roles.filter((role) => (!query || [role.name, role.description].some((value) => value.toLowerCase().includes(query))) && (filters.status === 'All' || role.status === filters.status))
  }, [filters.query, filters.status, roles])
  const requestDelete = (role: SystemRole) => {
    if (role.isSystem) { setNotice({ tone: 'error', message: 'System roles cannot be deleted.' }); return }
    setDeleteTarget(role)
  }

  if (isPending) return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading roles and permissions…</p></div>
  if (isError) return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />Roles could not be loaded. Please refresh and try again.</div></div>

  return <div className="space-y-6"><section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Access control</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Roles &amp; Permissions</h1><p className="mt-1.5 text-sm text-slate-500">Manage role access to system modules. Frontend permissions are UI-level controls only.</p></div><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"><UsersRound size={13} />{roles.length} roles</span><span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><ShieldCheck size={13} />{roles.filter((role) => role.isSystem).length} system roles</span><button type="button" onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"><Plus size={15} />Create Role</button></div></section><section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><RoleSearch value={filters.query} onChange={setQuery} onClear={() => setQuery('')} /><p className="text-xs text-slate-400"><span className="font-bold text-slate-600 dark:text-slate-300">{filteredRoles.length}</span> role{filteredRoles.length === 1 ? '' : 's'} found</p></div><RoleFilters filters={filters} onChange={setStatus} onClear={resetFilters} /></section><section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><RoleTable roles={filteredRoles} onEdit={setEditTarget} onDelete={requestDelete} /></section><CreateRoleModal open={createOpen} loading={createMutation.isPending} onSave={createMutation.mutateAsync} onCancel={() => setCreateOpen(false)} /><EditRoleModal role={editTarget} loading={updateMutation.isPending} onSave={(id, values) => updateMutation.mutateAsync({ id, values })} onCancel={() => setEditTarget(null)} /><ConfirmationModal open={Boolean(deleteTarget)} title="Delete role" description={deleteTarget ? <>Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-200">{deleteTarget.name}</span>? This cannot be undone.</> : null} confirmLabel="Delete" tone="danger" loading={deleteMutation.isPending} onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id) }} onCancel={() => setDeleteTarget(null)} />{notice && <div className={`fixed bottom-5 right-5 z-80 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-2xl ${notice.tone === 'success' ? 'bg-slate-900 dark:bg-white dark:text-slate-900' : 'bg-rose-600'}`} role="status">{notice.tone === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <ShieldAlert size={18} className="shrink-0" />}<span className="flex-1">{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification" className="rounded p-1 hover:bg-white/10 dark:hover:bg-slate-100"><X size={15} /></button></div>}</div>
}
