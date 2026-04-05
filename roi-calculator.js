/* ═══════════════════════════════════════════════════════════════
   ZTO MARKETING AGENCY — ROI Calculator
   Embedded via React UMD + Babel Standalone (no build step)
   ═══════════════════════════════════════════════════════════════ */

const INDUSTRIES = [
  { id: "ecommerce",  label: "E-Commerce / Online Store",    roasLift: 3.1 },
  { id: "retail",     label: "Physical Retail / Restaurant", roasLift: 2.6 },
  { id: "saas",       label: "Tech / SaaS Startup",          roasLift: 2.2 },
  { id: "realestate", label: "Real Estate",                  roasLift: 2.8 },
  { id: "services",   label: "Professional Services",        roasLift: 2.1 },
  { id: "fmcg",       label: "FMCG / Consumer Brand",        roasLift: 2.9 },
  { id: "media",      label: "Media / Entertainment",        roasLift: 1.9 },
];

// ── Formatting helper ────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1_000_000) return "₦" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return "₦" + Math.round(n / 1_000).toLocaleString() + "K";
  return "₦" + Math.round(n).toLocaleString();
}

// ── Animated number hook ─────────────────────────────────────────────────────
function useAnimatedNumber(target, duration = 750) {
  const [display, setDisplay] = React.useState(target);
  const raf      = React.useRef(null);
  const startRef = React.useRef(null);
  const fromRef  = React.useRef(target);

  React.useEffect(() => {
    const from = fromRef.current;
    const to   = target;
    if (from === to) return;
    cancelAnimationFrame(raf.current);
    startRef.current = null;

    function step(ts) {
      if (!startRef.current) startRef.current = ts;
      const p    = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * ease);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else        fromRef.current = to;
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return display;
}

// ── Slider component ─────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, display, hint }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="roi-slider-wrap">
      <div className="roi-slider-header">
        <span className="roi-input-label">{label}</span>
        <span className="roi-slider-value">{display(value)}</span>
      </div>
      <div className="roi-track">
        <div className="roi-track-fill" style={{ width: `${pct}%` }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          className="roi-range"
        />
        <div className="roi-thumb" style={{ left: `${pct}%` }} />
      </div>
      {hint && <p className="roi-hint">{hint}</p>}
    </div>
  );
}

// ── Bar row ──────────────────────────────────────────────────────────────────
function BarRow({ label, value, max, color }) {
  const pct = (value / max) * 100;
  return (
    <div className="roi-bar-row">
      <span className="roi-bar-label">{label}</span>
      <div className="roi-bar-track">
        <div className="roi-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="roi-bar-val">{fmt(value)}</span>
    </div>
  );
}

// ── Main calculator ──────────────────────────────────────────────────────────
function ROICalculator() {
  const [spend,   setSpend]   = React.useState(500);
  const [curRoas, setCurRoas] = React.useState(1.8);
  const [indId,   setIndId]   = React.useState("ecommerce");
  const [open,    setOpen]    = React.useState(false);

  const industry = INDUSTRIES.find(i => i.id === indId);
  const spendN   = spend * 1000;
  const nowRev   = spendN * curRoas;
  const ztoRoas  = Math.min(curRoas + industry.roasLift, curRoas * 3.5);
  const ztoRev   = spendN * ztoRoas;
  const uplift   = ztoRev - nowRev;
  const maxRev   = Math.max(nowRev, ztoRev, 1);

  const plan = spend <= 500  ? { name: "Ignite",      cost: 250_000 }
             : spend <= 2000 ? { name: "Accelerate",  cost: 600_000 }
             :                 { name: "Dominate",     cost: null    };

  const annUplift = uplift * 12;
  const annCost   = plan.cost ? plan.cost * 12 : 0;
  const netAnnual = plan.cost ? annUplift - annCost : null;
  const roi       = plan.cost ? ((uplift - plan.cost) / plan.cost) * 100 : null;

  const animUplift = useAnimatedNumber(uplift);
  const animZtoRev = useAnimatedNumber(ztoRev);
  const animNowRev = useAnimatedNumber(nowRev);
  const animZtoR   = useAnimatedNumber(ztoRoas);

  return (
    <div className="roi-wrap">

      {/* ── Header ── */}
      <div className="roi-header">
        <div className="roi-tag">
          <span className="roi-tag-dot" />
          ZTO ROI Calculator
        </div>
        <h2 className="roi-title">
          See Your Revenue Potential<br />
          <span className="roi-title-white">With ZTO</span>
        </h2>
        <p className="roi-subtitle">
          Based on real results across 50+ Nigerian campaigns. Adjust the inputs and your projections update live.
        </p>
      </div>

      <div className="roi-grid">

        {/* ── Inputs ── */}
        <div className="roi-card">
          <span className="roi-section-label">Your inputs</span>

          <div className="roi-field">
            <span className="roi-input-label">Industry</span>
            <select
              value={indId}
              onChange={e => setIndId(e.target.value)}
              className="roi-select"
            >
              {INDUSTRIES.map(i => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
          </div>

          <Slider
            label="Monthly ad spend"
            value={spend} min={100} max={5000} step={50}
            onChange={setSpend}
            display={v => v >= 1000 ? `₦${(v / 1000).toFixed(1)}M` : `₦${v}K`}
            hint="Your current monthly paid ads budget"
          />

          <Slider
            label="Current ROAS"
            value={curRoas} min={0.5} max={6} step={0.1}
            onChange={setCurRoas}
            display={v => v.toFixed(1) + "×"}
            hint="Revenue earned per ₦1 spent on ads right now"
          />

          <div className="roi-plan-badge">
            <span className="roi-plan-dot" />
            <p>
              Recommended plan: <strong>{plan.name}</strong>
              {plan.cost ? ` — ${fmt(plan.cost)}/mo` : " — Custom scope"}
            </p>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="roi-card">
          <span className="roi-section-label">Your projections</span>

          {/* ROAS comparison */}
          <div className="roi-roas-row">
            <div className="roi-roas-box">
              <p className="roi-roas-label">Current ROAS</p>
              <p className="roi-roas-val">{curRoas.toFixed(1)}×</p>
            </div>
            <div className="roi-roas-box roi-roas-box--gold">
              <p className="roi-roas-label roi-roas-label--gold">Projected with ZTO</p>
              <p className="roi-roas-val roi-roas-val--gold">{animZtoR.toFixed(1)}×</p>
            </div>
          </div>

          {/* Uplift hero */}
          <div className="roi-uplift-hero">
            <p className="roi-uplift-label">Additional monthly revenue</p>
            <p className="roi-uplift-num">{fmt(animUplift)}</p>
            <p className="roi-uplift-sub">extra every month from the same ad spend</p>
          </div>

          {/* Revenue cards */}
          <div className="roi-rev-row">
            <div className="roi-rev-card">
              <p className="roi-rev-label">Revenue now</p>
              <p className="roi-rev-val">{fmt(animNowRev)}</p>
              <p className="roi-rev-sub">at {curRoas.toFixed(1)}× ROAS</p>
            </div>
            <div className="roi-rev-card roi-rev-card--lit">
              <p className="roi-rev-label roi-rev-label--lit">Revenue with ZTO</p>
              <p className="roi-rev-val roi-rev-val--lit">{fmt(animZtoRev)}</p>
              <p className="roi-rev-sub">at {ztoRoas.toFixed(1)}× ROAS</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="roi-bars">
            <p className="roi-bars-title">Revenue comparison</p>
            <BarRow label="Right now" value={nowRev} max={maxRev} color="rgba(255,255,255,0.22)" />
            <BarRow label="With ZTO"  value={ztoRev} max={maxRev} color="#FFFFFF" />
          </div>

          {/* Annual toggle */}
          <button className="roi-toggle" onClick={() => setOpen(v => !v)}>
            <span>See 12-month breakdown</span>
            <svg
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {open && (
            <div className="roi-annual">
              <p className="roi-section-label" style={{ marginBottom: 14 }}>12-month view</p>
              {[
                { label: "Annual revenue uplift", value: annUplift,  color: "#F1F5F9", note: null },
                { label: "Annual ZTO cost",       value: annCost,    color: "#94A3B8", note: !plan.cost ? "Custom pricing" : null },
                { label: "Net annual gain",       value: netAnnual,  color: "#FBBF24", note: !plan.cost ? "Contact us" : null },
              ].map(({ label, value, color, note }) => (
                <div className="roi-annual-row" key={label}>
                  <span className="roi-annual-label">{label}</span>
                  <span className="roi-annual-val" style={{ color }}>
                    {note || (value != null ? fmt(value) : "—")}
                  </span>
                </div>
              ))}
              {roi != null && (
                <div className="roi-annual-row roi-annual-row--last">
                  <span className="roi-annual-label">ROI on retainer</span>
                  <span className="roi-annual-val roi-annual-val--gold">
                    {roi > 0 ? "+" : ""}{Math.round(roi)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── CTA ── */}
      <div className="roi-cta-box">
        <div className="roi-cta-text">
          <p className="roi-cta-title">
            Want a projection specific to <em>your</em> business?
          </p>
          <p className="roi-cta-sub">
            These numbers use industry averages. In a free 30-minute call we'll audit your actual ad accounts and give you a personalised forecast — no obligation.
          </p>
        </div>
        <div className="roi-cta-btns">
          <a href="#contact" className="roi-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Book My Free Strategy Call
          </a>
          <a href="#pricing" className="roi-btn-outline">View Pricing Plans</a>
        </div>
      </div>

    </div>
  );
}

// ── Mount ────────────────────────────────────────────────────────────────────
const roiRoot = document.getElementById('roi-calculator-root');
if (roiRoot) {
  ReactDOM.createRoot(roiRoot).render(React.createElement(ROICalculator));
}