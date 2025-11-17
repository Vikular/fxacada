-- ============================================
-- FX ACADEMY (PIP NATION ACADEMY) DATABASE SCHEMA
-- ============================================
-- This file contains all table definitions and initial setup
-- Run this in your Supabase SQL Editor to set up the database

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores all user accounts (students, admins, leads)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status);

-- ============================================
-- 2. PAYMENT SUBMISSIONS TABLE
-- ============================================
-- Tracks payment proof uploads and verification status
CREATE TABLE IF NOT EXISTS payment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('bank', 'paypal', 'crypto', 'other')),
  transaction_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  tier TEXT CHECK (tier IN ('starter', 'core', 'pro')),
  proof_url TEXT, -- URL to uploaded payment screenshot
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID, -- Admin who reviewed
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_submissions(status);

-- ============================================
-- 3. FTMO SUBMISSIONS TABLE
-- ============================================
-- Tracks FTMO challenge submissions and coaching
CREATE TABLE IF NOT EXISTS ftmo_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('phase1', 'phase2', 'verification', 'funded')),
  account_size TEXT CHECK (account_size IN ('10k', '25k', '50k', '100k', '200k')),
  current_profit DECIMAL(10, 2), -- Current profit/loss percentage
  trading_days INTEGER,
  challenge_goal TEXT,
  challenges_facing TEXT, -- Main difficulties
  screenshot_url TEXT, -- URL to challenge dashboard screenshot
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'coaching', 'completed')),
  assigned_coach UUID, -- Admin/coach assigned
  coach_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ftmo_user_id ON ftmo_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_ftmo_status ON ftmo_submissions(status);

-- ============================================
-- 4. ADMIN LOGS TABLE
-- ============================================
-- Tracks all admin actions for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL, -- e.g., 'approved_payment', 'rejected_payment', 'updated_user'
  target_type TEXT, -- 'user', 'payment', 'ftmo'
  target_id UUID, -- ID of the affected record
  details JSONB, -- Additional details about the action
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON admin_logs(action);

-- ============================================
-- 4B. ADD FOREIGN KEY CONSTRAINTS
-- ============================================
-- Add foreign keys after all tables are created
ALTER TABLE payment_submissions 
  ADD CONSTRAINT fk_payment_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE payment_submissions 
  ADD CONSTRAINT fk_payment_reviewer 
  FOREIGN KEY (reviewed_by) REFERENCES users(id);

ALTER TABLE ftmo_submissions 
  ADD CONSTRAINT fk_ftmo_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ftmo_submissions 
  ADD CONSTRAINT fk_ftmo_coach 
  FOREIGN KEY (assigned_coach) REFERENCES users(id);

ALTER TABLE admin_logs 
  ADD CONSTRAINT fk_log_admin 
  FOREIGN KEY (admin_id) REFERENCES users(id);

-- ============================================
-- 5. AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
-- Automatically update 'updated_at' on record changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ftmo_updated_at
  BEFORE UPDATE ON ftmo_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. INSERT DEFAULT ADMIN ACCOUNT
-- ============================================
-- Create a default super admin account
-- Password: Admin123! (CHANGE THIS IMMEDIATELY IN PRODUCTION!)
INSERT INTO users (email, password_hash, first_name, last_name, role, payment_status, is_active)
VALUES (
  'admin@fxacademy.com',
  'Admin123!', -- TODO: Hash this password properly in production
  'Super',
  'Admin',
  'super-admin',
  'approved',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- NOTE: Since we're not using Supabase Auth, we'll disable RLS for now
-- You can enable it later when implementing proper authentication

-- Disable RLS on all tables (allows direct access via API keys)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ftmo_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want RLS enabled but permissive policies:
-- Uncomment the sections below to enable RLS with full access

/*
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ftmo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you'll add proper policies later)
CREATE POLICY "Allow all users operations" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all payment operations" ON payment_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all ftmo operations" ON ftmo_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all log operations" ON admin_logs FOR ALL USING (true) WITH CHECK (true);
*/

-- Collaborative public documents table
CREATE TABLE IF NOT EXISTS public_documents (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    author_id text NOT NULL,
    title character varying NOT NULL,
    content text NULL,
    likes integer DEFAULT 0 NOT NULL,
    CONSTRAINT public_documents_pkey PRIMARY KEY (id)
);

ALTER TABLE public_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_documents REPLICA IDENTITY FULL;
-- Add to realtime publication if needed (Supabase default: supabase_realtime)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public_documents;

-- RLS: Public read, insert, and update (likes)
CREATE POLICY "Public documents are readable by everyone"
  ON public_documents FOR SELECT TO public USING (true);
CREATE POLICY "Allow everyone to publish a document"
  ON public_documents FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow anyone to increment likes"
  ON public_documents FOR UPDATE TO public USING (true) WITH CHECK (true);

-- LLM generation history table for quiz/news/tools
CREATE TABLE IF NOT EXISTS generation_history (
    id bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id text NOT NULL, -- Storing the anonymous UUID generated in the client
    prompt text NOT NULL,
    response text NULL,
    CONSTRAINT generation_history_pkey PRIMARY KEY (id)
);

ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history REPLICA IDENTITY FULL;
-- Add to realtime publication if needed
-- ALTER PUBLICATION supabase_realtime ADD TABLE generation_history;

-- RLS: Allow all anonymous users to read and insert (client must filter by user_id)
CREATE POLICY "Allow all anonymous select"
  ON generation_history FOR SELECT TO anon USING (true);
CREATE POLICY "Allow all anonymous insert"
  ON generation_history FOR INSERT TO anon WITH CHECK (true);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Set up Storage buckets for file uploads (see storage-setup.sql)
-- 3. Update the default admin password
