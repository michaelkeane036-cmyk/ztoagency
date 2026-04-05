const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const supabase = require('../db/supabase');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter, signupLimiter } = require('../middleware/rateLimiter');
const { sendClientWelcome } = require('../utils/mailer');

const crypto = require('crypto');

const router = express.Router();

/* ── Cookie options ──────────────────────────────────────────
   httpOnly  → JS cannot read token (blocks XSS theft)
   sameSite  → blocks CSRF from cross-origin forms
   secure    → HTTPS-only in production
────────────────────────────────────────────────────────────── */
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/* ── Single-use refresh token store ─────────────────────────
   Stores JTIs of refresh tokens that have been used.
   Prevents replay attacks: once used, the old token is invalid.
   Cleans itself up after 7 days (matches token expiry).
────────────────────────────────────────────────────────────── */
const usedRefreshJtis = new Map(); // jti → expiresAt (ms)

function markJtiUsed(jti, expiresAt) {
  usedRefreshJtis.set(jti, expiresAt);
}
function isJtiUsed(jti) {
  const exp = usedRefreshJtis.get(jti);
  if (!exp) return false;
  if (Date.now() > exp) { usedRefreshJtis.delete(jti); return false; } // expired → clean up
  return true;
}

/* ── Login lockout (per email, in-memory) ───────────────────
   After MAX_FAILS failed attempts, block that email for
   LOCKOUT_MS regardless of IP. Clears on successful login.
────────────────────────────────────────────────────────────── */
const loginAttempts = new Map(); // email → { count, lockedUntil }
const MAX_FAILS   = 5;
const LOCKOUT_MS  = 15 * 60 * 1000; // 15 minutes

function recordFailedAttempt(email) {
  const now = Date.now();
  const entry = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_FAILS) entry.lockedUntil = now + LOCKOUT_MS;
  loginAttempts.set(email, entry);
}
function isLockedOut(email) {
  const entry = loginAttempts.get(email);
  if (!entry || entry.lockedUntil === 0) return false;
  if (Date.now() > entry.lockedUntil) { loginAttempts.delete(email); return false; }
  return true;
}
function clearAttempts(email) { loginAttempts.delete(email); }

/* ── Issue access + refresh tokens ──────────────────────────
   Every refresh token gets a unique JTI so it can be
   single-use invalidated without a DB round-trip.
────────────────────────────────────────────────────────────── */
function issueTokens(res, user) {
  const jti     = crypto.randomUUID();
  const payload = { sub: user.id, email: user.email, role: user.role };

  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ ...payload, jti }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  res.cookie('access_token',  accessToken,  { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

/* ── POST /api/auth/login ─────────────────────────────────── */
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { email, password } = req.body;
    const INVALID = 'Invalid email or password';

    if (isLockedOut(email)) {
      return res.status(429).json({ error: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, role, plan, is_active')
      .eq('email', email)
      .single();

    if (error || !user) {
      recordFailedAttempt(email);
      return res.status(401).json({ error: INVALID });
    }
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated. Contact ZTO support.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      recordFailedAttempt(email);
      return res.status(401).json({ error: INVALID });
    }

    clearAttempts(email);
    issueTokens(res, user);

    return res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, plan: user.plan },
    });
  }
);

/* ── POST /api/auth/signup ───────────────────────────────────
   Public registration — creates a client account.
   Account is active immediately; plan is null until admin assigns
   one or the client pays via Paystack.
────────────────────────────────────────────────────────────── */
router.post(
  '/signup',
  signupLimiter,
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/\d/).withMessage('Password must contain a number'),
    body('confirm_password').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { full_name, email, password } = req.body;

    // Check for existing account — intentionally vague response to prevent enumeration
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).single();
    if (existing) {
      // Return 201 anyway so attackers can't tell the email is taken
      return res.status(201).json({ message: 'If that email is new, your account has been created. Check your inbox.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ email, full_name, password_hash, role: 'client', is_active: true })
      .select('id, email, full_name, role, plan')
      .single();

    if (error) return res.status(500).json({ error: 'Account creation failed. Please try again.' });

    sendClientWelcome(user, password).catch(console.error);

    // Issue tokens so the user is immediately logged in after signup
    issueTokens(res, user);
    return res.status(201).json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, plan: user.plan },
    });
  }
);

/* ── POST /api/auth/logout ────────────────────────────────── */
router.post('/logout', (_req, res) => {
  res.clearCookie('access_token',  { ...COOKIE_OPTS });
  res.clearCookie('refresh_token', { ...COOKIE_OPTS });
  return res.json({ success: true });
});

/* ── POST /api/auth/refresh ───────────────────────────────── */
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Reject replayed tokens — each refresh token is single-use
    if (payload.jti && isJtiUsed(payload.jti)) {
      // Token reuse detected — possible token theft. Clear cookies immediately.
      res.clearCookie('access_token',  { ...COOKIE_OPTS });
      res.clearCookie('refresh_token', { ...COOKIE_OPTS });
      return res.status(401).json({ error: 'Token reuse detected. Please log in again.' });
    }

    if (payload.jti) {
      markJtiUsed(payload.jti, payload.exp * 1000);
    }

    issueTokens(res, { id: payload.sub, email: payload.email, role: payload.role });
    return res.json({ success: true });
  } catch {
    return res.status(401).json({ error: 'Refresh token invalid or expired' });
  }
});

/* ── GET /api/auth/me ─────────────────────────────────────── */
router.get('/me', requireAuth, async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, plan, is_active, created_at')
    .eq('id', req.user.id)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

/* ── POST /api/auth/change-password ──────────────────────── */
router.post(
  '/change-password',
  requireAuth,
  [
    body('current_password').notEmpty().withMessage('Current password required'),
    body('new_password')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
      .matches(/\d/).withMessage('Must contain a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { current_password, new_password } = req.body;

    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    const match = await bcrypt.compare(current_password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Current password incorrect' });

    const password_hash = await bcrypt.hash(new_password, 12);
    await supabase.from('users').update({ password_hash }).eq('id', req.user.id);

    return res.json({ success: true });
  }
);

module.exports = router;
