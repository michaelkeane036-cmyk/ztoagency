import { useEffect, useRef } from 'react'

const CASES = [
  {
    tag: 'Fashion E-Commerce', title: 'Lagos Fashion Brand',
    metric: '7.2x', metricLabel: 'ROAS',
    desc: 'From ₦500K ad spend to ₦3.6M in tracked sales. Meta + TikTok retargeting in 60 days.',
    bars: [20, 30, 45, 55, 65, 80, 100],
  },
  {
    tag: 'B2B SaaS Startup', title: 'Abuja Tech Startup',
    metric: '450%', metricLabel: 'Lead Growth',
    desc: 'LinkedIn + Google Search campaign restructure. Cost-per-lead dropped from ₦18K to ₦4.2K.',
    bars: [15, 22, 38, 52, 70, 85, 100],
  },
  {
    tag: 'Food Delivery', title: 'Port Harcourt Food Brand',
    metric: '−62%', metricLabel: 'CAC',
    desc: 'Customer acquisition cost cut from ₦9,800 to ₦3,700 via funnel rebuild + offer testing strategy.',
    bars: [100, 82, 68, 55, 45, 40, 38],
  },
]

export default function Results() {
  const counterRef = useRef(null)

  useEffect(() => {
    const el = counterRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      let start = 0
      const end = 500
      const step = Math.ceil(end / 80)
      const timer = setInterval(() => {
        start += step
        if (start >= end) { start = end; clearInterval(timer) }
        el.textContent = `₦${start}M+`
      }, 20)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="results">
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">Proof</div>
          <h2 className="section-title">Real Results. <span className="gradient-text">Real Numbers.</span></h2>
        </div>

        <div className="results-hero-stat reveal">
          <div className="big-stat" ref={counterRef}>₦0M+</div>
          <div className="big-stat-label">Client Revenue Generated &amp; Tracked</div>
        </div>

        <div className="cases-grid">
          {CASES.map((c, i) => (
            <div key={c.title} className={`case-card reveal reveal-d${i + 1}`}>
              <span className="case-tag">{c.tag}</span>
              <h3>{c.title}</h3>
              <div className="case-metric"><span>{c.metric}</span> {c.metricLabel}</div>
              <p className="case-desc">{c.desc}</p>
              <div className="case-chart">
                {c.bars.map((h, j) => <div key={j} className="bar" style={{ height: `${h}%` }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
