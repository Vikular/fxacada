-- ANALYTICS & REPORTS QUERIES

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
