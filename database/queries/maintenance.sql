-- CLEANUP & MAINTENANCE QUERIES

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

-- BACKUP QUERIES

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
