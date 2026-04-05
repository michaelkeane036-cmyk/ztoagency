const express  = require('express');
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const supabase = require('../db/supabase');
const { requireAdmin } = require('../middleware/auth');
const { sendClientWelcome } = require('../utils/mailer');
const { sanitizeStr } = require('../utils/sanitize');

const router = express.Router();

// All routes here require role === 'admin'

/* ── GET /api/admin/overview ──────────────────────────────── */
router.get('/overview', requireAdmin, async (req, res) => {
  const [leadsRes, clientsRes, paymentsRes] = await Promise.all([
    supabase.from('leads').select('id, status, created_at').order('created_at', { ascending: false }),
    supabase.from('users').select('id, full_name, email, plan, is_active, created_at').eq('role', 'client'),
    supabase.from('payments').select('id, amount, plan, status, created_at').eq('status', 'success'),
  ]);

  const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + (p.amount / 100), 0);

  return res.json({
    leads:          leadsRes.data    || [],
    clients:        clientsRes.data  || [],
    payments:       paymentsRes.data || [],
    total_revenue:  totalRevenue,
    new_leads:      (leadsRes.data || []).filter(l => l.status === 'new').length,
    active_clients: (clientsRes.data || []).filter(c => c.is_active && c.plan).length,
  });
});

/* ── GET /api/admin/leads ─────────────────────────────────── */
router.get('/leads', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Failed to fetch leads' });
  return res.json({ leads: data });
});

/* ── PATCH /api/admin/leads/:id ───────────────────────────── */
router.patch('/leads/:id', requireAdmin, async (req, res) => {
  const status = sanitizeStr(req.body.status);
  const notes  = sanitizeStr(req.body.notes);
  const allowed = ['new', 'contacted', 'converted', 'lost'];
  if (status && !allowed.includes(status)) {
    return res.status(422).json({ error: 'Invalid status value' });
  }

  const update = {};
  if (status) update.status = status;
  if (notes !== undefined) update.notes = notes;
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('leads')
    .update(update)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to update lead' });
  return res.json({ lead: data });
});

/* ── GET /api/admin/clients ──────────────────────────────── */
router.get('/clients', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, plan, is_active, notes, created_at')
    .eq('role', 'client')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Failed to fetch clients' });
  return res.json({ clients: data });
});

/* ── POST /api/admin/clients ────────────────────────────────
   Create a client account and send them a welcome email
   with their temporary password.
────────────────────────────────────────────────────────────── */
router.post(
  '/clients',
  requireAdmin,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('full_name').trim().notEmpty().withMessage('Full name required'),
    body('plan').isIn(['ignite', 'accelerate', 'dominate']).withMessage('Invalid plan'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { email, full_name, plan } = req.body;

    // Check email doesn't already exist
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'Z1!';
    const password_hash = await bcrypt.hash(tempPassword, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ email, full_name, password_hash, role: 'client', plan, is_active: true })
      .select('id, email, full_name, plan')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to create client account' });

    sendClientWelcome(user, tempPassword).catch(console.error);

    return res.status(201).json({ user });
  }
);

/* ── PATCH /api/admin/clients/:id ─────────────────────────── */
router.patch('/clients/:id', requireAdmin, async (req, res) => {
  const { plan, is_active, notes } = req.body;
  const update = {};
  if (plan !== undefined)      update.plan      = plan;
  if (is_active !== undefined) update.is_active = is_active;
  if (notes !== undefined)     update.notes     = notes;
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', req.params.id)
    .eq('role', 'client')
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to update client' });
  return res.json({ client: data });
});

/* ── GET /api/admin/campaigns ─────────────────────────────── */
router.get('/campaigns', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: 'Failed to fetch campaigns' });
  return res.json({ campaigns: data || [] });
});

/* ── POST /api/admin/campaigns ────────────────────────────── */
router.post('/campaigns', requireAdmin, async (req, res) => {
  const { user_id, name, channel, spend, revenue, roas, start_date } = req.body;
  if (!user_id || !name || !channel) {
    return res.status(422).json({ error: 'user_id, name, and channel are required' });
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({ user_id, name, channel, spend: spend || 0, revenue: revenue || 0, roas: roas || 0, start_date, status: 'active' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to create campaign' });
  return res.status(201).json({ campaign: data });
});

/* ── PATCH /api/admin/campaigns/:id ───────────────────────── */
router.patch('/campaigns/:id', requireAdmin, async (req, res) => {
  const { spend, revenue, roas, status } = req.body;
  const update = {};
  if (spend    !== undefined) update.spend    = spend;
  if (revenue  !== undefined) update.revenue  = revenue;
  if (roas     !== undefined) update.roas     = roas;
  if (status   !== undefined) update.status   = status;
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('campaigns')
    .update(update)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to update campaign' });
  return res.json({ campaign: data });
});

/* ── POST /api/admin/reports ──────────────────────────────── */
router.post('/reports', requireAdmin, async (req, res) => {
  const { user_id, campaign_id, title, file_url, report_data } = req.body;
  if (!user_id || !title) return res.status(422).json({ error: 'user_id and title are required' });

  const { data, error } = await supabase
    .from('reports')
    .insert({ user_id, campaign_id, title, file_url, report_data })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to create report' });
  return res.status(201).json({ report: data });
});

/* ── GET /api/admin/messages ──────────────────────────────── */
router.get('/messages', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, content, is_read, created_at,
      sender:sender_id (id, full_name, role),
      receiver:receiver_id (id, full_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: 'Failed to fetch messages' });
  return res.json({ messages: data });
});

/* ── POST /api/admin/messages ─────────────────────────────── */
router.post('/messages', requireAdmin, async (req, res) => {
  const { receiver_id } = req.body;
  const content = sanitizeStr(req.body.content);
  if (!receiver_id || !content) {
    return res.status(422).json({ error: 'receiver_id and content are required' });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: req.user.id, receiver_id, content })
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Failed to send message' });
  return res.status(201).json({ message: data });
});

module.exports = router;
