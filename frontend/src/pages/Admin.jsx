import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'

const fmt     = n => '₦' + Number(n).toLocaleString('en-NG')
const fmtDate = s => s ? new Date(s).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—'
const fmtTime = s => s ? new Date(s).toLocaleString('en-NG', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'

function Icon({ id, size = 16 }) {
  return <svg width={size} height={size} aria-hidden="true"><use href={`/icons.svg#${id}`} /></svg>
}

function Badge({ text }) {
  const map = {
    new:'blue', contacted:'yellow', converted:'green', lost:'red',
    active:'green', paused:'yellow', completed:'blue',
    success:'green', pending:'yellow', failed:'red',
    ignite:'blue', accelerate:'orange', dominate:'green', none:'red',
  }
  return <span className={`badge-app ${map[text] || 'blue'}`}>{text || '—'}</span>
}

const NAV = [
  { key:'overview',  label:'Overview',  icon:'ic-bar-chart'   },
  { key:'leads',     label:'Leads',     icon:'ic-inbox'       },
  { key:'clients',   label:'Clients',   icon:'ic-users'       },
  { key:'campaigns', label:'Campaigns', icon:'ic-megaphone'   },
  { key:'payments',  label:'Payments',  icon:'ic-credit-card' },
  { key:'messages',  label:'Messages',  icon:'ic-mail'        },
]

function AdminSidebar({ admin, active, onNav, onLogout }) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <span className="z">Z</span>TO<span className="admin-tag">Admin</span>
      </div>
      {NAV.map(n => (
        <button key={n.key} className={`nav-item-app${active === n.key ? ' active' : ''}`} onClick={() => onNav(n.key)}>
          <Icon id={n.icon} size={16} />{n.label}
        </button>
      ))}
      <div className="sidebar-footer">
        <div className="user-pill">
          <strong>{admin?.full_name}</strong>
          Administrator
        </div>
        <button className="logout-btn-app" onClick={onLogout}>Sign out</button>
      </div>
    </aside>
  )
}

