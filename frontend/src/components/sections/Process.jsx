import { Fragment, useEffect, useRef } from 'react'

const STEPS = [
  { num: '01', icon: 'ic-calendar', title: 'Discovery Call',   body: '30 minutes. We audit your current marketing, understand your goals, and identify the biggest revenue leaks. No pitch — just honest diagnosis.',                                              tag: 'Day 1' },
  { num: '02', icon: 'ic-lightbulb', title: 'Custom Strategy', body: 'We build a bespoke growth plan — channels, budgets, creative direction, and 90-day milestones. Tailored to your business, not a template.',                                                tag: 'Days 2–5' },
  { num: '03', icon: 'ic-zap',       title: 'Launch & Execute', body: 'Campaigns go live within 7 days. Creatives, copy, tracking pixels, and landing pages — all handled by our team. Zero chaos on your end.',                                               tag: 'Day 7' },
  { num: '04', icon: 'ic-refresh',   title: 'Optimise & Scale', body: "Weekly reports. Bi-weekly calls. We kill what doesn't work and double down on what does — every single week, compounding your returns.",                                                tag: 'Ongoing' },
]

const DELAYS = ['reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4']

export default function Process() {
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
    <section id="process" ref={sectionRef}>
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">The Process</div>
          <h2 className="section-title">From First Call to <span className="gradient-text">First Results</span></h2>
          <p className="section-sub">No mystery. Here's exactly what happens after you reach out — down to the day.</p>
        </div>

        <div className="process-steps">
          {STEPS.map((s, i) => (
            <Fragment key={s.num}>
              <div className={`process-step reveal ${DELAYS[i]}`}>
                <div className="step-number" aria-hidden="true">{s.num}</div>
                <div className="step-icon">
                  <svg aria-hidden="true"><use href={`/icons.svg#${s.icon}`} /></svg>
                </div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <div className="step-tag">{s.tag}</div>
              </div>
              {i < STEPS.length - 1 && <div className="process-connector" aria-hidden="true" />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
