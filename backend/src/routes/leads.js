const express   = require('express');
const { body, validationResult } = require('express-validator');
const supabase   = require('../db/supabase');
const { sendLeadNotification } = require('../utils/mailer');
const { leadsLimiter } = require('../middleware/rateLimiter');
const { sanitizeFields } = require('../utils/sanitize');

const router = express.Router();

/* ── POST /api/leads ─────────────────────────────────────────
   Public — rate-limited to 5 submissions per IP per hour.
   Saves the lead to Supabase and emails the ZTO admin team.
────────────────────────────────────────────────────────────── */
router.post(
  '/',
  leadsLimiter,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name too long'),
    body('contact')
      .trim()
      .notEmpty().withMessage('WhatsApp number or email is required')
      .isLength({ max: 200 }).withMessage('Contact too long'),
    body('business_type')
      .trim()
      .notEmpty().withMessage('Business type is required'),
    body('challenge')
      .trim()
      .optional()
      .isLength({ max: 1000 }).withMessage('Challenge text too long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, contact, business_type, challenge } = sanitizeFields(req.body);

    const { data, error } = await supabase
      .from('leads')
      .insert({ name, contact, business_type, challenge, status: 'new' })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save your request. Please try again.' });
    }

    // Fire-and-forget email — don't let email failure block the response
    sendLeadNotification(data).catch(err => console.error('Mailer error:', err));

    return res.status(201).json({ success: true, id: data.id });
  }
);

module.exports = router;
