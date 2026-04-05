const express  = require('express');
const supabase = require('../db/supabase');
const { requireAuth } = require('../middleware/auth');
const { sanitizeStr } = require('../utils/sanitize');

const router = express.Router();

// All routes here require a valid login

/* ── GET /api/clients/dashboard ──────────────────────────────
   Returns the logged-in client's campaigns + latest reports.
────────────────────────────────────────────────────────────── */
router.get('/dashboard', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const [campaignsRes, reportsRes, paymentsRes] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, name, channel, status, spend, revenue, roas, start_date')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabase
      .from('reports')
      .select('id, title, created_at, file_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('payments')
      .select('id, plan, amount, status, created_at')
      .eq('user_id', userId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  return res.json({
    campaigns: campaignsRes.data || [],
    reports:   reportsRes.data   || [],
    payments:  paymentsRes.data  || [],
  });
});

/* ── GET /api/clients/messages ───────────────────────────────
   Returns thread between client and admin.
────────────────────────────────────────────────────────────── */
router.get('/messages', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, content, is_read, created_at,
      sender:sender_id (full_name, role)
    `)
    .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: 'Failed to fetch messages' });
  return res.json({ messages: data });
});

/* ── POST /api/clients/messages ──────────────────────────────
   Client sends a message to the admin.
────────────────────────────────────────────────────────────── */
router.post('/messages', requireAuth, async (req, res) => {
  const content = sanitizeStr(req.body.content);
  if (!content) return res.status(422).json({ error: 'Message content required' });

  // Find an admin to receive the message
  const { data: admin } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (!admin) return res.status(500).json({ error: 'No admin available' });

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id:   req.user.id,
      receiver_id: admin.id,
      content,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to send message' });
  return res.status(201).json({ message: data });
});

module.exports = router;
