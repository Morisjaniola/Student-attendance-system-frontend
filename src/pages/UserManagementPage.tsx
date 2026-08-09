import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, LoaderCircle, ShieldAlert, UserPlus, UsersRound, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AssignRoleModal } from '../components/users/AssignRoleModal'
import { CreateUserModal } from '../components/users/CreateUserModal'
import { EditUserModal } from '../components/users/EditUserModal'
import { UserFilters } from '../components/users/UserFilters'
import { UserSearch } from '../components/users/UserSearch'
import { UserTable } from '../components/users/UserTable'
import { ConfirmationModal } from '../components/dialogs/ConfirmationModal'
import { Pagination } from '../components/tables/Pagination'
import { canPerformUserAction, userService } from '../services/userService'
import { useAuthStore } from '../stores/authStore'
import { useUserStore } from '../stores/userStore'
import type { SystemUser, UserFormValues, UserStatus } from '../types/user'

export function UserManagementPage() {
  const queryClient = useQueryClient()
  const { filters, setQuery, setFilter, resetFilters } = useUserStore()
  const authUser = useAuthStore((state) => state.user)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SystemUser | null>(null)
  const [roleTarget, setRoleTarget] = useState<SystemUser | null>(null)
  const [statusTarget, setStatusTarget] = useState<SystemUser | null>(null)
  const [resetTarget, setResetTarget] = useState<SystemUser | null>(null)
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const canCreate = canPerformUserAction(authUser, 'users.create')
  const canUpdate = canPerformUserAction(authUser, 'users.update')
  const canActivate = canPerformUserAction(authUser, 'users.activate')
  const canAssignRole = canPerformUserAction(authUser, 'users.assignRole')
  const canResetPassword = canPerformUserAction(authUser, 'users.resetPassword')

  const { data: users = [], isPending, isError } = useQuery({ queryKey: ['users'], queryFn: userService.list, staleTime: Infinity })

  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['users'] }) }

  // The create/edit/role modals render validation errors inline, so they have
  // no onError toast (avoids showing the same message twice).
  const createMutation = useMutation({
    mutationFn: (values: UserFormValues) => userService.create(values),
    onSuccess: async () => { await refresh(); setCreateOpen(false); setNotice({ message: 'User account created successfully.', tone: 'success' }) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UserFormValues }) => userService.update(id, values),
    onSuccess: async () => { await refresh(); setEditTarget(null); setNotice({ message: 'User account updated successfully.', tone: 'success' }) },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => userService.setStatus(id, status),
    onSuccess: async () => { await refresh(); setStatusTarget(null); setNotice({ message: 'User account status updated successfully.', tone: 'success' }) },
    onError: (error) => setNotice({ message: error instanceof Error ? error.message : 'Unable to update the account status. Please try again.', tone: 'error' }),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: SystemUser['role'] }) => userService.assignRole(id, role),
    onSuccess: async () => { await refresh(); setRoleTarget(null); setNotice({ message: 'User role assigned successfully.', tone: 'success' }) },
  })

  const resetMutation = useMutation({
    mutationFn: (id: string) => userService.resetPassword(id),
    onSuccess: async () => { await refresh(); setResetTarget(null); setNotice({ message: 'Password reset successfully.', tone: 'success' }) },
    onError: (error) => setNotice({ message: error instanceof Error ? error.message : 'Unable to reset the password. Please try again.', tone: 'error' }),
  })

  // Search + filters work together (sections 11, 12).
  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return users.filter((user) => {
      const matchesQuery = !query || [user.id, user.name, user.username, user.email].some((value) => value.toLowerCase().includes(query))
      const matchesRole = filters.role === 'All' || user.role === filters.role
      const matchesStatus = filters.status === 'All' || user.status === filters.status
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [filters.query, filters.role, filters.status, users])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(pageIndex, pageCount - 1)
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize)

  // Reset to the first page whenever search or filters change.
  useEffect(() => { setPageIndex(0) }, [filters.query, filters.role, filters.status])

  const activeCount = users.filter((user) => user.status === 'Active').length
  const adminCount = users.filter((user) => user.role === 'Administrator').length

  const busyUserId = statusMutation.isPending ? statusMutation.variables?.id : resetMutation.isPending ? resetMutation.variables : roleMutation.isPending ? roleMutation.variables?.id : null

  if (isPending) {
    return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading user accounts…</p></div>
  }

  if (isError) {
    return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />User accounts could not be loaded. Please refresh and try again.</div></div>
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">System accounts</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">User Management</h1>
          <p className="mt-1.5 text-sm text-slate-500">Manage administrator, faculty, and staff system accounts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-500" />{users.length} accounts
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />{activeCount} active
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            <UsersRound size={12} />{adminCount} administrators
          </span>
          {canCreate && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <UserPlus size={15} />Create User
            </button>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <UserSearch value={filters.query} onChange={setQuery} onClear={() => setQuery('')} />
          <p className="text-xs text-slate-400">
            <span className="font-bold text-slate-600 dark:text-slate-300">{filtered.length}</span> user{filtered.length === 1 ? '' : 's'} found
          </p>
        </div>
        <UserFilters filters={filters} onChange={setFilter} onClear={resetFilters} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <UserTable
          users={visible}
          currentUserId={authUser?.id ?? null}
          canUpdate={canUpdate}
          canActivate={canActivate}
          canAssignRole={canAssignRole}
          canResetPassword={canResetPassword}
          busyUserId={busyUserId}
          onEdit={setEditTarget}
          onToggleStatus={setStatusTarget}
          onAssignRole={setRoleTarget}
          onResetPassword={setResetTarget}
        />
        {filtered.length > pageSize && (
          <Pagination
            pageIndex={safePage}
            pageCount={pageCount}
            pageSize={pageSize}
            rowCount={filtered.length}
            label="users"
            onPrevious={() => setPageIndex((value) => Math.max(0, value - 1))}
            onNext={() => setPageIndex((value) => Math.min(pageCount - 1, value + 1))}
            onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }}
          />
        )}
      </section>

      <CreateUserModal open={createOpen} loading={createMutation.isPending} onSave={createMutation.mutateAsync} onCancel={() => setCreateOpen(false)} />

      <EditUserModal
        open={Boolean(editTarget)}
        user={editTarget}
        loading={updateMutation.isPending}
        onSave={(id, values) => updateMutation.mutateAsync({ id, values })}
        onCancel={() => setEditTarget(null)}
      />

      <AssignRoleModal
        open={Boolean(roleTarget)}
        user={roleTarget}
        loading={roleMutation.isPending}
        onSave={(id, role) => roleMutation.mutateAsync({ id, role })}
        onCancel={() => setRoleTarget(null)}
      />

      <ConfirmationModal
        open={Boolean(statusTarget)}
        title={statusTarget?.status === 'Active' ? 'Deactivate user' : 'Activate user'}
        description={
          statusTarget ? (
            <>
              Are you sure you want to {statusTarget.status === 'Active' ? 'deactivate' : 'activate'} this user?{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{statusTarget.name}</span>
              {statusTarget.status === 'Active' ? ' will no longer be able to sign in.' : ' will regain sign-in access.'} The account will not be deleted.
            </>
          ) : null
        }
        confirmLabel={statusTarget?.status === 'Active' ? 'Deactivate' : 'Activate'}
        tone="danger"
        loading={statusMutation.isPending}
        onConfirm={() => {
          if (statusTarget) statusMutation.mutate({ id: statusTarget.id, status: statusTarget.status === 'Active' ? 'Inactive' : 'Active' })
        }}
        onCancel={() => setStatusTarget(null)}
      />

      <ConfirmationModal
        open={Boolean(resetTarget)}
        title="Reset password"
        description={
          resetTarget ? (
            <>
              Are you sure you want to reset this user&rsquo;s password? <span className="font-semibold text-slate-700 dark:text-slate-200">{resetTarget.name}</span> will need to use the password reset flow on their next sign-in.
            </>
          ) : null
        }
        confirmLabel="Reset Password"
        tone="primary"
        loading={resetMutation.isPending}
        onConfirm={() => { if (resetTarget) resetMutation.mutate(resetTarget.id) }}
        onCancel={() => setResetTarget(null)}
      />

      {notice && (
        <div className={`fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-2xl ${notice.tone === 'success' ? 'bg-slate-900 dark:bg-white dark:text-slate-900' : 'bg-rose-600'}`} role="status">
          {notice.tone === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <ShieldAlert size={18} className="shrink-0 text-white" />}
          <span className="flex-1">{notice.message}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss notification" className="rounded p-1 hover:bg-white/10 dark:hover:bg-slate-100">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
