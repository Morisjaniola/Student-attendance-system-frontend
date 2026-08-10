import { AtSign, Mail, UserRound } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { UserRole } from '../../types/auth'
import type { UserFormValues, UserStatus } from '../../types/user'
import { fieldClass } from '../../utils/formStyles'

const ROLES: UserRole[] = ['Administrator', 'Faculty', 'Staff']
const STATUSES: UserStatus[] = ['Active', 'Inactive']

interface UserFormFieldsProps {
  register: UseFormRegister<UserFormValues>
  errors: FieldErrors<UserFormValues>
}

export function UserFormFields({ register, errors }: UserFormFieldsProps) {
  const errorText = (message?: string) => message && <p className="mt-1 text-[10px] font-medium text-rose-600">{message}</p>

  return (
    <div className="space-y-4">
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5"><UserRound size={13} />Full name</span>
        <input {...register('name')} autoComplete="name" placeholder="e.g. Juan Dela Cruz" className={`${fieldClass} mt-1.5`} />
        {errorText(errors.name?.message)}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><AtSign size={13} />Username</span>
          <input {...register('username')} autoComplete="username" placeholder="e.g. juan.delacruz" className={`${fieldClass} mt-1.5`} />
          {errorText(errors.username?.message)}
        </label>
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><Mail size={13} />Email</span>
          <input {...register('email')} type="email" autoComplete="email" placeholder="e.g. juan@school.edu" className={`${fieldClass} mt-1.5`} />
          {errorText(errors.email?.message)}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          Role
          <select {...register('role')} className={`${fieldClass} mt-1.5 appearance-none`}>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {errorText(errors.role?.message)}
        </label>
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
          Status
          <select {...register('status')} className={`${fieldClass} mt-1.5 appearance-none`}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {errorText(errors.status?.message)}
        </label>
      </div>
    </div>
  )
}
