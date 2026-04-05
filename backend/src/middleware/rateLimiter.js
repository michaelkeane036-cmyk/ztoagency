const rateLimit = require('express-rate-limit');

/** Strict limiter for login attempts — prevents brute-force */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Limiter for contact form submissions */
const leadsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  message: { error: 'Too many submissions from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Limiter for payment initialization */
const paymentsLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 10,
  message: { error: 'Too many payment requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Limiter for public signup — prevents account farming */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  message: { error: 'Too many signup attempts from this IP. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, leadsLimiter, paymentsLimiter, signupLimiter };
