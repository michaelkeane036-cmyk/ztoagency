import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'

const PLANS = {
  ignite: {
    tier: 'Starter', name: 'Ignite', price: '₦250,000',
    desc: 'Perfect for businesses ready to move from guessing to growing. One core channel, fully managed.',
    features: [
      '1 ad channel (Meta or Google)',
      'Monthly performance report',
      'Ad creative & copy included',
      'Audience research & targeting',
      '₦500K/month max ad spend managed',
    ],
  },
  accelerate: {
    tier: 'Growth', name: 'Accelerate', price: '₦600,000',
    desc: 'Full-funnel growth system. Ads, content, SEO and nurture working together for compound growth.',
    features: [
      'Up to 3 ad channels',
      'SEO & content marketing included',
      'Bi-weekly strategy calls',
      'Dedicated account manager',
      'Conversion rate optimisation',
      'Bi-weekly performance reports',
    ],
  },
}

export default function Checkout() {
  const [params] = useSearchParams()
  const planKey  = (params.get('plan') || 'accelerate').toLowerCase()
  const plan     = PLANS[planKey]
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pwd,     setPwd]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [info,    setInfo]    = useState('')

  useEffect(() => {
    if (!plan) navigate('/', { replace: true })
  }, [plan, navigate])

  async function handlePay() {
    setError(''); setInfo('')

    if (!user && (!name.trim() || !email.trim() || !pwd)) {
      setError('Please fill in all fields.'); return
    }

    setLoading(true)
    try {
      if (!user) {
        setInfo('Creating your account…')
        await api.post('/auth/signup', { full_name: name, email, password: pwd, confirm_password: pwd })
      }
      setInfo('Connecting to payment gateway…')
      const { authorization_url } = await api.post('/payments/initialize', { plan_id: planKey })
      window.location.href = authorization_url
    } catch (err) {
      const msg = err.data?.errors?.[0]?.msg || err.message || 'Something went wrong. Please try again.'
      setError(msg)
      setLoading(false)
      setInfo('')
    }
  }

  if (!plan) return null

  return (
    <div className="checkout-page">
      <div className="checkout-wrap">
        <Link to="/" className="checkout-logo"><span className="z">Z</span>TO</Link>

        <h1 className="checkout-h1">Complete Your Order</h1>
        <p className="checkout-sub">Secure payment via Paystack. Cancel anytime after 3 months.</p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <div className="checkout-grid">

          {/* Plan summary */}
          <div className="plan-card-co">
            <span className="plan-badge">{plan.tier}</span>
            <div className="plan-name-co">{plan.name}</div>
            <div className="plan-price-co">{plan.price}<span className="per">/mo</span></div>
            <p className="plan-desc-co">{plan.desc}</p>
            <hr />
            <ul className="feature-list-co">
              {plan.features.map(f => (
                <li key={f}>
                  <span className="feature-check">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="secure-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secured by Paystack · 256-bit SSL encryption
            </div>
          </div>

          {/* Payment form */}
          <div className="pay-card">
            <h2>{user ? `Paying as ${user.email}` : 'Your Details'}</h2>

            {user && (
              <div className="logged-in-strip">
                Paying as <strong>{user.email}</strong> —{' '}
                <Link to="/login" style={{ color:'var(--gold)', textDecoration:'none' }}>switch account</Link>
              </div>
            )}

            {info && <div className="alert alert-info" role="status">{info}</div>}

            {!user && (
              <>
                <label htmlFor="co-name">Full name</label>
                <input id="co-name" type="text" placeholder="Adaeze Nwosu" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />

                <label htmlFor="co-email">Email address</label>
                <input id="co-email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />

                <label htmlFor="co-pwd">Create a password</label>
                <input id="co-pwd" type="password" placeholder="Min 8 chars, one uppercase, one number" value={pwd} onChange={e => setPwd(e.target.value)} autoComplete="new-password" />
                <p className="field-note">We'll create your client portal account automatically.</p>
              </>
            )}

            <button className="btn-pay" onClick={handlePay} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              {loading ? 'Please wait…' : '💳 Pay Securely with Paystack'}
            </button>

            {!user && (
              <>
                <div className="divider-or">or</div>
                <Link to={`/login?next=/checkout?plan=${planKey}`} className="btn-alt-login">
                  Already have an account? Sign in
                </Link>
              </>
            )}

            <Link to="/" className="checkout-back">← Back to ZTO website</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
