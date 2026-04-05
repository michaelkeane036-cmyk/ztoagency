import { useEffect, useRef } from 'react'

const TESTIMONIALS = [
  { delay: 'reveal-d1', initials: 'AO', name: 'Adaeze Okonkwo', biz: 'CEO, StyleHaus Nigeria',       quote: 'ZTO completely transformed how we run ads. In three months our ROAS went from 1.8x to 6.4x. The team understands the Nigerian market in a way no other agency has.' },
  { delay: 'reveal-d2', initials: 'TI', name: 'Tobi Ismail',    biz: 'Founder, FinEdge Technologies', quote: 'We tried 3 agencies before ZTO. They were the first to show us actual numbers – not vanity metrics. Our leads are up 300% and our cost per acquisition is finally sustainable.' },
  { delay: 'reveal-d3', initials: 'NE', name: 'Ngozi Eze',       biz: 'Director, GreenBowl Foods',     quote: 'The content strategy they built for us went viral twice on TikTok. Our Instagram DMs are now sales conversations, not just compliments. Truly results-first team.' },
  { delay: 'reveal-d1', initials: 'KA', name: 'Kunle Adewale',   biz: 'MD, RealtyPrime Lagos',         quote: 'Their SEO work has us ranking #1 for our most competitive keywords in Lagos. Organic traffic is now 40% of our total revenue. Worth every naira.' },
  { delay: 'reveal-d2', initials: 'BJ', name: 'Bisi Johnson',    biz: 'Owner, LagosCakes & Events',    quote: "Transparent reporting, clear strategy, measurable results. I finally understand where my marketing money goes and it's actually making more money. Highly recommend." },
  { delay: 'reveal-d3', initials: 'CU', name: 'Chidi Uzo',       biz: 'Co-founder, SwiftDelivery NG',  quote: "ZTO isn't an agency – they act like a growth partner embedded in our business. They understand our audience, our culture, and they deliver. Full stop." },
]

function Stars() {
  return (
    <div className="stars" aria-label="5 out of 5 stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="icon-xs"><use href="/icons.svg#ic-star" /></svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
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
    <section id="testimonials" ref={sectionRef}>
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">Social Proof</div>
          <h2 className="section-title">What Our Clients Say</h2>
        </div>

        <div className="testi-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className={`testi-card reveal ${t.delay}`}>
              <Stars />
              <p className="testi-quote">"{t.quote}"</p>
              <div className="testi-author">
                <div className="testi-avatar" aria-hidden="true">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-biz">{t.biz}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
