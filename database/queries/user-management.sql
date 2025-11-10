-- USER MANAGEMENT QUERIES

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
