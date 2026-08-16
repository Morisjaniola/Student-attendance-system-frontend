import { type FormEvent, useState } from 'react'
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSystemSettings } from '../hooks/useSystemSettings'
import { useAuthStore } from '../stores/authStore'

type FieldErrors = Partial<Record<'identifier' | 'password', string>>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { schoolInformation } = useSystemSettings()
  const schoolName = schoolInformation.schoolName || 'Attendly'
  const schoolLogo = schoolInformation.logoUrl
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

  const inputClass = (hasError: boolean) =>
    `h-12 w-full rounded-xl border bg-white pl-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
      hasError
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
        : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-blue-100'
    }`

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Subtle backdrop: soft color washes + faint dot grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.07),transparent_42%),radial-gradient(circle_at_88%_82%,rgba(99,102,241,0.07),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:26px_26px]" />
        <div className="absolute -left-28 top-12 size-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 size-[28rem] rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <section className="relative z-10 grid min-h-screen w-full md:grid-cols-[0.9fr_1.1fr] lg:grid-cols-[1.05fr_0.95fr]">
        {/* ===== LEFT: Branding panel (hidden on small screens) ===== */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 px-10 py-10 text-white md:flex lg:px-14 xl:px-16">
          {/* Decorative layers */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-28 -top-28 size-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-36 -left-24 size-[28rem] rounded-full bg-indigo-400/30 blur-3xl" />
            <div className="absolute right-8 top-1/3 size-44 rounded-full border border-white/10" />
            <div className="absolute -right-10 bottom-1/4 size-28 rounded-full border border-white/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:22px_22px]" />
          </div>

          {/* Brand */}
          <header className="relative flex items-center gap-3.5">
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/15 shadow-lg shadow-blue-950/20 ring-1 ring-white/25 backdrop-blur">
              {schoolLogo ? <img src={schoolLogo} alt="" className="size-full object-cover" /> : <GraduationCap size={26} aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-bold leading-tight tracking-tight">{schoolName}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/90">
                Student Attendance Monitoring System
              </p>
            </div>
          </header>

          {/* Hero copy + attendance preview */}
          <div className="relative py-12">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-50 ring-1 ring-white/20 backdrop-blur">
              <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
              School management portal
            </p>

            <h1 className="mt-6 max-w-md text-4xl font-bold leading-[1.12] tracking-tight lg:text-[2.6rem]">
              Every student, every class, every day.
            </h1>

            <p className="mt-5 max-w-sm text-[15px] leading-7 text-blue-100/90">
              Manage student attendance, monitor records, and keep your school operations organized in one secure
              platform.
            </p>

            {/* Subtle attendance preview card */}
            <div className="relative mt-10 max-w-sm rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100/80">
                    Today&apos;s attendance
                  </p>
                  <p className="mt-1.5 flex items-baseline gap-1 text-3xl font-bold tracking-tight">
                    96.4<span className="text-lg font-semibold text-blue-100">%</span>
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-200 ring-1 ring-emerald-300/20">
                  <TrendingUp size={12} aria-hidden="true" />
                  2.1%
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
                <div className="h-full w-[96.4%] rounded-full bg-linear-to-r from-sky-300 to-emerald-300" />
              </div>
              <p className="mt-3 text-[11px] leading-4 text-blue-100/70">
                1,284 of 1,331 students marked present today
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="relative flex items-center gap-2 text-[13px] font-medium text-blue-100/90">
            <ShieldCheck size={16} className="shrink-0" aria-hidden="true" />
            Authorized school access
          </footer>
        </aside>

        {/* ===== RIGHT: Login form ===== */}
        <div className="flex w-full items-center justify-center px-4 py-10 sm:px-8 md:px-10 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile-only brand header */}
            <div className="mb-10 flex flex-col items-center text-center md:hidden">
              <div className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                {schoolLogo ? <img src={schoolLogo} alt="" className="size-full object-cover" /> : <GraduationCap size={26} aria-hidden="true" />}
              </div>
              <p className="mt-3 truncate text-lg font-bold tracking-tight">{schoolName}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Student Attendance Monitoring System
              </p>
            </div>

            {/* Heading */}
            <div>
              <p className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                <span className="h-px w-6 bg-blue-600/60" aria-hidden="true" />
                Attendance Portal
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue to your attendance management dashboard.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
              {submitError && (
                <div
                  className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                  role="alert"
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label htmlFor="identifier" className="mb-2 block text-sm font-semibold text-slate-700">
                  Username or Email
                </label>
                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value)
                      setErrors((current) => ({ ...current, identifier: undefined }))
                    }}
                    aria-invalid={Boolean(errors.identifier)}
                    aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                    className={`${inputClass(Boolean(errors.identifier))} pr-4`}
                    placeholder="Enter your username or email"
                  />
                </div>
                {errors.identifier && (
                  <p id="identifier-error" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                    {errors.identifier}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setErrors((current) => ({ ...current, password: undefined }))
                    }}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={`${inputClass(Boolean(errors.password))} pr-12`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="peer sr-only"
                />
                <span
                  className="grid size-5 shrink-0 place-items-center rounded-md border border-slate-300 bg-white text-transparent transition peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600/50 peer-focus-visible:ring-offset-2"
                  aria-hidden="true"
                >
                  <Check size={13} strokeWidth={3.5} />
                </span>
                Remember me on this device
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <LockKeyhole size={13} aria-hidden="true" />
              Authorized school access
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
