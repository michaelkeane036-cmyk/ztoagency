import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'

export default function PaymentSuccess() {
  const [params]    = useSearchParams()
  const reference   = params.get('reference') || params.get('trxref')
  const [state,     setState]  = useState('loading')
  const [plan,      setPlan]   = useState('')
  const [errMsg,    setErrMsg] = useState('')

  useEffect(() => {
    if (!reference) {
      setErrMsg('No payment reference found.')
      setState('error')
      return
    }
    api.get(`/payments/verify/${encodeURIComponent(reference)}`)
      .then(data => { setPlan(data.plan || 'selected'); setState('success') })
      .catch(err => { setErrMsg(err.message || 'Verification failed.'); setState('error') })
  }, [reference])

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--navy)', padding:'24px' }}>
      <div className="success-card">
        <Link to="/" className="success-logo"><span className="z">Z</span>TO</Link>

        {state === 'loading' && (
          <>
            <div className="spinner" />
            <p>Verifying your payment, please wait…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1>Payment Confirmed!</h1>
            <p>Welcome to ZTO. Your <strong style={{ color:'var(--white)' }}>{plan}</strong> plan is now active.</p>
            <p>Check your inbox — we've sent you a receipt and your onboarding guide.</p>
            {reference && (
              <div className="ref-box">
                Reference: <span>{reference}</span>
              </div>
            )}
            <div>
              <Link to="/portal" className="btn-success-gold">Go to My Dashboard</Link>
              <Link to="/" className="btn-success-ghost">Back to Website</Link>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="icon-wrap error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1>Verification Pending</h1>
            <p>{errMsg || "We couldn't verify your payment automatically. If money was deducted, don't worry — it will be confirmed within a few minutes."}</p>
            {reference && (
              <div className="ref-box">Reference: <span>{reference}</span></div>
            )}
            <div>
              <Link to="/portal" className="btn-success-gold">Check My Dashboard</Link>
              <Link to="/" className="btn-success-ghost">Back to Website</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
