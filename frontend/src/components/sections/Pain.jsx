export default function Pain() {
  const cards = [
    { img: 'officeZTO.webp', alt: 'Marketing team reviewing ad performance', title: 'Burning Ad Budget with Zero Returns', body: "You're running Meta & Google ads but can't see where the money goes or why it's not converting." },
    { img: 'office1.jpg',    alt: 'Team member on social media',             title: 'Social Media Feels Like Shouting Into the Void', body: "You post daily, get likes, but the DMs are dead and sales stay flat. Engagement without revenue is decoration." },
    { img: 'office2.jpg',    alt: 'Competitor analysis',                     title: 'Competitors Stealing Your Traffic & Customers', body: "You're invisible on Google. Your competitors rank #1 and they're not even better than you." },
    { img: 'image (3).jpg',  alt: 'Business scaling challenges',             title: 'Scaling Feels Impossible in This Economy', body: "Inflation, dollar rate, low purchasing power – every marketer says 'just boost the post' and it's not working." },
  ]

  return (
    <section id="pain">
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">The Problem</div>
          <h2 className="section-title">Sound Familiar?</h2>
          <p className="section-sub">You're not alone. Most Nigerian businesses hit the same walls. We break them.</p>
        </div>

        <div className="pain-grid">
          {cards.map((c, i) => (
            <div key={c.title} className={`pain-card reveal reveal-d${i + 1}`}>
              <div className="pain-icon">
                <img src={`/${c.img}`} alt={c.alt} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
