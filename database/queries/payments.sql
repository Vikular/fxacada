-- PAYMENT MANAGEMENT QUERIES

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
