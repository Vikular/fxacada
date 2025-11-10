-- ============================================
-- SEED DATA FOR TESTING FX ACADEMY
-- ============================================
-- Use this to populate your database with test data
-- Run this AFTER schema.sql for development/testing only

-- ⚠️ WARNING: DO NOT RUN THIS ON PRODUCTION!

-- ============================================
-- 1. CREATE TEST STUDENTS
-- ============================================

-- Starter Tier Student
INSERT INTO users (email, password_hash, first_name, last_name, phone, country, tier, experience_level, goals, role, payment_status, is_active)
VALUES 
('john.starter@test.com', 'Test123!', 'John', 'Doe', '+1234567890', 'US', 'starter', 'beginner', 'Learn basics of forex trading', 'student', 'pending', true),
('sarah.starter@test.com', 'Test123!', 'Sarah', 'Smith', '+1234567891', 'UK', 'starter', 'beginner', 'Understand market trends', 'student', 'approved', true);

-- Core Tier Students
INSERT INTO users (email, password_hash, first_name, last_name, phone, country, tier, experience_level, goals, role, payment_status, is_active)
VALUES 
('mike.core@test.com', 'Test123!', 'Mike', 'Johnson', '+1234567892', 'CA', 'core', 'intermediate', 'Pass FTMO challenge', 'student', 'approved', true),
('emma.core@test.com', 'Test123!', 'Emma', 'Williams', '+1234567893', 'AU', 'core', 'intermediate', 'Consistent profitability', 'student', 'pending', true);

-- Pro Tier Students
INSERT INTO users (email, password_hash, first_name, last_name, phone, country, tier, experience_level, goals, role, payment_status, is_active)
VALUES 
('david.pro@test.com', 'Test123!', 'David', 'Martinez', '+1234567894', 'US', 'pro', 'advanced', 'Get funded account', 'student', 'approved', true),
('lisa.pro@test.com', 'Test123!', 'Lisa', 'Anderson', '+1234567895', 'UK', 'pro', 'advanced', 'Scale to $200K account', 'student', 'approved', true);

-- Inactive Student
INSERT INTO users (email, password_hash, first_name, last_name, phone, country, tier, experience_level, role, payment_status, is_active)
VALUES 
('inactive@test.com', 'Test123!', 'Inactive', 'User', '+1234567896', 'US', 'starter', 'beginner', 'student', 'rejected', false);

-- ============================================
-- 2. CREATE TEST ADMINS
-- ============================================

-- Limited Admin
INSERT INTO users (email, password_hash, first_name, last_name, role, payment_status, is_active)
VALUES 
('limitedadmin@test.com', 'Admin123!', 'Limited', 'Admin', 'limited-admin', 'approved', true);

-- Note: Super admin already created in schema.sql

-- ============================================
-- 3. CREATE TEST PAYMENT SUBMISSIONS
-- ============================================

