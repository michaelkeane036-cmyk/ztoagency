const POSTS = [
  {
    imgClass: 'blog-img--ads',
    alt: 'Article about Nigerian ad budget waste',
    cat: 'Paid Ads',
    title: 'Why Nigerian Brands Waste 70% of Their Ad Budget (And How to Fix It)',
    excerpt: 'Most Meta campaigns in Nigeria fail at the audience level. Here\'s the targeting framework we use to stop the bleed.',
    readTime: '8 min read',
  },
  {
    imgClass: 'blog-img--social',
    alt: 'Article about social media sales in Nigeria',
    cat: 'Social Media',
    title: 'The Naija Social Media Playbook: How to Turn Followers Into Buyers',
    excerpt: 'Virality without sales is just noise. Here\'s how we build content systems that convert engagement into revenue.',
    readTime: '6 min read',
  },
  {
    imgClass: 'blog-img--seo',
    alt: 'Article about local SEO in Lagos',
    cat: 'SEO',
    title: 'Local SEO in Lagos: How to Rank #1 Before Your Competitor Does',
    excerpt: 'Google My Business alone isn\'t enough. The three-layer local SEO strategy we use to dominate Lagos search results.',
    readTime: '10 min read',
  },
]

export default function Blog() {
  const delays = ['reveal-d1','reveal-d2','reveal-d3']

  return (
    <section id="blog">
      <div className="container">
        <div className="text-center reveal">
          <div className="section-tag">Insights</div>
          <h2 className="section-title">From the <span className="gradient-text">ZTO Playbook</span></h2>
          <p className="section-sub">Practical, no-fluff marketing knowledge built for the Nigerian market.</p>
        </div>

        <div className="blog-grid">
          {POSTS.map((p, i) => (
            <article key={p.title} className={`blog-card reveal ${delays[i]}`}>
              <div className={`blog-img ${p.imgClass}`} role="img" aria-label={p.alt} />
              <div className="blog-body">
                <span className="blog-cat">{p.cat}</span>
                <h3 className="blog-title">{p.title}</h3>
                <p className="blog-excerpt">{p.excerpt}</p>
                <div className="blog-meta">
                  <span className="blog-time">⏱ {p.readTime}</span>
                  <a href="#" className="blog-read" aria-label={`Read article: ${p.title}`}>
                    Read article →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