function OverviewPage({ data }) {
  return (
    <>
      <h1 className="page-title-app">Overview</h1>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">New Leads</div><div className="stat-value gold">{data.new_leads}</div></div>
        <div className="stat-card"><div className="stat-label">Active Clients</div><div className="stat-value blue">{data.active_clients}</div></div>
        <div className="stat-card"><div className="stat-label">Total Revenue Collected</div><div className="stat-value green">{fmt(data.total_revenue)}</div></div>
        <div className="stat-card"><div className="stat-label">Total Payments</div><div className="stat-value">{data.payments.length}</div></div>
      </div>
      <div className="app-card">
        <div className="section-head">Recent Leads</div>
        {data.leads.slice(0, 5).length === 0
          ? <p className="empty-state">No leads yet.</p>
          : <table className="app-table">
              <thead><tr><th>Name</th><th>Contact</th><th>Business</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{data.leads.slice(0, 5).map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight:600 }}>{l.name}</td>
                  <td style={{ color:'var(--muted)' }}>{l.contact}</td>
                  <td>{l.business_type}</td>
                  <td><Badge text={l.status} /></td>
                  <td>{fmtDate(l.created_at)}</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function LeadsPage({ leads: initialLeads }) {
  const [leads, setLeads] = useState(initialLeads)
  const STATUS = ['new', 'contacted', 'converted', 'lost']

  async function updateStatus(id, status) {
    try {
      await api.patch(`/admin/leads/${id}`, { status })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    } catch {}
  }

  return (
    <>
      <h1 className="page-title-app">Leads</h1>
      <div className="app-card">
        {leads.length === 0
          ? <p className="empty-state">No leads submitted yet.</p>
          : <table className="app-table">
              <thead><tr><th>Name</th><th>Contact</th><th>Business</th><th>Challenge</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>{leads.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight:600 }}>{l.name}</td>
                  <td style={{ color:'var(--muted)', fontSize:'0.82rem' }}>{l.contact}</td>
                  <td>{l.business_type}</td>
                  <td style={{ color:'var(--muted)', fontSize:'0.82rem', maxWidth:200 }}>{l.challenge || '—'}</td>
                  <td><Badge text={l.status} /></td>
                  <td style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{fmtDate(l.created_at)}</td>
                  <td>
                    <select
                      value={l.status}
                      onChange={e => updateStatus(l.id, e.target.value)}
                      className="form-select-app"
                      style={{ width:'auto', padding:'4px 8px', fontSize:'0.78rem' }}>
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function ClientsPage({ clients: initialClients }) {
  const [clients, setClients] = useState(initialClients)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ email:'', full_name:'', plan:'ignite' })
  const [msg,     setMsg]     = useState('')
  const [err,     setErr]     = useState('')

  async function createClient(e) {
    e.preventDefault(); setMsg(''); setErr('')
    try {
      const data = await api.post('/admin/clients', form)
      setClients(prev => [data.user, ...prev])
      setMsg('Client created. Welcome email sent.')
      setForm({ email:'', full_name:'', plan:'ignite' })
      setTimeout(() => { setModal(false); setMsg('') }, 2000)
    } catch (e) { setErr(e.data?.errors?.[0]?.msg || e.message) }
  }

  async function toggleActive(id, is_active) {
    try {
      await api.patch(`/admin/clients/${id}`, { is_active: !is_active })
      setClients(prev => prev.map(c => c.id === id ? { ...c, is_active: !is_active } : c))
    } catch {}
  }

  return (
    <>
      <h1 className="page-title-app">Clients</h1>

      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-title">Create Client Account</div>
            <form onSubmit={createClient}>
              <div className="form-grid" style={{ marginBottom:16 }}>
                <div className="form-field">
                  <label>Full Name</label>
                  <input className="form-input-app" value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name:e.target.value }))}
                    placeholder="e.g. Adaeze Okonkwo" required />
                </div>
                <div className="form-field">
                  <label>Email Address</label>
                  <input className="form-input-app" type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email:e.target.value }))}
                    placeholder="client@company.com" required />
                </div>
                <div className="form-field">
                  <label>Plan</label>
                  <select className="form-select-app" value={form.plan}
                    onChange={e => setForm(p => ({ ...p, plan:e.target.value }))}>
                    <option value="ignite">Ignite — ₦250K/mo</option>
                    <option value="accelerate">Accelerate — ₦600K/mo</option>
                    <option value="dominate">Dominate — Custom</option>
                  </select>
                </div>
              </div>
              {err && <p style={{ color:'#f87171', fontSize:'0.82rem', marginBottom:8 }}>{err}</p>}
              {msg && <p style={{ color:'#34d399', fontSize:'0.82rem', marginBottom:8 }}>{msg}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-app-primary">Create &amp; Send Welcome Email</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="app-card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div className="section-head" style={{ margin:0 }}>All Clients ({clients.length})</div>
          <button className="btn-app-primary" onClick={() => setModal(true)}>+ New Client</button>
        </div>
        {clients.length === 0
          ? <p className="empty-state">No clients yet. Create one above.</p>
          : <table className="app-table">
              <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>{clients.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight:600 }}>{c.full_name}</td>
                  <td style={{ color:'var(--muted)', fontSize:'0.82rem' }}>{c.email}</td>
                  <td><Badge text={c.plan || 'none'} /></td>
                  <td><span className={`badge-app ${c.is_active ? 'green' : 'red'}`}>{c.is_active ? 'active' : 'inactive'}</span></td>
                  <td style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{fmtDate(c.created_at)}</td>
                  <td>
                    <button
                      className={`btn-sm-app ${c.is_active ? 'red' : 'green'}`}
                      onClick={() => toggleActive(c.id, c.is_active)}>
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function CampaignsPage({ clients }) {
  const [campaigns, setCampaigns] = useState([])
  const [modal,     setModal]     = useState(false)
  const [form,      setForm]      = useState({ user_id:'', name:'', channel:'Meta', spend:0, revenue:0, roas:0 })
  const [msg,       setMsg]       = useState('')

  useEffect(() => {
    api.get('/admin/campaigns').then(d => setCampaigns(d.campaigns || [])).catch(() => {})
  }, [])

  async function createCampaign(e) {
    e.preventDefault(); setMsg('')
    try {
      const data = await api.post('/admin/campaigns', form)
      setCampaigns(p => [data.campaign, ...p])
      setMsg('Campaign created.')
      setTimeout(() => { setModal(false); setMsg('') }, 1500)
    } catch {}
  }

  return (
    <>
      <h1 className="page-title-app">Campaigns</h1>

      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-title">New Campaign</div>
            <form onSubmit={createCampaign}>
              <div className="form-grid" style={{ marginBottom:16 }}>
                <div className="form-field" style={{ gridColumn:'1/-1' }}>
                  <label>Client</label>
                  <select className="form-select-app" value={form.user_id}
                    onChange={e => setForm(p => ({ ...p, user_id:e.target.value }))} required>
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Campaign Name</label>
                  <input className="form-input-app" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name:e.target.value }))}
                    required placeholder="e.g. Meta Retargeting Q1" />
                </div>
                <div className="form-field">
                  <label>Channel</label>
                  <select className="form-select-app" value={form.channel}
                    onChange={e => setForm(p => ({ ...p, channel:e.target.value }))}>
                    {['Meta','Google','TikTok','LinkedIn','Email','SEO'].map(ch => <option key={ch}>{ch}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Ad Spend (₦)</label>
                  <input className="form-input-app" type="number" value={form.spend}
                    onChange={e => setForm(p => ({ ...p, spend:+e.target.value }))} min="0" />
                </div>
                <div className="form-field">
                  <label>Revenue (₦)</label>
                  <input className="form-input-app" type="number" value={form.revenue}
                    onChange={e => setForm(p => ({ ...p, revenue:+e.target.value }))} min="0" />
                </div>
                <div className="form-field">
                  <label>ROAS</label>
                  <input className="form-input-app" type="number" step="0.01" value={form.roas}
                    onChange={e => setForm(p => ({ ...p, roas:+e.target.value }))} min="0" />
                </div>
              </div>
              {msg && <p style={{ color:'#34d399', fontSize:'0.82rem', marginBottom:8 }}>{msg}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-app-primary">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="app-card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div className="section-head" style={{ margin:0 }}>All Campaigns ({campaigns.length})</div>
          <button className="btn-app-primary" onClick={() => setModal(true)}>+ New Campaign</button>
        </div>
        {campaigns.length === 0
          ? <p className="empty-state">No campaigns yet.</p>
          : <table className="app-table">
              <thead><tr><th>Name</th><th>Channel</th><th>Status</th><th>Spend</th><th>Revenue</th><th>ROAS</th></tr></thead>
              <tbody>{campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight:600 }}>{c.name}</td>
                  <td>{c.channel}</td>
                  <td><Badge text={c.status} /></td>
                  <td>{fmt(c.spend)}</td>
                  <td style={{ color:'#34d399' }}>{fmt(c.revenue)}</td>
                  <td style={{ color:'var(--gold)', fontWeight:600 }}>{Number(c.roas).toFixed(2)}×</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function PaymentsPage({ payments }) {
  const total = payments.reduce((s, p) => s + (p.amount / 100), 0)
  return (
    <>
      <h1 className="page-title-app">Payments</h1>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Total Collected</div><div className="stat-value green">{fmt(total)}</div></div>
        <div className="stat-card"><div className="stat-label">Successful Payments</div><div className="stat-value gold">{payments.length}</div></div>
      </div>
      <div className="app-card">
        {payments.length === 0
          ? <p className="empty-state">No payments yet.</p>
          : <table className="app-table">
              <thead><tr><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th><th>Reference</th></tr></thead>
              <tbody>{payments.map(p => (
                <tr key={p.id}>
                  <td style={{ textTransform:'capitalize' }}>{p.plan}</td>
                  <td style={{ color:'#34d399', fontWeight:600 }}>{fmt(p.amount / 100)}</td>
                  <td><Badge text={p.status} /></td>
                  <td style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{fmtDate(p.created_at)}</td>
                  <td style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'var(--muted)' }}>{p.reference}</td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </>
  )
}

function MessagesPage({ clients }) {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState('')
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get('/admin/messages').then(d => setMessages(d.messages || [])).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selected])

  const filtered = selected
    ? messages.filter(m => m.sender?.id === selected || m.receiver?.id === selected)
    : messages

  async function send() {
    if (!input.trim() || !selected || sending) return
    setSending(true)
    try {
      const data = await api.post('/admin/messages', { receiver_id: selected, content: input.trim() })
      setMessages(p => [...p, data.message])
      setInput('')
    } catch {}
    setSending(false)
  }

  return (
    <>
      <h1 className="page-title-app">Messages</h1>
      <div className="app-card">
        <div className="section-head">Select Client</div>
        <select className="form-select-app" value={selected} onChange={e => setSelected(e.target.value)}
          style={{ marginBottom:16 }}>
          <option value="">— All messages —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <div className="msg-thread">
          {filtered.length === 0 && <p className="empty-state">No messages in this thread.</p>}
          {[...filtered].reverse().map(m => {
            const isAdmin = m.sender?.role === 'admin'
            return (
              <div key={m.id} className={`msg-bubble ${isAdmin ? 'mine' : 'theirs'}`}>
                <div>{m.content}</div>
                <div className="msg-meta">{m.sender?.full_name} · {fmtTime(m.created_at)}</div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        {selected && (
          <div className="msg-input-row">
            <input className="msg-input" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Reply to client…" />
            <button className="btn-app-primary" style={{ margin:0 }} onClick={send} disabled={sending}>Send</button>
          </div>
        )}
      </div>
    </>
  )
}

export default function Admin() {
  const { user, logout } = useAuth()
  const [data,  setData]  = useState(null)
  const [page,  setPage]  = useState('overview')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api.get('/admin/overview')
      .then(d => { setData(d); setReady(true) })
      .catch(() => { window.location.href = '/login' })
  }, [])

  async function handleLogout() {
    await logout()
    window.location.href = '/'
  }

  if (!ready || !data) return <div className="app-loader">Loading admin dashboard…</div>

  const pages = {
    overview:  <OverviewPage  data={data} />,
    leads:     <LeadsPage     leads={data.leads} />,
    clients:   <ClientsPage   clients={data.clients} />,
    campaigns: <CampaignsPage clients={data.clients} />,
    payments:  <PaymentsPage  payments={data.payments} />,
    messages:  <MessagesPage  clients={data.clients} />,
  }

  return (
    <div className="admin-layout">
      <AdminSidebar admin={user} active={page} onNav={setPage} onLogout={handleLogout} />
      <main className="admin-main">
        {pages[page] || pages.overview}
      </main>
      <nav className="mobile-nav">
        {NAV.map(n => (
          <button key={n.key} className={`mobile-nav-item${page === n.key ? ' active' : ''}`} onClick={() => setPage(n.key)}>
            <Icon id={n.icon} size={20} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