-- Get user IDs (you'll need to replace these with actual IDs after running the above)
DO $$
DECLARE
  john_id UUID;
  sarah_id UUID;
  mike_id UUID;
  david_id UUID;
  admin_id UUID;
BEGIN
  -- Get test user IDs
  SELECT id INTO john_id FROM users WHERE email = 'john.starter@test.com';
  SELECT id INTO sarah_id FROM users WHERE email = 'sarah.starter@test.com';
  SELECT id INTO mike_id FROM users WHERE email = 'mike.core@test.com';
  SELECT id INTO david_id FROM users WHERE email = 'david.pro@test.com';
  SELECT id INTO admin_id FROM users WHERE email = 'admin@fxacademy.com';

  -- Pending payment
  INSERT INTO payment_submissions (user_id, payment_method, transaction_id, amount, tier, proof_url, notes, status)
  VALUES 
  (john_id, 'bank', 'TXN001234', 199.00, 'starter', 'https://example.com/proof1.jpg', 'Bank transfer completed', 'pending');

  -- Approved payment
  INSERT INTO payment_submissions (user_id, payment_method, transaction_id, amount, tier, proof_url, notes, status, reviewed_by, reviewed_at)
  VALUES 
  (sarah_id, 'paypal', 'PP123456', 199.00, 'starter', 'https://example.com/proof2.jpg', 'PayPal payment', 'approved', admin_id, NOW() - INTERVAL '2 days');

  -- Approved payment (Core)
  INSERT INTO payment_submissions (user_id, payment_method, transaction_id, amount, tier, proof_url, notes, status, reviewed_by, reviewed_at)
  VALUES 
  (mike_id, 'crypto', 'BTC789456', 499.00, 'core', 'https://example.com/proof3.jpg', 'Bitcoin payment', 'approved', admin_id, NOW() - INTERVAL '5 days');

  -- Approved payment (Pro)
  INSERT INTO payment_submissions (user_id, payment_method, transaction_id, amount, tier, proof_url, notes, status, reviewed_by, reviewed_at)
  VALUES 
  (david_id, 'bank', 'TXN999888', 999.00, 'pro', 'https://example.com/proof4.jpg', 'Wire transfer', 'approved', admin_id, NOW() - INTERVAL '10 days');

  -- Rejected payment
  INSERT INTO payment_submissions (user_id, payment_method, transaction_id, amount, tier, proof_url, notes, status, reviewed_by, reviewed_at, rejection_reason)
  VALUES 
  (john_id, 'other', 'TXN000111', 199.00, 'starter', 'https://example.com/proof5.jpg', 'Payment attempt 1', 'rejected', admin_id, NOW() - INTERVAL '1 day', 'Screenshot unclear, please resubmit');

END $$;

-- ============================================
-- 4. CREATE TEST FTMO SUBMISSIONS
-- ============================================

DO $$
DECLARE
  mike_id UUID;
  david_id UUID;
  lisa_id UUID;
  admin_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO mike_id FROM users WHERE email = 'mike.core@test.com';
  SELECT id INTO david_id FROM users WHERE email = 'david.pro@test.com';
  SELECT id INTO lisa_id FROM users WHERE email = 'lisa.pro@test.com';
  SELECT id INTO admin_id FROM users WHERE email = 'admin@fxacademy.com';

  -- Pending FTMO submission
  INSERT INTO ftmo_submissions (user_id, challenge_type, account_size, current_profit, trading_days, challenge_goal, challenges_facing, screenshot_url, status)
  VALUES 
  (mike_id, 'phase1', '50k', 3.5, 8, 'pass-phase1', 'Struggling with emotional control during losses', 'https://example.com/ftmo1.jpg', 'pending');

  -- In coaching
  INSERT INTO ftmo_submissions (user_id, challenge_type, account_size, current_profit, trading_days, challenge_goal, challenges_facing, screenshot_url, status, assigned_coach, coach_notes)
  VALUES 
  (david_id, 'phase2', '100k', 7.2, 12, 'get-funded', 'Need help with consistency', 'https://example.com/ftmo2.jpg', 'coaching', admin_id, 'Focus on risk management. Reduce lot sizes by 30%.');

  -- Completed
  INSERT INTO ftmo_submissions (user_id, challenge_type, account_size, current_profit, trading_days, challenge_goal, challenges_facing, screenshot_url, status, assigned_coach, coach_notes)
  VALUES 
  (lisa_id, 'funded', '200k', 15.8, 45, 'improve-consistency', 'None, account going well', 'https://example.com/ftmo3.jpg', 'completed', admin_id, 'Excellent progress! Passed all phases. Currently funded.');

END $$;

-- ============================================
-- 5. CREATE TEST ADMIN LOGS
-- ============================================

DO $$
DECLARE
  admin_id UUID;
  sarah_payment UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'admin@fxacademy.com';
  SELECT id INTO sarah_payment FROM payment_submissions WHERE transaction_id = 'PP123456';

  -- Log some admin actions
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
  VALUES 
  (admin_id, 'approved_payment', 'payment', sarah_payment, '{"amount": 199, "tier": "starter"}'::jsonb, '192.168.1.1'),
  (admin_id, 'updated_user', 'user', (SELECT id FROM users WHERE email = 'sarah.starter@test.com'), '{"field": "payment_status", "old": "pending", "new": "approved"}'::jsonb, '192.168.1.1'),
  (admin_id, 'login', NULL, NULL, '{"success": true}'::jsonb, '192.168.1.1');

END $$;

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Verify all test data was created
SELECT 'Total Users' as metric, COUNT(*)::text as value FROM users
UNION ALL
SELECT 'Students', COUNT(*)::text FROM users WHERE role = 'student'
UNION ALL
SELECT 'Admins', COUNT(*)::text FROM users WHERE role IN ('limited-admin', 'super-admin')
UNION ALL
SELECT 'Payment Submissions', COUNT(*)::text FROM payment_submissions
UNION ALL
SELECT 'FTMO Submissions', COUNT(*)::text FROM ftmo_submissions
UNION ALL
SELECT 'Admin Logs', COUNT(*)::text FROM admin_logs;

-- Show summary
SELECT 
  'Test Data Created!' as status,
  (SELECT COUNT(*) FROM users WHERE role = 'student') as students,
  (SELECT COUNT(*) FROM payment_submissions) as payments,
  (SELECT COUNT(*) FROM ftmo_submissions) as ftmo_submissions;

-- ============================================
-- TEST LOGIN CREDENTIALS
-- ============================================
/*
STUDENT ACCOUNTS (Password: Test123!)
- john.starter@test.com (Starter, Pending Payment)
- sarah.starter@test.com (Starter, Approved)
- mike.core@test.com (Core, Approved)
- emma.core@test.com (Core, Pending Payment)
- david.pro@test.com (Pro, Approved)
- lisa.pro@test.com (Pro, Approved)

ADMIN ACCOUNTS
- admin@fxacademy.com (Super Admin, Password: Admin123!)
- limitedadmin@test.com (Limited Admin, Password: Admin123!)
*/

-- ============================================
-- CLEANUP (Run this to remove all test data)
-- ============================================
/*
-- Uncomment to delete all test data:

DELETE FROM admin_logs WHERE admin_id IN (SELECT id FROM users WHERE email LIKE '%test.com');
DELETE FROM ftmo_submissions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test.com');
DELETE FROM payment_submissions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test.com');
DELETE FROM users WHERE email LIKE '%test.com';

*/
