import { useState } from 'react'

const FAQS = [
  {
    q: 'How long before I see results?',
    a: 'Paid ads typically show meaningful data within 14–21 days. SEO takes 60–90 days to build momentum and compounds strongly from month 3 onwards. We give you honest timelines in your strategy call — we\'d rather under-promise and over-deliver than the opposite.',
  },
  {
    q: 'Do you only work with Lagos businesses?',
    a: 'Not at all. We\'re Lagos-based but we work with brands across Nigeria — Abuja, Port Harcourt, Kano, Ibadan — and internationally with Nigerian diaspora businesses in the UK, US, and Canada. If your audience includes Nigerian consumers, we can help.',
  },
  {
    q: 'What\'s the minimum contract length?',
    a: 'We work on a 3-month minimum engagement. Marketing takes time to build proper data and iterate — anyone offering month-to-month with big promises is setting you up to fail. After 3 months, you can continue monthly with 30-days notice.',
  },
  {
    q: 'What ad budget do I need to get started?',
    a: 'Our Ignite plan manages up to ₦500K/month in ad spend. We recommend a minimum of ₦150K/month in media budget to generate statistically useful data. With smaller budgets, learning phases take longer and results are harder to attribute accurately.',
  },
  {
    q: 'How is ZTO different from other Nigerian agencies?',
    a: 'Most agencies sell you deliverables — posts, ads, blogs. We sell you outcomes — revenue, leads, ROAS. Every campaign is tied to a business metric, not a vanity metric. You get a weekly performance dashboard, not a monthly PDF with pretty graphs and no context.',
  },
  {
    q: 'Which industries do you specialise in?',
    a: "We've run campaigns across e-commerce, real estate, food & beverage, fintech, professional services, FMCG, media, and SaaS. Our methodology works across industries because it's built on data — not industry-specific guesswork. If you're selling something people want, we can help you sell more of it.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq">
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">FAQ</div>
          <h2 className="section-title">Questions We Actually <span className="gradient-text">Get Asked</span></h2>
          <p className="section-sub">Straight answers. No marketing speak.</p>
        </div>

        <div className="faq-list reveal">
          {FAQS.map((item, i) => (
            <div key={item.q} className={`faq-item${open === i ? ' open' : ''}`}>
              <button
                className="faq-question"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{item.q}</span>
                <svg className="faq-chevron icon-sm" aria-hidden="true">
                  <use href="/icons.svg#ic-chevron-down" />
                </svg>
              </button>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
