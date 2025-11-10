-- ============================================
-- COMMON SQL QUERIES FOR FX ACADEMY
-- ============================================
-- Quick reference for frequently used database operations

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Get all students
SELECT id, email, first_name, last_name, tier, payment_status, created_at
FROM users
WHERE role = 'student'
ORDER BY created_at DESC;

-- Search users by email or name
SELECT id, email, first_name, last_name, tier, payment_status
FROM users
WHERE role = 'student'
AND (
  email ILIKE '%search_term%' OR
  first_name ILIKE '%search_term%' OR
  last_name ILIKE '%search_term%'
);

-- Get user complete details
SELECT 
  u.*,
  (SELECT COUNT(*) FROM payment_submissions WHERE user_id = u.id) as total_payments,
  (SELECT COUNT(*) FROM ftmo_submissions WHERE user_id = u.id) as total_ftmo
FROM users u
WHERE u.id = 'user_id_here';

-- Update user tier
UPDATE users
SET tier = 'pro', updated_at = NOW()
WHERE id = 'user_id_here';

-- Approve user payment status
UPDATE users
SET payment_status = 'approved', updated_at = NOW()
WHERE id = 'user_id_here';

-- Deactivate user account
UPDATE users
SET is_active = false, updated_at = NOW()
WHERE id = 'user_id_here';

-- Create admin account
INSERT INTO users (email, password_hash, first_name, last_name, role, payment_status, is_active)
VALUES ('newadmin@fxacademy.com', 'SecurePassword123!', 'Admin', 'Name', 'limited-admin', 'approved', true);

-- ============================================
-- PAYMENT MANAGEMENT
-- ============================================

-- Get all pending payments
SELECT 
  p.id,
  p.transaction_id,
  p.amount,
  p.tier,
  p.payment_method,
  p.created_at,
  u.first_name || ' ' || u.last_name as student_name,
  u.email
FROM payment_submissions p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

-- Approve payment
UPDATE payment_submissions
SET 
  status = 'approved',
  reviewed_by = 'admin_user_id',
  reviewed_at = NOW(),
  updated_at = NOW()
WHERE id = 'payment_id_here';

-- Also update user payment status
UPDATE users
SET payment_status = 'approved', updated_at = NOW()
WHERE id = (SELECT user_id FROM payment_submissions WHERE id = 'payment_id_here');

-- Reject payment with reason
UPDATE payment_submissions
SET 
  status = 'rejected',
  rejection_reason = 'Reason for rejection',
  reviewed_by = 'admin_user_id',
  reviewed_at = NOW(),
  updated_at = NOW()
WHERE id = 'payment_id_here';

-- Get user's payment history
SELECT *
FROM payment_submissions
WHERE user_id = 'user_id_here'
ORDER BY created_at DESC;

-- ============================================
-- FTMO MANAGEMENT
-- ============================================

-- Get all pending FTMO submissions
SELECT 
  f.id,
  f.challenge_type,
  f.account_size,
  f.current_profit,
  f.trading_days,
  f.status,
  f.created_at,
  u.first_name || ' ' || u.last_name as student_name,
  u.email,
  u.tier
FROM ftmo_submissions f
JOIN users u ON f.user_id = u.id
WHERE f.status = 'pending'
ORDER BY f.created_at DESC;

-- Assign coach to FTMO submission
UPDATE ftmo_submissions
SET 
  status = 'coaching',
  assigned_coach = 'coach_user_id',
  updated_at = NOW()
WHERE id = 'ftmo_id_here';

-- Add coach notes
UPDATE ftmo_submissions
SET 
  coach_notes = 'Your notes here',
  updated_at = NOW()
WHERE id = 'ftmo_id_here';

-- Mark FTMO as completed
UPDATE ftmo_submissions
SET 
  status = 'completed',
  updated_at = NOW()
WHERE id = 'ftmo_id_here';

