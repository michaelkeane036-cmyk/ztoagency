import { useEffect, useRef } from 'react'

export default function Hero() {
  const canvasRef = useRef(null)

  // Particle effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let particles = []
    let raf

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.4,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        o: Math.random() * 0.5 + 0.1,
      })
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(251,191,36,${p.o})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section id="hero">
      <video className="hero-video" src="/lagos river bank.mp4" autoPlay muted loop playsInline aria-hidden="true" />
      <canvas ref={canvasRef} id="hero-canvas" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-badge">
          <span className="dot" aria-hidden="true" />
          Lagos-Based. Globally Competitive.
        </div>

        <h1 className="hero-headline">
          We Turn Nigerian<br /><em>Brands Into</em><br />Revenue Machines
        </h1>

        <p className="hero-sub">
          Data-driven paid ads, social media, SEO &amp; content marketing for Nigerian SMEs.
          Average client sees <strong>3–8× ROAS</strong> within 90 days.
        </p>

        <div className="hero-ctas">
          <a href="#contact" className="btn-primary" onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior:'smooth' }) }}>
            <svg className="icon-sm" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Book Free Strategy Call
          </a>
          <a href="#results" className="btn-ghost" onClick={e => { e.preventDefault(); document.getElementById('results')?.scrollIntoView({ behavior:'smooth' }) }}>
            See Client Results
            <svg className="icon-sm" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>

        <div className="hero-social-proof">
          <div className="sp-avatars" aria-hidden="true">
            {[1,2,3,4].map(i => <div key={i} className={`sp-av sp-av-${i}`} />)}
          </div>
          <p><strong>50+ Nigerian brands</strong> scaled with ZTO</p>
        </div>
      </div>
    </section>
  )
}
