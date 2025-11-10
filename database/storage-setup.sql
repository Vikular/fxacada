-- ============================================
-- STORAGE BUCKETS SETUP FOR FX ACADEMY
-- ============================================
-- This file sets up storage buckets for file uploads
-- Run this in your Supabase SQL Editor AFTER running schema.sql

-- ============================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================
-- Note: You need to create these buckets in the Supabase Dashboard:
-- Storage → Create Bucket

-- Bucket 1: payment-proofs
-- - For payment screenshots and receipts
-- - File types: JPG, PNG, PDF
-- - Max size: 5MB

-- Bucket 2: ftmo-screenshots
-- - For FTMO challenge dashboard screenshots
-- - File types: JPG, PNG
-- - Max size: 5MB

-- ============================================
-- 2. STORAGE POLICIES
-- ============================================
-- After creating buckets in the Dashboard, run these policies:

-- Payment Proofs Bucket Policies
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view own payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('limited-admin', 'super-admin')
    )
  )
);

-- Allow users to update their own files
CREATE POLICY "Users can update own payment proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own payment proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all payment proofs
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id::text = auth.uid()::text
    AND role IN ('limited-admin', 'super-admin')
  )
);

-- FTMO Screenshots Bucket Policies
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload ftmo screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ftmo-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view own ftmo screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ftmo-screenshots' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('limited-admin', 'super-admin')
    )
  )
);

-- Allow users to update their own files
CREATE POLICY "Users can update own ftmo screenshots"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ftmo-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own ftmo screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ftmo-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all ftmo screenshots
CREATE POLICY "Admins can view all ftmo screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ftmo-screenshots' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id::text = auth.uid()::text
    AND role IN ('limited-admin', 'super-admin')
  )
);

-- ============================================
-- STORAGE SETUP INSTRUCTIONS
-- ============================================
/*
1. Go to Supabase Dashboard → Storage
2. Create two buckets:
   - Name: payment-proofs
     - Public: No (private)
     - File size limit: 5242880 (5MB)
     - Allowed MIME types: image/jpeg, image/png, application/pdf

   - Name: ftmo-screenshots
     - Public: No (private)
     - File size limit: 5242880 (5MB)
     - Allowed MIME types: image/jpeg, image/png

3. After creating buckets, run the policies above in SQL Editor

4. Update your JavaScript to use these buckets:
   - Payment proofs: upload to payment-proofs/{userId}/{filename}
   - FTMO screenshots: upload to ftmo-screenshots/{userId}/{filename}
*/
