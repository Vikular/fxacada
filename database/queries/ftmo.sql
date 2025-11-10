-- FTMO MANAGEMENT QUERIES

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
