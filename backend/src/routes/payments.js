const express  = require('express');
const axios    = require('axios');
const crypto   = require('crypto');
const supabase = require('../db/supabase');
const { requireAuth } = require('../middleware/auth');
const { paymentsLimiter } = require('../middleware/rateLimiter');
const { sendPaymentConfirmation } = require('../utils/mailer');

const router = express.Router();

const PAYSTACK_BASE = 'https://api.paystack.co';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/* ── Plan pricing (in kobo — Paystack uses lowest denomination) ── */
const PLANS = {
  ignite:     { name: 'Ignite',    amount: 25000000 }, // ₦250,000
  accelerate: { name: 'Accelerate', amount: 60000000 }, // ₦600,000
  // Dominate is custom — handled via contact form
};

/* ── POST /api/payments/initialize ──────────────────────────
   Authenticated — client initiates a subscription payment.
────────────────────────────────────────────────────────────── */
router.post('/initialize', requireAuth, paymentsLimiter, async (req, res) => {
  const { plan_id } = req.body;

  const plan = PLANS[plan_id];
  if (!plan) return res.status(400).json({ error: 'Invalid plan. Choose ignite or accelerate.' });

  // Fetch user's email from DB (never trust req.body for this)
  const { data: user } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', req.user.id)
    .single();

  const reference = `ZTO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  try {
    const { data } = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email: user.email,
        amount: plan.amount,
        reference,
        currency: 'NGN',
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
        metadata: {
          user_id: req.user.id,
          plan: plan_id,
          full_name: user.full_name,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Record the pending payment in DB
    await supabase.from('payments').insert({
      user_id: req.user.id,
      reference,
      amount: plan.amount,
      plan: plan.name,
      status: 'pending',
    });

    return res.json({
      authorization_url: data.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    return res.status(502).json({ error: 'Payment gateway error. Please try again.' });
  }
});

/* ── GET /api/payments/verify/:reference ─────────────────────
   Called after Paystack redirect — verifies the transaction.
────────────────────────────────────────────────────────────── */
router.get('/verify/:reference', requireAuth, async (req, res) => {
  const { reference } = req.params;

  try {
    const { data } = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const tx = data.data;
    if (tx.status !== 'success') {
      return res.status(402).json({ error: 'Payment not successful', paystack_status: tx.status });
    }

    // Update payment record
    await supabase
      .from('payments')
      .update({ status: 'success', paystack_data: tx })
      .eq('reference', reference);

    // Update user plan
    const planName = tx.metadata?.plan;
    if (planName) {
      await supabase
        .from('users')
        .update({ plan: planName })
        .eq('id', req.user.id);
    }

    // Send confirmation email
    const { data: user } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', req.user.id)
      .single();

    sendPaymentConfirmation(user, { reference, amount: tx.amount, plan: planName }).catch(console.error);

    return res.json({ success: true, plan: planName });
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    return res.status(502).json({ error: 'Verification failed. Please contact support.' });
  }
});

/* ── POST /api/payments/webhook ──────────────────────────────
   Paystack posts events here. MUST verify HMAC signature.
   Set this URL in your Paystack dashboard → Settings → Webhooks.
────────────────────────────────────────────────────────────── */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // raw body needed for HMAC
  (req, res) => {
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(req.body)
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Respond immediately — process async
    res.sendStatus(200);

    const event = JSON.parse(req.body);
    handleWebhookEvent(event).catch(err => console.error('Webhook handler error:', err));
  }
);

async function handleWebhookEvent(event) {
  if (event.event === 'charge.success') {
    const { reference, metadata, amount } = event.data;
    const userId = metadata?.user_id;
    const plan   = metadata?.plan;

    await supabase
      .from('payments')
      .update({ status: 'success', paystack_data: event.data })
      .eq('reference', reference);

    if (userId && plan) {
      await supabase.from('users').update({ plan }).eq('id', userId);
    }

    console.log(`✓ Webhook: charge.success — ref ${reference}, user ${userId}`);
  }

  if (event.event === 'subscription.disable') {
    const email = event.data?.customer?.email;
    if (email) {
      await supabase.from('users').update({ plan: null }).eq('email', email);
      console.log(`✓ Webhook: subscription.disable — ${email}`);
    }
  }
}

/* ── GET /api/payments/history ───────────────────────────────
   Client views their own payment history.
────────────────────────────────────────────────────────────── */
router.get('/history', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('payments')
    .select('id, reference, amount, plan, status, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Failed to fetch payment history' });
  return res.json({ payments: data });
});

module.exports = router;
