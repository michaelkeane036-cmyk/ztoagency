/* ═══════════════════════════════════════════════════
   ZTO MARKETING AGENCY — main.js
   ═══════════════════════════════════════════════════ */

/* ─── NAVBAR SCROLL ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── MOBILE HAMBURGER MENU ─── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const menuLines = hamburger.querySelectorAll('.hb-line');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ─── SCROLL REVEAL (IntersectionObserver) ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── PARTICLE CANVAS ─── */
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize, { passive: true });

const PARTICLE_COUNT = 55;
const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
  x:     Math.random() * canvas.width,
  y:     Math.random() * canvas.height,
  vx:    (Math.random() - 0.5) * 0.4,
  vy:    (Math.random() - 0.5) * 0.4,
  r:     Math.random() * 1.8 + 0.8,
  alpha: Math.random() * 0.4 + 0.1,
}));

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.5})`;
    ctx.fill();
  });
  particles.forEach((a, i) => {
    for (let j = i + 1; j < particles.length; j++) {
      const b    = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 110) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,255,255,${0.055 * (1 - dist / 110)})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ─── REVENUE COUNTER ─── */
const counterEl = document.getElementById('revenue-counter');
let   counted   = false;

const counterObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    const duration = 2000;
    const start    = performance.now();
    const easeOut  = t => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      counterEl.textContent = '₦' + Math.floor(easeOut(progress) * 850) + 'M+';
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}, { threshold: 0.5 });

counterObserver.observe(counterEl);

/* ─── CONTACT FORM ─── */
const API_BASE = 'http://localhost:4000/api'; // change to your deployed URL in production

function showFieldError(fieldEl, message) {
  clearFieldError(fieldEl);
  const err = document.createElement('p');
  err.className = 'field-error';
  err.textContent = message;
  fieldEl.insertAdjacentElement('afterend', err);
  fieldEl.setAttribute('aria-invalid', 'true');
  fieldEl.classList.add('input-error');
}

function clearFieldError(fieldEl) {
  fieldEl.removeAttribute('aria-invalid');
  fieldEl.classList.remove('input-error');
  const existing = fieldEl.nextElementSibling;
  if (existing?.classList.contains('field-error')) existing.remove();
}

function validateForm() {
  const name     = document.getElementById('field-name');
  const contact  = document.getElementById('field-contact');
  const biz      = document.getElementById('field-biz');
  let valid = true;

  [name, contact, biz].forEach(f => clearFieldError(f));

  if (!name.value.trim()) {
    showFieldError(name, 'Please enter your name.');
    valid = false;
  }
  if (!contact.value.trim()) {
    showFieldError(contact, 'Please enter your WhatsApp number or email.');
    valid = false;
  }
  if (!biz.value) {
    showFieldError(biz, 'Please select your business type.');
    valid = false;
  }
  return valid;
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span style="opacity:.7">Sending…</span>';

  const payload = {
    name:          document.getElementById('field-name').value.trim(),
    contact:       document.getElementById('field-contact').value.trim(),
    business_type: document.getElementById('field-biz').value,
    challenge:     document.getElementById('field-challenge').value.trim(),
  };

  try {
    const res  = await fetch(`${API_BASE}/leads`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = data.errors?.[0]?.msg || data.error || 'Something went wrong. Please try again.';
      throw new Error(msg);
    }

    // Success — hide form, show confirmation
    document.getElementById('contact-form').style.display = 'none';
    document.getElementById('form-success').classList.add('show');

  } catch (err) {
    // Show error inline under the submit button
    const errorEl = document.getElementById('form-submit-error');
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
    btn.disabled  = false;
    btn.innerHTML = originalText;
  }
}

/* ─── FAQ ACCORDION ─── */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn    = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all others
    document.querySelectorAll('.faq-item.open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-answer').style.maxHeight = '0';
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* ─── STICKY MOBILE CTA (shows after scrolling past hero) ─── */
const stickyCta  = document.getElementById('sticky-cta');
const heroSection = document.getElementById('hero');

const ctaObserver = new IntersectionObserver((entries) => {
  stickyCta.classList.toggle('visible', !entries[0].isIntersecting);
}, { threshold: 0 });

ctaObserver.observe(heroSection);

/* ─── COOKIE BANNER ─── */
const cookieBanner  = document.getElementById('cookie-banner');
const cookieAccept  = document.getElementById('cookie-accept');
const cookieDecline = document.getElementById('cookie-decline');

if (!localStorage.getItem('zto_cookie_consent')) {
  setTimeout(() => cookieBanner.classList.add('show'), 1800);
}

function dismissCookie(value) {
  localStorage.setItem('zto_cookie_consent', value);
  cookieBanner.classList.remove('show');
}

cookieAccept.addEventListener('click',  () => dismissCookie('accepted'));
cookieDecline.addEventListener('click', () => dismissCookie('declined'));




/* ─── CASE STUDY MODALS ─── */
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const modalCta     = document.getElementById('modal-cta-btn');
const caseCards    = document.querySelectorAll('.case-card');
const modalMap     = ['fashion', 'saas', 'food'];

function openModal(id) {
  // Show only the matching content panel
  document.querySelectorAll('.modal-content').forEach(el => {
    el.style.display = el.dataset.modal === id ? 'block' : 'none';
  });
  modalOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  // Move focus to close button for accessibility
  modalClose.focus();
}

function closeModal() {
  modalOverlay.classList.remove('is-open');
  // Restore immediately — CSS transition handles the visual fade independently
  document.body.style.overflow = '';
}

caseCards.forEach((card, i) => {
  if (!modalMap[i]) return;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', () => openModal(modalMap[i]));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(modalMap[i]); }
  });
});

modalClose.addEventListener('click', closeModal);
// Click on dark backdrop (not the box itself) to close
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
// Escape key closes
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) closeModal();
});
// CTA inside modal
modalCta && modalCta.addEventListener('click', () => {
  closeModal();
  setTimeout(() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }), 360);
});

// Initialise: show first panel by default so box isn't empty if opened
const firstPanel = document.querySelector('.modal-content');
if (firstPanel) firstPanel.style.display = 'block';


/* ─── EXIT-INTENT POPUP ─── */
const exitPopup   = document.getElementById('exit-popup');
const exitClose   = document.getElementById('exit-popup-close');
const exitDismiss = document.getElementById('exit-popup-dismiss');
const exitCta     = document.getElementById('exit-popup-cta');
let   exitShown   = false;

function showExitPopup() {
  if (exitShown) return;
  if (sessionStorage.getItem('zto_exit_shown')) return;
  if (modalOverlay.classList.contains('is-open')) return;
  exitShown = true;
  sessionStorage.setItem('zto_exit_shown', '1');
  exitPopup.classList.add('is-open');
  // Lock scroll only on mobile where content behind the overlay can still drift
  if (window.innerWidth < 768) document.body.style.overflow = 'hidden';
}

function closeExitPopup() {
  exitPopup.classList.remove('is-open');
  // Restore scroll IMMEDIATELY — do not defer inside setTimeout
  document.body.style.overflow = '';
}

// Desktop: only fire when cursor reaches the very top of the viewport (heading to browser UI)
document.addEventListener('mouseleave', e => {
  if (e.clientY < 5) showExitPopup();
});

// Mobile: show after 50 seconds idle on page
setTimeout(() => {
  if ('ontouchstart' in window) showExitPopup();
}, 50000);

// All three close triggers — plain function call, no async
exitClose   && exitClose.addEventListener('click',   closeExitPopup);
exitDismiss && exitDismiss.addEventListener('click', closeExitPopup);

// Click the dark backdrop (not the white box) to close
exitPopup.addEventListener('click', e => {
  if (e.target === exitPopup) closeExitPopup();
});

// Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && exitPopup.classList.contains('is-open')) closeExitPopup();
});

// CTA: close popup first, then scroll — no href involved
exitCta && exitCta.addEventListener('click', () => {
  closeExitPopup();
  const contactSection = document.getElementById('contact');
  if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
});