-- ============================================
-- VERIFICATION SCRIPT
-- ============================================
-- Run this after completing setup to verify everything is working
-- This script checks all tables, buckets, and policies

-- ============================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================
SELECT 
  '1. TABLES' as section,
  table_name,
  CASE 
    WHEN table_name IN ('users', 'payment_submissions', 'ftmo_submissions', 'admin_logs') 
    THEN '✓ FOUND' 
    ELSE '✗ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'payment_submissions', 'ftmo_submissions', 'admin_logs')
ORDER BY table_name;

-- ============================================
-- 2. CHECK RECORD COUNTS
-- ============================================
SELECT 
  '2. DATA' as section,
  'users' as table_name,
  COUNT(*)::text as record_count,
  CASE WHEN COUNT(*) >= 1 THEN '✓ Has admin' ELSE '✗ No admin' END as status
FROM users
UNION ALL
SELECT '2. DATA', 'payment_submissions', COUNT(*)::text, '✓ Ready' FROM payment_submissions
UNION ALL
SELECT '2. DATA', 'ftmo_submissions', COUNT(*)::text, '✓ Ready' FROM ftmo_submissions
UNION ALL
SELECT '2. DATA', 'admin_logs', COUNT(*)::text, '✓ Ready' FROM admin_logs;

-- ============================================
-- 3. CHECK ADMIN ACCOUNT
-- ============================================
SELECT 
  '3. ADMIN' as section,
  email,
  first_name || ' ' || last_name as name,
  role,
  is_active,
  CASE 
    WHEN role = 'super-admin' AND is_active = true 
    THEN '✓ READY' 
    ELSE '✗ CHECK' 
  END as status
FROM users 
WHERE role IN ('super-admin', 'limited-admin');

-- ============================================
-- 4. CHECK STORAGE BUCKETS
-- ============================================
SELECT 
  '4. STORAGE' as section,
  name as bucket_name,
  public as is_public,
  CASE 
    WHEN name IN ('payment-proofs', 'ftmo-screenshots') 
    THEN '✓ FOUND' 
    ELSE '✗ UNEXPECTED' 
  END as status
FROM storage.buckets
ORDER BY name;

-- ============================================
-- 5. CHECK INDEXES
-- ============================================
SELECT 
  '5. INDEXES' as section,
  indexname as index_name,
  tablename as table_name,
  '✓ CREATED' as status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'payment_submissions', 'ftmo_submissions', 'admin_logs')
  AND indexname NOT LIKE '%pkey'
ORDER BY tablename, indexname;

-- ============================================
-- 6. CHECK RLS (ROW LEVEL SECURITY)
-- ============================================
SELECT 
  '6. SECURITY' as section,
  tablename as table_name,
  CASE 
    WHEN rowsecurity = true THEN '✓ ENABLED' 
    ELSE '✗ DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'payment_submissions', 'ftmo_submissions', 'admin_logs')
ORDER BY tablename;

-- ============================================
-- 7. CHECK POLICIES COUNT
-- ============================================
SELECT 
  '7. POLICIES' as section,
  tablename as table_name,
  COUNT(*)::text as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ SET' 
    ELSE '✗ MISSING' 
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'payment_submissions', 'ftmo_submissions', 'admin_logs')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 8. CHECK TRIGGERS
-- ============================================
SELECT 
  '8. TRIGGERS' as section,
  trigger_name,
  event_object_table as table_name,
  '✓ ACTIVE' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- ============================================
-- 9. CHECK VIEWS
-- ============================================
SELECT 
  '9. VIEWS' as section,
  table_name as view_name,
  CASE 
    WHEN table_name IN ('admin_stats', 'user_details') 
    THEN '✓ CREATED' 
    ELSE '?' 
  END as status
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 10. FINAL SUMMARY
-- ============================================
SELECT 
  '10. SUMMARY' as section,
  'SETUP STATUS' as item,
  CASE 
    WHEN 
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'payment_submissions', 'ftmo_submissions', 'admin_logs')) = 4
      AND (SELECT COUNT(*) FROM users WHERE role = 'super-admin') >= 1
      AND (SELECT COUNT(*) FROM storage.buckets WHERE name IN ('payment-proofs', 'ftmo-screenshots')) = 2
      AND (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN ('users', 'payment_submissions', 'ftmo_submissions', 'admin_logs')) = 4
    THEN '✅ ALL SYSTEMS GO!' 
    ELSE '⚠️ NEEDS ATTENTION' 
  END as status;

-- ============================================
-- EXPECTED RESULTS SUMMARY
-- ============================================
/*
✓ 4 tables created
✓ At least 1 admin user
✓ 2 storage buckets (private)
✓ Multiple indexes per table
✓ RLS enabled on all tables
✓ Policies set on all tables
✓ Update triggers active
✓ 2 helper views created
✓ Final status: ALL SYSTEMS GO!

If you see any ✗ or ⚠️ symbols, review the setup steps.
*/

-- ============================================
-- QUICK TESTS
-- ============================================
-- Uncomment to test:

-- Test 1: Can we query users?
-- SELECT COUNT(*) as user_count FROM users;

-- Test 2: Can we query payments?
-- SELECT COUNT(*) as payment_count FROM payment_submissions;

-- Test 3: Can we query FTMO?
-- SELECT COUNT(*) as ftmo_count FROM ftmo_submissions;

-- Test 4: Can we use the stats view?
-- SELECT * FROM admin_stats;

-- Test 5: Can we use the user details view?
-- SELECT * FROM user_details LIMIT 5;
