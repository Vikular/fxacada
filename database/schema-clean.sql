-- ============================================
-- FX ACADEMY - CLEAN DATABASE SCHEMA
-- ============================================
-- Run this on a FRESH database or after dropping existing tables

-- ============================================
-- 0. ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. DROP EXISTING OBJECTS (if any)
-- ============================================
DROP VIEW IF EXISTS user_details CASCADE;
DROP VIEW IF EXISTS admin_stats CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS ftmo_submissions CASCADE;
DROP TABLE IF EXISTS payment_submissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT,
  tier TEXT CHECK (tier IN ('starter', 'core', 'pro')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  goals TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'lead', 'limited-admin', 'super-admin')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_payment_status ON users(payment_status);

-- ============================================
-- 3. PAYMENT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('bank', 'paypal', 'crypto', 'other')),
  transaction_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  tier TEXT CHECK (tier IN ('starter', 'core', 'pro')),
  proof_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX idx_payments_user_id ON payment_submissions(user_id);
CREATE INDEX idx_payments_status ON payment_submissions(status);
CREATE INDEX idx_payments_created_at ON payment_submissions(created_at);

-- ============================================
-- 4. FTMO SUBMISSIONS TABLE
-- ============================================
CREATE TABLE ftmo_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('phase1', 'phase2', 'verification', 'funded')),
  account_size TEXT CHECK (account_size IN ('10k', '25k', '50k', '100k', '200k')),
  current_profit NUMERIC(10, 2),
  trading_days INTEGER,
  challenge_goal TEXT,
  challenges_facing TEXT,
  screenshot_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'coaching', 'completed')),
  assigned_coach UUID,
  coach_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_ftmo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ftmo_coach FOREIGN KEY (assigned_coach) REFERENCES users(id)
);

CREATE INDEX idx_ftmo_user_id ON ftmo_submissions(user_id);
CREATE INDEX idx_ftmo_status ON ftmo_submissions(status);
CREATE INDEX idx_ftmo_created_at ON ftmo_submissions(created_at);
CREATE INDEX idx_ftmo_user_created ON ftmo_submissions(user_id, created_at);

-- ============================================
-- 5. ADMIN LOGS TABLE
-- ============================================
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX idx_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_logs_action ON admin_logs(action);
CREATE INDEX idx_logs_created_at ON admin_logs(created_at);

-- ============================================
-- 6. AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_update_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_payments_update_timestamp
  BEFORE UPDATE ON payment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ftmo_update_timestamp
  BEFORE UPDATE ON ftmo_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. INSERT DEFAULT ADMIN ACCOUNT
-- ============================================
-- Note: Password should be hashed in production
-- This is a placeholder - CHANGE IMMEDIATELY after setup
INSERT INTO users (email, password_hash, first_name, last_name, role, payment_status, is_active)
VALUES (
  'admin@fxacademy.com',
  'CHANGE_THIS_PASSWORD',
  'Super',
  'Admin',
  'super-admin',
  'approved',
  true
);

-- ============================================
-- 8. ROW LEVEL SECURITY
-- ============================================
-- Disabled for now - enable with proper policies in production
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ftmo_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. ANALYTICS VIEWS
-- ============================================
CREATE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM users WHERE role = 'student' AND payment_status = 'pending') as pending_payments,
  (SELECT COUNT(*) FROM payment_submissions WHERE status = 'pending') as pending_payment_reviews,
  (SELECT COUNT(*) FROM ftmo_submissions WHERE status = 'pending') as pending_ftmo_reviews,
  (SELECT COUNT(*) FROM users WHERE role = 'student' AND tier = 'starter') as starter_count,
  (SELECT COUNT(*) FROM users WHERE role = 'student' AND tier = 'core') as core_count,
  (SELECT COUNT(*) FROM users WHERE role = 'student' AND tier = 'pro') as pro_count,
  COALESCE((SELECT SUM(amount) FROM payment_submissions WHERE status = 'approved'), 0) as total_revenue;

CREATE VIEW user_details AS
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.phone,
  u.country,
  u.tier,
  u.experience_level,
  u.role,
  u.payment_status,
  u.is_active,
  u.created_at,
  (SELECT COUNT(*) FROM payment_submissions WHERE user_id = u.id) as payment_count,
  (SELECT COUNT(*) FROM ftmo_submissions WHERE user_id = u.id) as ftmo_count,
  (SELECT status FROM payment_submissions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as latest_payment_status,
  (SELECT status FROM ftmo_submissions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as latest_ftmo_status
FROM users u;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Verify with: SELECT * FROM users WHERE role = 'super-admin';
