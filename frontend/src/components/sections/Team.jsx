const MEMBERS = [
  {
    photo: 'team-photo--1', name: 'Zara Adeyemi', role: 'Founder & Strategy Lead',
    bio: '8 years running performance campaigns across West Africa. Former growth lead at a Lagos fintech. Obsessed with data, results, and cutting waste.',
    tags: ['Paid Media','Strategy','Growth'],
  },
  {
    photo: 'team-photo--2', name: 'Tunde Obi', role: 'Head of Paid Media',
    bio: 'Meta Blueprint and Google Ads certified. Managed over ₦400M in ad spend. Specialises in e-commerce funnels and ROAS optimisation.',
    tags: ['Meta Ads','Google','ROAS'],
  },
  {
    photo: 'team-photo--3', name: 'Chisom Eze', role: 'SEO & Content Lead',
    bio: 'Ranked 30+ businesses on page one in Lagos, Abuja, and Port Harcourt. Writes content that both Google and real humans actually want to read.',
    tags: ['SEO','Content','Local Search'],
  },
  {
    photo: 'team-photo--4', name: 'Biodun Sule', role: 'Creative & Social Strategist',
    bio: 'Grew three brand TikTok accounts past 100K followers. Understands Naija internet culture on a level that makes content feel native, not produced.',
    tags: ['Social Media','Creative','TikTok'],
  },
]

export default function Team() {
  const delays = ['reveal-d1','reveal-d2','reveal-d3','reveal-d4']

  return (
    <section id="team">
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">The Team</div>
          <h2 className="section-title">The People Behind <span className="gradient-text">Your Growth</span></h2>
          <p className="section-sub">A tight-knit team of strategists, creatives, and analysts who've been in the Nigerian market long enough to know what actually works.</p>
        </div>

        <div className="team-grid">
          {MEMBERS.map((m, i) => (
            <div key={m.name} className={`team-card reveal ${delays[i]}`}>
              <div className={`team-photo ${m.photo}`} role="img" aria-label={m.name} />
              <div className="team-body">
                <h3 className="team-name">{m.name}</h3>
                <p className="team-role">{m.role}</p>
                <p className="team-bio">{m.bio}</p>
                <div className="team-tags">
                  {m.tags.map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
