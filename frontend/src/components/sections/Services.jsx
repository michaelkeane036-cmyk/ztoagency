import { useEffect, useRef } from 'react'

const SERVICES = [
  { delay: 'reveal-d1', icon: 'ic-target',    title: 'Paid Media Mastery',      desc: 'Meta, Google, TikTok – precision targeting, relentless A/B testing, and ROAS-first campaign structure.',                                                         stat: 'Avg 5.2x ROAS achieved' },
  { delay: 'reveal-d2', icon: 'ic-film',      title: 'Social & Content Engine', desc: 'Viral hooks, relatable Naija storytelling, UGC, and scroll-stopping creative that sells – not just entertains.',                                                   stat: '3x higher CTR vs. industry avg' },
  { delay: 'reveal-d3', icon: 'ic-search',    title: 'SEO & Organic Traffic',   desc: 'Technical SEO, content clusters, and link building that compounds over time. Rank #1 without burning cash.',                                                        stat: 'Rankings in 90 days avg' },
  { delay: 'reveal-d1', icon: 'ic-mail',      title: 'Email & SMS Nurture',     desc: 'Automated sequences that turn cold leads warm and one-time buyers into loyal, high-LTV fans of your brand.',                                                        stat: '42% avg open rate' },
  { delay: 'reveal-d2', icon: 'ic-gem',       title: 'Brand Positioning',       desc: 'Define your unfair advantage. We craft brand messaging that resonates with Nigerian consumers and premium buyers alike.',                                            stat: 'Stand out in saturated markets' },
  { delay: 'reveal-d3', icon: 'ic-bar-chart', title: 'Analytics & Scaling',     desc: 'Weekly dashboards. Zero guesswork. We track every naira, identify winners, and scale what works relentlessly.',                                                    stat: 'Full transparent reporting' },
]

export default function Services() {
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
    <section id="services" ref={sectionRef}>
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">What We Do</div>
          <h2 className="section-title">Our Proven <span className="gradient-text">Growth Engine</span></h2>
          <p className="section-sub">Six interconnected services that work together to fill your pipeline and grow your revenue.</p>
        </div>

        <div className="services-bento">
          {SERVICES.map(s => (
            <div key={s.title} className={`svc-card reveal ${s.delay}`}>
              <div className="bg-glow" aria-hidden="true" />
              <div className="svc-icon">
                <svg aria-hidden="true"><use href={`/icons.svg#${s.icon}`} /></svg>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="svc-stat">{s.stat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
