# 🗄️ Database Setup Guide for FX Academy

This guide will help you set up the complete database structure for the FX Academy platform.

## 📋 Prerequisites

- Supabase account created
- Project created in Supabase
- Supabase credentials updated in `js/main.js` and `src/config/supabase.js`

## 🚀 Setup Steps

### Step 1: Run Main Schema

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `database/schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`

This will create:

- ✅ `users` table (students, admins, leads)
- ✅ `payment_submissions` table (payment tracking)
- ✅ `ftmo_submissions` table (FTMO challenge tracking)
- ✅ `admin_logs` table (audit trail)
- ✅ Auto-update triggers for timestamps
- ✅ Default admin account
- ✅ Row Level Security policies
- ✅ Helpful views for analytics

### Step 2: Create Storage Buckets

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **Create Bucket**

#### Bucket 1: payment-proofs

- Name: `payment-proofs`
- Public: ❌ No (private)
- File size limit: `5242880` (5MB)
- Allowed MIME types: `image/jpeg, image/png, application/pdf`
- Click **Create**

#### Bucket 2: ftmo-screenshots

- Name: `ftmo-screenshots`
- Public: ❌ No (private)
- File size limit: `5242880` (5MB)
- Allowed MIME types: `image/jpeg, image/png`
- Click **Create**

### Step 3: Run Storage Policies

1. Go back to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database/storage-setup.sql`
4. Paste and **Run**

This sets up permissions for file uploads.

### Step 4: Verify Setup

Run this query in SQL Editor to check everything:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'payment_submissions', 'ftmo_submissions', 'admin_logs');

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check admin account
SELECT email, role FROM users WHERE role = 'super-admin';
```

You should see:

- ✅ 4 tables listed
- ✅ 2 storage buckets
- ✅ 1 admin user

## 🔐 Default Admin Credentials

**Email:** `admin@fxacademy.com`  
**Password:** `Admin123!`

⚠️ **IMPORTANT:** Change this password immediately!

To change the password:

```sql
UPDATE users
SET password_hash = 'YourNewSecurePassword!'
WHERE email = 'admin@fxacademy.com';
```

## 📊 Database Schema Overview

### Users Table

Stores all user accounts with roles:

- `student` - Regular enrolled students
- `lead` - Potential customers (not enrolled yet)
- `limited-admin` - Admin with restricted access
- `super-admin` - Full system access

### Payment Submissions Table

Tracks payment proof uploads:

- `pending` - Awaiting review
- `approved` - Payment verified
- `rejected` - Payment declined

### FTMO Submissions Table

Tracks FTMO challenge coaching:

- `pending` - New submission
- `in-review` - Admin reviewing
- `coaching` - Active coaching
- `completed` - Finished

### Admin Logs Table

Audit trail of all admin actions for security and tracking.

## 🔍 Useful Queries

### Get platform statistics

```sql
SELECT * FROM admin_stats;
```

### Get all students with details

```sql
SELECT * FROM user_details WHERE role = 'student';
```

### Get pending payments

```sql
SELECT
  p.*,
  u.first_name,
  u.last_name,
  u.email
FROM payment_submissions p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;
```

### Get pending FTMO reviews

```sql
SELECT
  f.*,
  u.first_name,
  u.last_name,
  u.email,
  u.tier
FROM ftmo_submissions f
JOIN users u ON f.user_id = u.id
WHERE f.status = 'pending'
ORDER BY f.created_at DESC;
```

## 🛡️ Row Level Security (RLS)

RLS is enabled on all tables to ensure:

- Students can only see/edit their own data
- Admins can see/edit all data
- Public can register (insert into users)
- All actions are logged

## 🔄 Auto-Update Timestamps

All tables automatically update the `updated_at` field when records change.

## 📱 Next Steps After Setup

1. ✅ Test enrollment flow: `enrollment.html` → Creates user
2. ✅ Test login: `auth-modal.html` → Authenticates user
3. ✅ Test payment submission: `submit-payment.html` → Creates payment record
4. ✅ Test FTMO submission: `submit-ftmo.html` → Creates FTMO record
5. ✅ Test admin login: `admin-login.html` → Access admin panel
6. ✅ Test user management: `manage-users.html` → View/edit users

## 🐛 Troubleshooting

### "relation does not exist" error

- Make sure you ran `schema.sql` completely
- Check that you're in the right Supabase project

### "permission denied" error

- RLS policies may need adjustment
- Check if user is authenticated
- Verify role assignments

### File upload fails

- Verify storage buckets are created
- Check bucket names match exactly: `payment-proofs`, `ftmo-screenshots`
- Ensure storage policies are applied

### Can't login

- Verify user exists: `SELECT * FROM users WHERE email = 'your@email.com'`
- Check `is_active` is `true`
- Verify credentials match

## 📞 Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs
2. Check browser console for JavaScript errors
3. Verify all SQL queries ran successfully
4. Check that Supabase credentials are correct in code

---

**Setup Complete!** 🎉 Your database is ready to use.
