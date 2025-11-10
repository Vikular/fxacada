-- ADMIN LOGS QUERIES

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
