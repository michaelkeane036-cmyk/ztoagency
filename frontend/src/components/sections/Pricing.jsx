import { Link } from 'react-router-dom'

const PLANS = [
  {
    delay: 'reveal-d1', tier: 'Starter', name: 'Ignite', price: '250,000', per: '/mo',
    desc: 'Perfect for businesses ready to move from guessing to growing. One core channel, fully managed.',
    features: [
      { ok: true,  text: '1 paid channel (Meta or Google)' },
      { ok: true,  text: 'Up to ₦500K ad spend managed' },
      { ok: true,  text: 'Weekly performance report' },
      { ok: true,  text: '4 ad creatives/month' },
      { ok: true,  text: 'WhatsApp support' },
      { ok: false, text: 'SEO or content included' },
      { ok: false, text: 'Dedicated account manager' },
    ],
    cta: 'Get Started', to: '/checkout?plan=ignite', btnClass: 'btn-price outline',
  },
  {
    delay: 'reveal-d2', tier: 'Growth', name: 'Accelerate', price: '600,000', per: '/mo', popular: true,
    desc: 'Full-funnel growth system. Ads, content, SEO and nurture working together for compound growth.',
    features: [
      { ok: true,  text: '2 paid channels (Meta + Google)' },
      { ok: true,  text: 'Up to ₦2M ad spend managed' },
      { ok: true,  text: 'SEO – 4 pages + monthly blog' },
      { ok: true,  text: 'Social content: 12 posts/month' },
      { ok: true,  text: 'Email / SMS automation setup' },
      { ok: true,  text: 'Dedicated account manager' },
      { ok: true,  text: 'Bi-weekly strategy calls' },
    ],
    cta: 'Get Started', to: '/checkout?plan=accelerate', btnClass: 'btn-price teal',
  },
  {
    delay: 'reveal-d3', tier: 'Enterprise', name: 'Dominate', price: 'Custom', per: ' scoped',
    desc: 'For brands serious about market domination. Full-team embedded, unlimited channels, bespoke strategy.',
    features: [
      { ok: true,  text: 'All channels – unlimited' },
      { ok: true,  text: 'Unlimited ad spend managed' },
      { ok: true,  text: 'Full content & SEO team' },
      { ok: true,  text: 'Brand positioning & strategy' },
      { ok: true,  text: 'Custom analytics dashboard' },
      { ok: true,  text: 'Weekly strategy sessions' },
      { ok: true,  text: 'Priority 24/7 WhatsApp access' },
    ],
    cta: "Let's Talk", scroll: 'contact', btnClass: 'btn-price outline',
  },
]

function ArrowIcon() {
  return (
    <svg className="icon-xs" aria-hidden="true">
      <use href="/icons.svg#ic-arrow-right" />
    </svg>
  )
}

export default function Pricing() {
  return (
    <section id="pricing">
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">Investment</div>
          <h2 className="section-title">Clear, Results-Aligned <span className="gradient-text">Packages</span></h2>
          <p className="section-sub">No hidden fees. No surprise invoices. Just honest pricing tied to your growth.</p>
        </div>

        <div className="pricing-grid">
          {PLANS.map(plan => (
            <div key={plan.name} className={`price-card reveal ${plan.delay}${plan.popular ? ' featured' : ''}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <div className="price-tier">{plan.tier}</div>
              <div className="price-name">{plan.name}</div>
              <div className="price-amount">
                {plan.price === 'Custom'
                  ? <span style={{ fontSize: '1.6rem' }}>Custom<span className="per"> scoped</span></span>
                  : <><span className="currency">₦</span>{plan.price}<span className="per">{plan.per}</span></>
                }
              </div>
              <div className="price-desc">{plan.desc}</div>
              <hr className="price-divider" />
              <ul className="price-features">
                {plan.features.map(f => (
                  <li key={f.text}>
                    <span className={f.ok ? 'check' : 'cross'}>
                      <svg className="icon-xs" aria-hidden="true">
                        <use href={f.ok ? '/icons.svg#ic-check' : '/icons.svg#ic-x-mark'} />
                      </svg>
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
              {plan.scroll
                ? <button className={plan.btnClass} onClick={() => document.getElementById(plan.scroll)?.scrollIntoView({ behavior: 'smooth' })}>
                    {plan.cta} <ArrowIcon />
                  </button>
                : <Link to={plan.to} className={plan.btnClass}>
                    {plan.cta} <ArrowIcon />
                  </Link>
              }
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
