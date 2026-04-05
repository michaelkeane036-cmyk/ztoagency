-- ══════════════════════════════════════════════════════════════
--  ZTO Marketing Agency — Supabase Database Schema
--  Run this entire file in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── 1. LEADS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL,
  contact       TEXT        NOT NULL,            -- WhatsApp number or email
  business_type TEXT,
  challenge     TEXT,
  status        TEXT        NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 2. USERS (clients + admins) ──────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  full_name     TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'client'
                CHECK (role IN ('client', 'admin')),
  plan          TEXT        CHECK (plan IN ('ignite', 'accelerate', 'dominate')),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 3. PAYMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES users(id) ON DELETE SET NULL,
  reference     TEXT        UNIQUE NOT NULL,
  amount        BIGINT      NOT NULL,            -- in kobo (₦1 = 100 kobo)
  plan          TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'success', 'failed')),
  paystack_data JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 4. CAMPAIGNS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  channel       TEXT        NOT NULL,            -- e.g. 'Meta', 'Google', 'TikTok'
  status        TEXT        NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'paused', 'completed')),
  spend         NUMERIC(14,2) DEFAULT 0,
  revenue       NUMERIC(14,2) DEFAULT 0,
  roas          NUMERIC(8,2)  DEFAULT 0,
  start_date    DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 5. REPORTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES users(id) ON DELETE CASCADE,
  campaign_id   UUID        REFERENCES campaigns(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  file_url      TEXT,                            -- link to PDF/Google Sheet
  report_data   JSONB,                           -- structured metric snapshot
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 6. MESSAGES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  receiver_id   UUID        REFERENCES users(id) ON DELETE SET NULL,
  content       TEXT        NOT NULL,
  is_read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ══════════════════════════════════════════════════════════════
--  INDEXES
-- ══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_leads_status       ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created      ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_payments_user      ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_campaigns_user     ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user       ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender    ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver  ON messages(receiver_id);


-- ══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY  (Supabase RLS)
--  Since we use the service_role key server-side, RLS is a
--  safety net — it prevents direct browser access to your DB
--  even if someone finds your anon key.
-- ══════════════════════════════════════════════════════════════
ALTER TABLE leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages  ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS entirely — safe for our server-side usage.
-- No browser (anon key) can read or write any table directly.


-- ══════════════════════════════════════════════════════════════
--  SEED: First admin user
--  Replace the password hash below!
--  Generate with: node -e "const b=require('bcryptjs');console.log(b.hashSync('ChangeMe@2026!',12))"
-- ══════════════════════════════════════════════════════════════
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@ztomarketing.com',
  '$2a$12$Uh7LUXNm4Y/ddBeYjLqV0uxen2VndYWDJU7n0XNOD1RNMWsnZoLuG',
  'ZTO Admin',
  'admin',
  TRUE
)
ON CONFLICT (email) DO NOTHING;
