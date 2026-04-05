const ROWS = [
  { label: 'Nigerian market knowledge',  zto: 'Deep cultural expertise',     free: 'Varies widely',        intl: 'Generic playbooks',      ztoClass: 'cmp-yes', freeClass: 'cmp-maybe', intlClass: 'cmp-no' },
  { label: 'Transparent reporting',      zto: 'Weekly dashboard access',     free: 'Occasional updates',   intl: 'Monthly PDF reports',    ztoClass: 'cmp-yes', freeClass: 'cmp-maybe', intlClass: 'cmp-no' },
  { label: 'Full-funnel coverage',       zto: 'Ads + SEO + Content + Email', free: 'One specialism only',  intl: 'Often siloed teams',     ztoClass: 'cmp-yes', freeClass: 'cmp-no',    intlClass: 'cmp-maybe' },
  { label: 'Naira-based pricing',        zto: 'Fixed ₦ pricing, no FX risk', free: 'Usually ₦-based',      intl: 'USD / GBP invoicing',    ztoClass: 'cmp-yes', freeClass: 'cmp-yes',   intlClass: 'cmp-no' },
  { label: 'Dedicated account manager', zto: 'From Growth plan upward',      free: 'You are the manager',  intl: 'Rotates every 6 months', ztoClass: 'cmp-yes', freeClass: 'cmp-maybe', intlClass: 'cmp-no' },
  { label: 'WhatsApp direct access',     zto: 'All plans',                   free: "When they're available", intl: 'Ticket system only',   ztoClass: 'cmp-yes', freeClass: 'cmp-maybe', intlClass: 'cmp-no' },
  { label: 'Minimum commitment',         zto: '3 months, then monthly',      free: 'Project by project',   intl: '12-month retainers',     ztoClass: 'cmp-yes', freeClass: 'cmp-maybe', intlClass: 'cmp-no' },
]

export default function Compare() {
  return (
    <section id="compare">
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">Why ZTO</div>
          <h2 className="section-title">ZTO vs. The <span className="gradient-text">Alternatives</span></h2>
          <p className="section-sub">Before you decide, compare what you're actually getting. The differences are significant.</p>
        </div>

        <div className="compare-wrap reveal">
          <div className="compare-table" role="table" aria-label="ZTO vs alternatives comparison">

            <div className="compare-header" role="row">
              <div className="compare-cell compare-label" role="columnheader">What you need</div>
              <div className="compare-cell compare-col--zto" role="columnheader">
                <span className="compare-col-badge">ZTO Agency</span>
              </div>
              <div className="compare-cell" role="columnheader">Freelancer</div>
              <div className="compare-cell" role="columnheader">International Agency</div>
            </div>

            {ROWS.map(r => (
              <div key={r.label} className="compare-row" role="row">
                <div className="compare-cell compare-label" role="cell">{r.label}</div>
                <div className="compare-cell compare-col--zto" role="cell"><span className={r.ztoClass}>{r.zto}</span></div>
                <div className="compare-cell" role="cell"><span className={r.freeClass}>{r.free}</span></div>
                <div className="compare-cell" role="cell"><span className={r.intlClass}>{r.intl}</span></div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  )
}
