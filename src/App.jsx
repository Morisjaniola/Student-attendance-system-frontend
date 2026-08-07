import { useEffect, useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="login-page">
      <div className="glow glow-1" aria-hidden="true" />
      <div className="glow glow-2" aria-hidden="true" />

      <main className="login-card">
        <section className="brand-panel">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              F
            </span>
            <span className="brand-name">freebuff</span>
          </div>

          <div className="brand-copy">
            <h1>Welcome back</h1>
            <p>
              Sign in to your workspace and pick up right where you left off.
            </p>
          </div>

          <ul className="brand-features">
            <li>
              <CheckIcon /> Real-time collaborative editing
            </li>
            <li>
              <CheckIcon /> Enterprise-grade security
            </li>
            <li>
              <CheckIcon /> 99.9% uptime, guaranteed
            </li>
          </ul>

          <p className="brand-foot">© 2026 Freebuff Labs</p>
        </section>

        <section className="form-panel">
          <LoginForm />
        </section>
      </main>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [capsLock, setCapsLock] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success
  const [demoNote, setDemoNote] = useState('')

  useEffect(() => {
    if (status !== 'success') return
    const t = setTimeout(() => setStatus('idle'), 3200)
    return () => clearTimeout(t)
  }, [status])

  function validate() {
    const next = {}
    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address'
    }
    if (!password) {
      next.password = 'Password is required'
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (status !== 'idle' || !validate()) return
    setStatus('loading')
    // Mock authentication — replace with a real API call.
    setTimeout(() => setStatus('success'), 1400)
  }

  function handleKeyDown(e) {
    if ('getModifierState' in e) {
      setCapsLock(e.getModifierState('CapsLock'))
    }
  }

  return (
    <div className="form-wrap">
      <header className="form-head">
        <h2>Sign in</h2>
        <p>Use your email or a social account to continue.</p>
      </header>

      <div className="social-row">
        <button
          type="button"
          className="social-btn"
          disabled={status !== 'idle'}
          onClick={() =>
            setDemoNote(
              'Social sign-in isn\u2019t wired up in this demo \u2014 use the email form instead.',
            )
          }
        >
          <GoogleIcon /> Google
        </button>
        <button
          type="button"
          className="social-btn"
          disabled={status !== 'idle'}
          onClick={() =>
            setDemoNote(
              'Social sign-in isn\u2019t wired up in this demo \u2014 use the email form instead.',
            )
          }
        >
          <GitHubIcon /> GitHub
        </button>
      </div>

      <div className="divider">
        <span>or continue with email</span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className={`field ${errors.email ? 'field-error' : ''}`}>
          <label htmlFor="email">Email</label>
          <div className="input-wrap">
            <MailIcon />
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              disabled={status !== 'idle'}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p className="field-msg" id="email-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className={`field ${errors.password ? 'field-error' : ''}`}>
          <div className="label-row">
            <label htmlFor="password">Password</label>
            <a
              className="forgot-link"
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault()
                setDemoNote(
                  'Password reset isn\u2019t wired up in this demo \u2014 try demo@freebuff.com with any password.',
                )
              }}
            >
              Forgot password?
            </a>
          </div>
          <div className="input-wrap">
            <LockIcon />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: '' }))
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => setCapsLock(false)}
              disabled={status !== 'idle'}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {capsLock && (
            <p className="field-msg caps-hint">
              <CapsIcon /> Caps Lock is on
            </p>
          )}
          {errors.password && (
            <p className="field-msg" id="password-error" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="checkmark" aria-hidden="true">
            <CheckIcon />
          </span>
          Keep me signed in
        </label>

        <button
          type="submit"
          className={`submit-btn ${status === 'success' ? 'is-success' : ''}`}
          disabled={status !== 'idle'}
        >
          {status === 'loading' ? (
            <>
              <span className="spinner" aria-hidden="true" /> Signing in…
            </>
          ) : status === 'success' ? (
            <>
              <CheckIcon /> Welcome back!
            </>
          ) : (
            'Sign in'
          )}
        </button>

        {status === 'success' && (
          <p className="success-note" role="status">
            You&apos;re signed in. This demo doesn&apos;t call a real API.
          </p>
        )}

        {demoNote && (
          <p className="demo-note" role="status">
            {demoNote}
          </p>
        )}
      </form>

      <p className="signup-prompt">
        Don&apos;t have an account?{' '}
        <a
          href="#create-account"
          onClick={(e) => {
            e.preventDefault()
            setDemoNote(
              'Account creation isn\u2019t wired up in this demo \u2014 just sign in with demo@freebuff.com.',
            )
          }}
        >
          Create one
        </a>
      </p>
      <p className="demo-hint">
        Demo login: <code>demo@freebuff.com</code> + any password
      </p>
    </div>
  )
}

/* ---------- Icons ---------- */

function CheckIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 8 10 8a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="m2 2 20 20" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  )
}

function CapsIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 16 6-9 6 9" />
      <path d="M4 20h16" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="icon brand-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.97 11.97 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="icon brand-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.23v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .3Z"
      />
    </svg>
  )
}

export default App
