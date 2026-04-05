import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const isHome   = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  function scrollTo(id) {
    if (!isHome) { window.location.href = `/#${id}`; return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''} role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="nav-inner">
            <Link to="/" className="nav-logo" aria-label="ZTO Marketing Agency home">
              <span className="z">Z</span>TO
            </Link>

            <div className="nav-links" role="list">
              <button className="nav-text-btn" role="listitem" onClick={() => scrollTo('services')}>Services</button>
              <button className="nav-text-btn" role="listitem" onClick={() => scrollTo('pricing')}>Pricing</button>
              <button className="nav-text-btn" role="listitem" onClick={() => scrollTo('contact')}>Contact</button>
            </div>

            <div className="nav-right">
              {user ? (
                <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                  <Link to={user.role === 'admin' ? '/admin' : '/portal'} className="nav-portal-link">
                    {user.role === 'admin' ? 'Dashboard' : 'My Portal'}
                  </Link>
                  <button className="nav-logout-btn" onClick={logout}>Sign Out</button>
                </div>
              ) : (
                <Link to="/login" className="nav-login-link">Client Login</Link>
              )}
              <button
                className="hamburger"
                id="hamburger"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(o => !o)}
              >
                <span className="hb-line" />
                <span className="hb-line" />
                <span className="hb-line" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <div className="mobile-menu-inner">
          <button className="mobile-link" onClick={() => scrollTo('services')}>Services</button>
          <button className="mobile-link" onClick={() => scrollTo('pricing')}>Pricing</button>
          <button className="mobile-link" onClick={() => scrollTo('contact')}>Contact</button>
          {user
            ? <Link to={user.role === 'admin' ? '/admin' : '/portal'} className="btn-primary mobile-cta">My Portal</Link>
            : <Link to="/login" className="btn-primary mobile-cta">Client Login</Link>
          }
        </div>
      </div>
    </>
  )
}
