import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'

const fmt     = n => '₦' + Number(n).toLocaleString('en-NG')
const fmtDate = s => s ? new Date(s).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—'

function Icon({ id, size = 18 }) {
  return <svg width={size} height={size} aria-hidden="true"><use href={`/icons.svg#${id}`} /></svg>
}

function Badge({ text }) {
  const map = { active:'green', paused:'yellow', completed:'blue', success:'green', pending:'yellow', failed:'red' }
  return <span className={`badge-app ${map[text] || 'blue'}`}>{text}</span>
}

const NAV = [
  { key:'dashboard', label:'Dashboard', icon:'ic-bar-chart' },
  { key:'campaigns', label:'Campaigns', icon:'ic-target'    },
  { key:'reports',   label:'Reports',   icon:'ic-clipboard' },
  { key:'payments',  label:'Payments',  icon:'ic-gem'       },
  { key:'messages',  label:'Messages',  icon:'ic-mail'      },
  { key:'settings',  label:'Settings',  icon:'ic-refresh'   },
]

function Sidebar({ user, active, onNav, onLogout }) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo"><span className="z">Z</span>TO Portal</div>
      {NAV.map(n => (
        <button key={n.key} className={`nav-item-app${active === n.key ? ' active' : ''}`} onClick={() => onNav(n.key)}>
          <Icon id={n.icon} size={16} />{n.label}
        </button>
      ))}
      <div className="sidebar-footer">
        <div className="user-pill">
          <strong>{user?.full_name}</strong>
          {user?.plan && <span>Plan: {user.plan}</span>}
        </div>
        <button className="logout-btn-app" onClick={onLogout}>Sign out</button>
      </div>
    </aside>
  )
}