-- Get user's FTMO history
SELECT *
FROM ftmo_submissions
WHERE user_id = 'user_id_here'
ORDER BY created_at DESC;

-- ============================================
-- ANALYTICS & REPORTS
-- ============================================

-- Platform statistics
SELECT * FROM admin_stats;

-- Revenue by tier
SELECT 
  tier,
  COUNT(*) as student_count,
  SUM(CASE 
    WHEN tier = 'starter' THEN 199
    WHEN tier = 'core' THEN 499
    WHEN tier = 'pro' THEN 999
    ELSE 0
  END) as potential_revenue
FROM users
WHERE role = 'student' AND payment_status = 'approved'
GROUP BY tier;

-- Monthly enrollments
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as enrollments,
  COUNT(CASE WHEN tier = 'starter' THEN 1 END) as starter,
  COUNT(CASE WHEN tier = 'core' THEN 1 END) as core,
  COUNT(CASE WHEN tier = 'pro' THEN 1 END) as pro
FROM users
WHERE role = 'student'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Conversion rate (payments vs enrollments)
SELECT 
  COUNT(*) as total_students,
  COUNT(CASE WHEN payment_status = 'approved' THEN 1 END) as paid_students,
  ROUND(
    COUNT(CASE WHEN payment_status = 'approved' THEN 1 END)::NUMERIC / 
    COUNT(*)::NUMERIC * 100, 
    2
  ) as conversion_rate_percentage
FROM users
WHERE role = 'student';

-- Recent activity (last 30 days)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_students
FROM users
WHERE role = 'student'
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top performing admins
SELECT 
  u.first_name || ' ' || u.last_name as admin_name,
  COUNT(p.id) as payments_reviewed,
  COUNT(f.id) as ftmo_reviewed
FROM users u
LEFT JOIN payment_submissions p ON p.reviewed_by = u.id
LEFT JOIN ftmo_submissions f ON f.assigned_coach = u.id
WHERE u.role IN ('limited-admin', 'super-admin')
GROUP BY u.id, u.first_name, u.last_name
ORDER BY payments_reviewed DESC;

-- ============================================
-- ADMIN LOGS
-- ============================================

-- Recent admin actions
SELECT 
  al.*,
  u.first_name || ' ' || u.last_name as admin_name
FROM admin_logs al
JOIN users u ON al.admin_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;

-- Log admin action (insert)
INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
VALUES (
  'admin_user_id',
  'approved_payment',
  'payment',
  'payment_id',
  '{"amount": 499, "tier": "core"}'::jsonb
);

-- Actions by specific admin
SELECT action, COUNT(*) as count
FROM admin_logs
WHERE admin_id = 'admin_user_id'
GROUP BY action
ORDER BY count DESC;

-- ============================================
-- CLEANUP & MAINTENANCE
-- ============================================

-- Delete test users (BE CAREFUL!)
DELETE FROM users
WHERE email LIKE '%test%' OR email LIKE '%demo%';

-- Reset payment status for testing
UPDATE users
SET payment_status = 'pending'
WHERE email = 'test@example.com';

-- Clear old admin logs (older than 6 months)
DELETE FROM admin_logs
WHERE created_at < NOW() - INTERVAL '6 months';

-- Vacuum tables for performance
VACUUM ANALYZE users;
VACUUM ANALYZE payment_submissions;
VACUUM ANALYZE ftmo_submissions;

-- ============================================
-- BACKUP QUERIES
-- ============================================

-- Export all users (copy result to CSV)
SELECT 
  email,
  first_name,
  last_name,
  phone,
  country,
  tier,
  payment_status,
  created_at
FROM users
WHERE role = 'student'
ORDER BY created_at DESC;

-- Export payment data
SELECT 
  u.email,
  u.first_name || ' ' || u.last_name as name,
  p.amount,
  p.tier,
  p.payment_method,
  p.status,
  p.created_at
FROM payment_submissions p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
