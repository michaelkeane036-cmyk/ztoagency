import { useState } from 'react'
import { api } from '../../api/client'

const BUSINESS_TYPES = [
  'E-Commerce / Online Store', 'Professional Services', 'Real Estate', 'FMCG / Consumer Goods',
  'Health & Wellness', 'Fashion & Beauty', 'Tech / SaaS', 'Education', 'Food & Hospitality', 'Other',
]

export default function Contact() {
  const [form,    setForm]    = useState({ name:'', contact:'', business_type:'', challenge:'' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiErr,  setApiErr]  = useState('')

  function update(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
    setApiErr('')
  }

  function validate() {
    const errs = {}
    if (!form.name.trim())          errs.name          = 'Name is required'
    if (!form.contact.trim())       errs.contact       = 'WhatsApp number or email is required'
    if (!form.business_type)        errs.business_type = 'Please select your business type'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await api.post('/leads', form)
      setSuccess(true)
    } catch (err) {
      setApiErr(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <section id="contact">
        <div className="container">
          <div className="form-success" role="alert">
            <div className="form-success-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3>You're on the list!</h3>
            <p>We'll be in touch within 24 hours to book your free strategy call. Keep an eye on your WhatsApp or inbox.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact">
      <div className="container">
        <div className="cta-wrap reveal">
          <div className="section-tag" style={{ display:'inline-flex', justifyContent:'center' }}>Get Started</div>
          <h2 className="cta-headline">Ready to <em className="cta-em">10x</em> Your Marketing?</h2>
          <p className="cta-sub">Book a free 30-minute strategy call. We'll audit your current marketing and show you exactly what's leaking revenue.</p>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="field-name">Your name</label>
                <input id="field-name" type="text" placeholder="Adaeze Nwosu" value={form.name} onChange={e => update('name', e.target.value)} />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div className="form-field">
                <label htmlFor="field-contact">WhatsApp / Email</label>
                <input id="field-contact" type="text" placeholder="+234 801 234 5678 or you@email.com" value={form.contact} onChange={e => update('contact', e.target.value)} />
                {errors.contact && <p className="field-error">{errors.contact}</p>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="field-biz">Business type</label>
              <select id="field-biz" value={form.business_type} onChange={e => update('business_type', e.target.value)}>
                <option value="">Select your industry…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.business_type && <p className="field-error">{errors.business_type}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="field-challenge">Biggest marketing challenge <span style={{ color:'#CBD5E1', fontWeight:400 }}>(optional)</span></label>
              <textarea id="field-challenge" rows={4} placeholder="e.g. We're running ads but getting no results…" value={form.challenge} onChange={e => update('challenge', e.target.value)} />
            </div>

            {apiErr && <p role="alert" style={{ color:'#f87171', fontSize:'0.875rem', marginBottom:'8px' }}>{apiErr}</p>}

            <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
              <svg className="icon-sm" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              {loading ? 'Sending…' : 'Get My Free Strategy Call'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