function DashboardPage({ data, user }) {
  const totalRevenue = data.campaigns.reduce((s, c) => s + Number(c.revenue || 0), 0)
  const totalSpend   = data.campaigns.reduce((s, c) => s + Number(c.spend   || 0), 0)
  const avgRoas      = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '—'

  return (
    <>
      <h1 className="page-title-app">Dashboard</h1>
      {!user?.plan && (
        <div style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:12, padding:'14px 18px', marginBottom:24, fontSize:'0.9rem', color:'#FBBF24' }}>
          You don't have an active plan yet. <Link to="/checkout?plan=ignite" style={{ color:'var(--gold)', fontWeight:700 }}>Choose a plan →</Link>
        </div>
      )}
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Active Campaigns</div><div className="stat-value gold">{data.campaigns.filter(c => c.status === 'active').length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Revenue Tracked</div><div className="stat-value green">{fmt(totalRevenue)}</div></div>
        <div className="stat-card"><div className="stat-label">Total Ad Spend</div><div className="stat-value">{fmt(totalSpend)}</div></div>
        <div className="stat-card"><div className="stat-label">Average ROAS</div><div className="stat-value gold">{avgRoas}×</div></div>
        <div className="stat-card"><div className="stat-label">Reports Available</div><div className="stat-value">{data.reports.length}</div></div>
      </div>
      <div className="app-card">
        <div className="section-head">Recent Reports</div>
        {data.reports.length === 0
          ? <p className="empty-state">No reports yet — your account manager will upload your first one soon.</p>
          : <table className="app-table">
              <thead><tr><th>Title</th><th>Date</th><th>Link</th></tr></thead>
              <tbody>{data.reports.map(r => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{fmtDate(r.created_at)}</td>
                  <td>{r.file_url ? <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ color:'#FBBF24' }}>View →</a> : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function CampaignsPage({ campaigns }) {
  return (
    <>
      <h1 className="page-title-app">Campaigns</h1>
      <div className="app-card">
        {campaigns.length === 0
          ? <p className="empty-state">No campaigns yet. Your account manager will set these up after onboarding.</p>
          : <table className="app-table">
              <thead><tr><th>Name</th><th>Channel</th><th>Status</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>Start</th></tr></thead>
              <tbody>{campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight:600 }}>{c.name}</td>
                  <td>{c.channel}</td>
                  <td><Badge text={c.status} /></td>
                  <td>{fmt(c.spend)}</td>
                  <td style={{ color:'#34d399' }}>{fmt(c.revenue)}</td>
                  <td style={{ color:'#FBBF24', fontWeight:600 }}>{Number(c.roas).toFixed(2)}×</td>
                  <td>{fmtDate(c.start_date)}</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function ReportsPage({ reports }) {
  return (
    <>
      <h1 className="page-title-app">Reports</h1>
      <div className="app-card">
        {reports.length === 0
          ? <p className="empty-state">No reports uploaded yet.</p>
          : <table className="app-table">
              <thead><tr><th>Title</th><th>Date</th><th>Download</th></tr></thead>
              <tbody>{reports.map(r => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{fmtDate(r.created_at)}</td>
                  <td>{r.file_url ? <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ color:'#FBBF24' }}>Open →</a> : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function PaymentsPage({ payments, user }) {
  const [loading, setLoading] = useState(false)
  const [errMsg,  setErrMsg]  = useState('')

  async function startPayment(planId) {
    setLoading(true); setErrMsg('')
    try {
      const { authorization_url } = await api.post('/payments/initialize', { plan_id: planId })
      window.location.href = authorization_url
    } catch (e) { setErrMsg(e.message); setLoading(false) }
  }

  return (
    <>
      <h1 className="page-title-app">Payments</h1>
      <div className="app-card">
        <div className="section-head">Subscribe / Upgrade Plan</div>
        <p style={{ color:'var(--muted)', fontSize:'0.875rem', marginBottom:20 }}>
          Current plan: <strong style={{ color:'var(--gold)' }}>{user?.plan || 'None'}</strong>
        </p>
        <button className="btn-app-primary" style={{ marginRight:10, marginBottom:8 }} onClick={() => startPayment('ignite')} disabled={loading}>Ignite — ₦250,000/mo</button>
        <button className="btn-app-primary" style={{ marginBottom:8 }} onClick={() => startPayment('accelerate')} disabled={loading}>Accelerate — ₦600,000/mo</button>
        <a href="/#contact" className="btn-app-outline" style={{ marginBottom:8 }}>Dominate — Custom scope →</a>
        {errMsg && <p style={{ color:'#f87171', marginTop:12, fontSize:'0.875rem' }}>{errMsg}</p>}
      </div>
      <div className="app-card">
        <div className="section-head">Payment History</div>
        {payments.length === 0
          ? <p className="empty-state">No payments on record yet.</p>
          : <table className="app-table">
              <thead><tr><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th><th>Reference</th></tr></thead>
              <tbody>{payments.map(p => (
                <tr key={p.id}>
                  <td style={{ textTransform:'capitalize' }}>{p.plan}</td>
                  <td>{fmt(p.amount / 100)}</td>
                  <td><Badge text={p.status} /></td>
                  <td>{fmtDate(p.created_at)}</td>
                  <td style={{ fontFamily:'monospace', fontSize:'0.78rem', color:'var(--muted)' }}>{p.reference}</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get('/clients/messages').then(d => setMessages(d.messages || [])).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const { message } = await api.post('/clients/messages', { content: input.trim() })
      setMessages(prev => [...prev, message])
      setInput('')
    } catch { /* errors shown via state */ }
    setSending(false)
  }

  return (
    <>
      <h1 className="page-title-app">Messages</h1>
      <div className="app-card">
        <div className="msg-thread">
          {messages.length === 0 && <p className="empty-state">No messages yet. Send one below to start the conversation.</p>}
          {messages.map(m => {
            const mine = m.sender?.role === 'client'
            return (
              <div key={m.id} className={`msg-bubble ${mine ? 'mine' : 'theirs'}`}>
                <div>{m.content}</div>
                <div className="msg-meta">{m.sender?.full_name} · {fmtDate(m.created_at)}</div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <div className="msg-input-row">
          <input className="msg-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message…" />
          <button className="btn-app-primary" style={{ margin:0 }} onClick={send} disabled={sending}>Send</button>
        </div>
      </div>
    </>
  )
}

function SettingsPage() {
  const [curr, setCurr] = useState('')
  const [nw,   setNw]   = useState('')
  const [ok,   setOk]   = useState('')
  const [err,  setErr]  = useState('')

  async function changePass(e) {
    e.preventDefault(); setOk(''); setErr('')
    try {
      await api.post('/auth/change-password', { current_password: curr, new_password: nw })
      setOk('Password updated successfully.'); setCurr(''); setNw('')
    } catch (e) { setErr(e.data?.errors?.[0]?.msg || e.message) }
  }

  return (
    <>
      <h1 className="page-title-app">Settings</h1>
      <div className="app-card" style={{ maxWidth:460 }}>
        <div className="section-head">Change Password</div>
        <form onSubmit={changePass} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <input className="form-input-app" type="password" value={curr} onChange={e => setCurr(e.target.value)} placeholder="Current password" />
          <input className="form-input-app" type="password" value={nw}   onChange={e => setNw(e.target.value)}   placeholder="New password (8+ chars, 1 uppercase, 1 number)" />
          {err && <p style={{ color:'#f87171', fontSize:'0.82rem' }}>{err}</p>}
          {ok  && <p style={{ color:'#34d399', fontSize:'0.82rem' }}>{ok}</p>}
          <button type="submit" className="btn-app-primary" style={{ width:'fit-content' }}>Update Password</button>
        </form>
      </div>
    </>
  )
}

function MobileNav({ nav, active, onNav }) {
  return (
    <nav className="mobile-nav">
      {nav.map(n => (
        <button key={n.key} className={`mobile-nav-item${active === n.key ? ' active' : ''}`} onClick={() => onNav(n.key)}>
          <Icon id={n.icon} size={20} />
          <span>{n.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function Portal() {
  const { user, logout } = useAuth()
  const [data,  setData]  = useState(null)
  const [page,  setPage]  = useState('dashboard')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api.get('/clients/dashboard')
      .then(d => { setData(d); setReady(true) })
      .catch(() => { window.location.href = '/login' })
  }, [])

  async function handleLogout() {
    await logout()
    window.location.href = '/'
  }

  if (!ready || !data) return <div className="app-loader">Loading your portal…</div>

  const pages = {
    dashboard: <DashboardPage data={data} user={user} />,
    campaigns: <CampaignsPage campaigns={data.campaigns} />,
    reports:   <ReportsPage   reports={data.reports} />,
    payments:  <PaymentsPage  payments={data.payments} user={user} />,
    messages:  <MessagesPage />,
    settings:  <SettingsPage />,
  }

  return (
    <div className="portal-layout">
      <Sidebar user={user} active={page} onNav={setPage} onLogout={handleLogout} />
      <main className="portal-main">
        {pages[page] || pages.dashboard}
      </main>
      <MobileNav nav={NAV} active={page} onNav={setPage} />
    </div>
  )
}
