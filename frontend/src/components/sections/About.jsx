import { useEffect, useRef } from 'react'

const PILLARS = [
  { icon: 'ic-flask',     title: 'Data Over Guesswork',  body: 'Every decision is backed by analytics, not intuition or trends.' },
  { icon: 'ic-target',    title: 'Performance-First',     body: 'We tie our success to yours. ROAS, CAC, revenue – the metrics that move businesses.' },
  { icon: 'ic-globe',     title: 'Cultural Intelligence', body: 'We know Naija audiences – the slangs, the humour, the pain points, the aspirations.' },
  { icon: 'ic-clipboard', title: 'Weekly Transparency',   body: 'No mystery invoices. You get a dashboard, weekly reports, and direct access to your team.' },
]

export default function About() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal')
    if (!els) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="about" ref={sectionRef}>
      <div className="container">
        <div className="about-wrap">
          <div className="about-text reveal">
            <div className="section-tag">Why ZTO</div>
            <h2 className="section-title" style={{ marginBottom: '24px' }}>
              Lagos-Based.<br /><span className="gradient-text">Globally Minded.</span>
            </h2>
            <p>We get the Nigerian hustle – from data blackouts to cultural vibes, from NEPA cuts to dollar-rate volatility. We turn these realities into unfair advantages for your brand instead of making excuses.</p>
            <p>Our team has run campaigns across 12+ industries, managed millions in ad spend, and built systems that scale without breaking. We don't sell you packages – we build you revenue engines.</p>
            <blockquote className="about-tagline">"No fluff retainers. Performance-first. Transparent reporting. Always."</blockquote>
            <p className="flag-line">🇳🇬 Proudly Nigerian-founded &nbsp;·&nbsp; Serving brands across Africa &amp; beyond</p>
          </div>

          <div className="about-pillars reveal">
            {PILLARS.map(p => (
              <div key={p.title} className="pillar">
                <div className="pillar-icon">
                  <svg aria-hidden="true"><use href={`/icons.svg#${p.icon}`} /></svg>
                </div>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
