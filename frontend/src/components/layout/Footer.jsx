export default function Footer() {
  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">
              <span className="z">Z</span>TO
              <svg className="icon-xs" aria-hidden="true"><use href="/icons.svg#ic-external" /></svg>
            </div>
            <div className="footer-copy">© {new Date().getFullYear()} ZTO Marketing Agency. All rights reserved.</div>
          </div>
          <nav className="footer-socials" aria-label="Social media links">
            <a href="#" className="social-btn" aria-label="ZTO on Instagram">
              <svg aria-hidden="true"><use href="/icons.svg#ic-instagram" /></svg>
            </a>
            <a href="#" className="social-btn" aria-label="ZTO on X (Twitter)">
              <svg aria-hidden="true"><use href="/icons.svg#ic-twitter-x" /></svg>
            </a>
            <a href="#" className="social-btn" aria-label="ZTO on LinkedIn">
              <svg aria-hidden="true"><use href="/icons.svg#ic-linkedin" /></svg>
            </a>
            <a href="#" className="social-btn" aria-label="ZTO on TikTok">
              <svg aria-hidden="true"><use href="/icons.svg#ic-tiktok" /></svg>
            </a>
          </nav>
          <div className="footer-naija">Built with precision in Nigeria 🇳🇬</div>
        </div>
      </div>
    </footer>
  )
}
