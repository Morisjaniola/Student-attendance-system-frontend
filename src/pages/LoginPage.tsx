import { type FormEvent, useState } from 'react'
import { Eye, EyeOff, GraduationCap, LoaderCircle, LockKeyhole, UserRound } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

type FieldErrors = Partial<Record<'identifier' | 'password', string>>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, login } = useAuthStore()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const requestedPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
  const destination = requestedPath && requestedPath !== '/login' ? requestedPath : '/dashboard'

  if (isAuthenticated && user) return <Navigate to={destination} replace />

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {}
    if (!identifier.trim()) nextErrors.identifier = 'Username or email is required.'
    if (!password) nextErrors.password = 'Password is required.'
    else if (password.length < 6) nextErrors.password = 'Password must contain at least 6 characters.'
    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length) return

    setIsLoading(true)
    try {
      await login({ identifier, password }, rememberMe)
      navigate(destination, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:place-items-center lg:p-10">
      <div className="absolute -left-28 top-0 size-80 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -right-20 size-96 rounded-full bg-sky-100/80 blur-3xl" aria-hidden="true" />

      <section className="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.05fr_.95fr]">
        <div className="hidden flex-col justify-between bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white lg:flex">
          <div>
            <div className="grid size-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <GraduationCap size={31} aria-hidden="true" />
            </div>
            <p className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">School management portal</p>
            <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight">Student Attendance Monitoring System</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-blue-100">Securely manage attendance records and student information from one place.</p>
          </div>
          <p className="text-sm text-blue-100">Authorized staff access</p>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="lg:hidden">
            <div className="grid size-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <GraduationCap size={26} aria-hidden="true" />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Student Attendance Monitoring System</p>
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="text-sm font-semibold text-blue-600">Attendance portal</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue to your attendance management dashboard.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            {submitError && <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">{submitError}</div>}

            <div>
              <label htmlFor="identifier" className="mb-2 block text-sm font-semibold text-slate-700">Username or Email</label>
              <div className="relative">
                <UserRound size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={identifier}
                  onChange={(event) => { setIdentifier(event.target.value); setErrors((current) => ({ ...current, identifier: undefined })) }}
                  aria-invalid={Boolean(errors.identifier)}
                  aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                  className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 ${errors.identifier ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'}`}
                  placeholder="Enter your username or email"
                />
              </div>
              {errors.identifier && <p id="identifier-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">{errors.identifier}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <LockKeyhole size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })) }}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'}`}
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">{errors.password}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
              Remember me on this device
            </label>

            <button type="submit" disabled={isLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-70">
              {isLoading && <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />}
              {isLoading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="mt-7 text-center text-[11px] leading-4 text-slate-400">Use your authorized school account to access the attendance dashboard.</p>
        </div>
      </section>
    </main>
  )
}
