# ✅ Database Setup Checklist

Follow this checklist to ensure complete setup.

## Pre-Setup ✓
- [ ] Supabase account created
- [ ] Project created (dgbfqtmffgkamfgskkks)
- [ ] Supabase URL and keys configured in code

## Step 1: Main Schema ✓
- [ ] Opened Supabase SQL Editor
- [ ] Copied `database/schema.sql` content
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw "Success. No rows returned" message
- [ ] No error messages appeared

**Expected:** 4 tables created + admin account

## Step 2: Storage Buckets ✓
- [ ] Opened "Storage" section in Supabase
- [ ] Created bucket: `payment-proofs`
  - [ ] Set as Private (not public)
  - [ ] File size limit: 5MB
- [ ] Created bucket: `ftmo-screenshots`
  - [ ] Set as Private (not public)
  - [ ] File size limit: 5MB
- [ ] Verified both buckets appear in list

**Expected:** 2 buckets visible in Storage dashboard

## Step 3: Storage Policies ✓
- [ ] Opened SQL Editor again
- [ ] Copied `database/storage-setup.sql` content
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw success messages
- [ ] No policy errors

**Expected:** File upload permissions configured

## Step 4: Verification ✓
- [ ] Opened SQL Editor
- [ ] Copied `database/verify-setup.sql` content
- [ ] Pasted and ran the verification script
- [ ] Reviewed results:
  - [ ] ✓ All 4 tables found
  - [ ] ✓ Admin account exists
  - [ ] ✓ 2 storage buckets found
  - [ ] ✓ RLS enabled on all tables
  - [ ] ✓ Policies are set
  - [ ] ✓ Triggers are active
  - [ ] ✓ Final status: "ALL SYSTEMS GO!"

**Expected:** All checks pass with ✓ symbols

## Step 5: Security ✓
- [ ] Changed default admin password
  - Default: `Admin123!`
  - New password set: __________________
- [ ] Tested admin login at `admin-login.html`
- [ ] Successfully logged in
- [ ] Admin dashboard loads

**Expected:** Admin access works with new password

## Step 6 (Optional): Test Data ✓
- [ ] Decided to add test data: Yes / No
- [ ] If yes: Ran `database/seed-test-data.sql`
- [ ] Verified test users created
- [ ] Tested login with: `john.starter@test.com` / `Test123!`
- [ ] Test student dashboard loads

**Expected:** Sample data for testing

## Step 7: Test Enrollment Flow ✓
- [ ] Opened `enrollment.html` in browser
- [ ] Filled out enrollment form
- [ ] Selected a tier (starter/core/pro)
- [ ] Clicked "Complete Enrollment"
- [ ] Saw success message
- [ ] Redirected to login page
- [ ] Logged in with new credentials
- [ ] Student dashboard loads

**Expected:** New enrollment saves to database

## Step 8: Verify Database ✓
Run this query to see your new user:
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
```
- [ ] New user appears in results
- [ ] Email is correct
- [ ] Role is 'student'
- [ ] Payment status is 'pending'

**Expected:** Enrollment data saved correctly

## Step 9: Test Payment Submission ✓
- [ ] Logged in as student
- [ ] Clicked "Submit Payment"
- [ ] Filled payment form
- [ ] Selected file (under 5MB)
- [ ] Submitted form
- [ ] Verified in database:
```sql
SELECT * FROM payment_submissions ORDER BY created_at DESC LIMIT 1;
```

**Expected:** Payment submission saved

## Step 10: Test Admin Functions ✓
- [ ] Logged in as admin
- [ ] Viewed users list
- [ ] Viewed pending payments
- [ ] Approved/rejected a payment
- [ ] Checked admin logs:
```sql
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 5;
```

**Expected:** Admin actions work and are logged

---

## 🎉 Setup Complete!

Date completed: ________________

### Quick Reference:

**Admin Login:**
- URL: `admin-login.html`
- Email: `admin@fxacademy.com`
- Password: [Your new password]

**Test Student (if using seed data):**
- URL: `auth-modal.html`
- Email: `john.starter@test.com`
- Password: `Test123!`

**Supabase Dashboard:**
- URL: https://app.supabase.com
- Project: dgbfqtmffgkamfgskkks

### Important Files:
- `database/common-queries.sql` - SQL reference
- `database/README.md` - Full documentation
- `database/STRUCTURE.md` - Database diagram

---

## Troubleshooting

### Problem: Tables not created
**Solution:**
1. Check for SQL errors in output
2. Re-run `schema.sql` line by line
3. Check Supabase logs

### Problem: Storage buckets missing
**Solution:**
1. Go to Storage dashboard
2. Manually create buckets with exact names
3. Re-run `storage-setup.sql`

### Problem: Can't login
**Solution:**
1. Verify user exists: `SELECT * FROM users WHERE email = 'your@email.com'`
2. Check `is_active = true`
3. Check browser console for errors

### Problem: File upload fails
**Solution:**
1. Verify bucket exists and name is exact
2. Check file size < 5MB
3. Check file type (JPG, PNG, PDF only)
4. Re-run storage policies

---

## Next Steps After Setup

1. [ ] Customize email templates
2. [ ] Set up email notifications
3. [ ] Configure payment gateway
4. [ ] Add custom branding
5. [ ] Deploy to production
6. [ ] Set up backups
7. [ ] Configure monitoring

---

**Notes:**
_Use this space for any additional notes or custom configurations_

