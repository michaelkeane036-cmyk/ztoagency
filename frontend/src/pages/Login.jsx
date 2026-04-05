import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [tab,      setTab]      = useState('login')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [fieldErrs,setFieldErrs]= useState({})

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd,   setLoginPwd]   = useState('')

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pwd,     setPwd]     = useState('')
  const [confirm, setConfirm] = useState('')

  const { user, login, signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || null

  useEffect(() => {
    if (user) redirect(user.role)
  }, [user])

  function redirect(role) {
    if (next) { window.location.href = next; return }
    navigate(role === 'admin' ? '/admin' : '/portal', { replace: true })
  }

  function switchTab(t) {
    setTab(t); setError(''); setSuccess(''); setFieldErrs({})
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const u = await login(loginEmail, loginPwd)
      redirect(u.role)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setFieldErrs({}); setLoading(true)
    try {
      const u = await signup(name, email, pwd)
      redirect(u.role)
    } catch (err) {
      if (err.data?.errors) {
        const map = {}
        err.data.errors.forEach(e => { map[e.path] = e.msg })
        setFieldErrs(map)
      } else {
        setError(err.message || 'Signup failed')
      }
    } finally {
      setLoading(false)
    }
  }

  function forgotPassword() {
    setError('To reset your password, contact us at hello@ztomarketing.com')
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--navy)', padding:'24px' }}>
      <div className="login-card">
        <Link to="/" className="logo"><span className="z">Z</span>TO</Link>

        <div className="tabs" role="tablist">
          <button role="tab" className={`tab-btn${tab === 'login' ? ' active' : ''}`} aria-selected={tab === 'login'} onClick={() => switchTab('login')}>Sign In</button>
          <button role="tab" className={`tab-btn${tab === 'signup' ? ' active' : ''}`} aria-selected={tab === 'signup'} onClick={() => switchTab('signup')}>Create Account</button>
        </div>

        {error   && <div className="alert alert-error"   role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="alert">{success}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} noValidate>
            <h1 className="form-title">Welcome back</h1>
            <p className="form-sub">Sign in to your client portal</p>

            <label htmlFor="login-email">Email address</label>
            <input id="login-email" type="email" placeholder="you@company.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" required />

            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" placeholder="••••••••" value={loginPwd} onChange={e => setLoginPwd(e.target.value)} autoComplete="current-password" required />

            <div className="forgot">
              <button type="button" onClick={forgotPassword}>Forgot password?</button>
            </div>

            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} noValidate>
            <h1 className="form-title">Create your account</h1>
            <p className="form-sub">Get started — it's free to join. A plan can be added later.</p>

            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" type="text" placeholder="Adaeze Nwosu" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
            {fieldErrs.full_name && <p className="field-error">{fieldErrs.full_name}</p>}

            <label htmlFor="signup-email">Email address</label>
            <input id="signup-email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            {fieldErrs.email && <p className="field-error">{fieldErrs.email}</p>}

            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} autoComplete="new-password" />
            <p className="pw-hint">Min 8 characters · one uppercase letter · one number</p>
            {fieldErrs.password && <p className="field-error">{fieldErrs.password}</p>}

            <label htmlFor="signup-confirm">Confirm password</label>
            <input id="signup-confirm" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
            {fieldErrs.confirm_password && <p className="field-error">{fieldErrs.confirm_password}</p>}

            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        <hr />
        <Link to="/" className="back-link">← Back to ZTO website</Link>
      </div>
    </div>
  )
}
