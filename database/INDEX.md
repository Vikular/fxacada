# 📚 FX Academy Database - Complete Setup Package

## 📦 What's Included

This folder contains everything needed to set up your FX Academy database in Supabase.

### 🔧 Setup Files

| File | Purpose | Run Order |
|------|---------|-----------|
| `schema.sql` | Main database structure | **1st** |
| `storage-setup.sql` | File upload buckets | **2nd** |
| `verify-setup.sql` | Verify everything works | **3rd** |
| `seed-test-data.sql` | Test data (optional) | **4th** |

### 📖 Documentation Files

| File | What It Contains |
|------|------------------|
| `QUICKSTART.md` | 5-minute quick setup guide |
| `README.md` | Full detailed documentation |
| `CHECKLIST.md` | Step-by-step checklist |
| `setup-instructions.txt` | Copy/paste instructions |
| `STRUCTURE.md` | Database diagrams & relationships |
| `common-queries.sql` | SQL query reference library |

---

## 🚀 Quick Start (Choose Your Path)

### Path A: I Want the Fastest Setup (5 minutes)
→ Follow **`QUICKSTART.md`**

### Path B: I Want Step-by-Step Instructions (10 minutes)
→ Follow **`CHECKLIST.md`**

### Path C: I Want to Understand Everything (30 minutes)
→ Read **`README.md`**

### Path D: Just Tell Me What to Do (Right Now!)
→ Read the section below ⬇️

---

## ⚡ Super Quick Setup (Right Now!)

### 1️⃣ Run Main Schema (2 min)
```
Open Supabase → SQL Editor → New Query
Copy all of: database/schema.sql
Paste → Run
```

### 2️⃣ Create Buckets (1 min)
```
Storage → Create Bucket
Name: payment-proofs (Private)
Name: ftmo-screenshots (Private)
```

### 3️⃣ Run Storage Setup (1 min)
```
SQL Editor → New Query
Copy all of: database/storage-setup.sql
Paste → Run
```

### 4️⃣ Verify (1 min)
```
SQL Editor → New Query
Copy all of: database/verify-setup.sql
Paste → Run
Look for: "ALL SYSTEMS GO!"
```

**Done! ✅** Your database is ready.

---

## 📊 What Gets Created

### Tables (4)
```
users               - All accounts (students, admins)
payment_submissions - Payment proof tracking
ftmo_submissions    - FTMO challenge coaching
admin_logs          - Audit trail
```

### Storage Buckets (2)
```
payment-proofs/     - Payment screenshots
ftmo-screenshots/   - FTMO dashboard images
```

### Security
```
✓ Row Level Security (RLS) enabled
✓ Role-based access policies
✓ Auto-update timestamps
✓ Action logging
```

### Default Accounts (1)
```
Email: admin@fxacademy.com
Password: Admin123!
Role: super-admin
⚠️ CHANGE PASSWORD IMMEDIATELY!
```

---

## 🎯 After Setup - What to Do

### Test Enrollment
1. Open `enrollment.html`
2. Fill form and submit
3. Login at `auth-modal.html`
4. Access student dashboard

### Test Admin
1. Open `admin-login.html`
2. Login with admin credentials
3. View users, payments, FTMO submissions
4. Test approve/reject actions

### Check Database
```sql
-- See all users
SELECT * FROM users;

-- See platform stats
SELECT * FROM admin_stats;

-- See recent activity
SELECT * FROM user_details;
```

---

## 🔍 File Descriptions

### `schema.sql` ⭐
The heart of your database. Creates:
- All 4 tables with proper structure
- Foreign key relationships
- Indexes for performance
- RLS policies for security
- Auto-update triggers
- Helper views for analytics
- Default admin account

**When to use:** First thing you run, only once

### `storage-setup.sql` 📁
Sets up file storage for:
- Payment proof uploads
- FTMO screenshot uploads
- Access permissions
- Size limits (5MB)

**When to use:** After creating buckets, only once

### `verify-setup.sql` ✓
Comprehensive check that verifies:
- All tables exist
- RLS is enabled
- Policies are set
- Triggers work
- Buckets exist
- Admin account is ready

**When to use:** After setup to confirm everything works

### `seed-test-data.sql` 🧪
Creates realistic test data:
- 7 student accounts (all tiers)
- 2 admin accounts
- 5 payment submissions
- 3 FTMO submissions
- Sample admin logs

**When to use:** For development/testing only, NOT production

### `common-queries.sql` 📚
A library of useful queries:
- User management
- Payment approval/rejection
- FTMO coaching workflows
- Analytics and reports
- Maintenance tasks

**When to use:** Reference it whenever you need to query the database

---

## 💡 Pro Tips

### Tip 1: Bookmark These Queries
```sql
-- Quick stats
SELECT * FROM admin_stats;

-- Recent students
SELECT * FROM user_details WHERE role = 'student' ORDER BY created_at DESC LIMIT 10;

-- Pending reviews
SELECT COUNT(*) FROM payment_submissions WHERE status = 'pending';
```

### Tip 2: Use Views for Easy Access
Instead of complex queries, use the built-in views:
- `admin_stats` - Platform statistics
- `user_details` - Complete user info with counts

### Tip 3: Check Logs Regularly
```sql
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 20;
```

### Tip 4: Backup Strategy
- Export users: See `common-queries.sql` backup section
- Supabase has automatic backups
- Consider daily exports for critical data

---

## 🆘 Common Issues & Solutions

### "relation does not exist"
**Cause:** Schema not run yet
**Fix:** Run `schema.sql` in SQL Editor

### "permission denied for table"
**Cause:** RLS policies not applied
**Fix:** Re-run RLS section from `schema.sql`

### "bucket not found"
**Cause:** Storage buckets not created
**Fix:** Go to Storage dashboard, create buckets manually

### "duplicate key value violates unique constraint"
**Cause:** Email already exists
**Fix:** Use different email or delete existing user

### File upload fails
**Cause:** Policies not set or wrong bucket name
**Fix:** 
1. Verify bucket names exactly: `payment-proofs`, `ftmo-screenshots`
2. Re-run `storage-setup.sql`
3. Check file size < 5MB

---

## 📞 Need Help?

### Supabase Resources
- Dashboard Logs: Shows database errors
- API Logs: Shows request errors
- Database: Browse tables directly

### Project Resources
- `README.md` - Detailed setup guide
- `STRUCTURE.md` - Visual database diagram
- Browser Console - JavaScript errors

### Quick Diagnostics
```sql
-- Is my setup complete?
SELECT * FROM verify_setup.sql;

-- What users exist?
SELECT email, role, payment_status FROM users;

-- Are there any errors?
-- Check Supabase Dashboard → Logs
```

---

## 🎓 Learning Resources

### Understand the Database
1. Read `STRUCTURE.md` for visual diagrams
2. Study `schema.sql` comments
3. Try queries from `common-queries.sql`

### Supabase Concepts
- RLS: Row Level Security (who can access what)
- Policies: Rules for data access
- Triggers: Automatic actions (like updating timestamps)
- Views: Saved queries for easy access

---

## ✅ Setup Checklist Summary

- [ ] Ran `schema.sql` successfully
- [ ] Created 2 storage buckets
- [ ] Ran `storage-setup.sql` successfully
- [ ] Ran `verify-setup.sql` - all checks pass
- [ ] Changed default admin password
- [ ] Tested enrollment flow
- [ ] Tested login
- [ ] Tested admin panel
- [ ] Bookmarked important queries

---

## 🚀 You're Ready!

Your FX Academy database is fully operational and ready to handle:
- Student enrollments
- Payment processing
- FTMO coaching
- Admin management
- File uploads
- Analytics & reporting

**What's Next?**
- Test the complete user journey
- Customize admin workflows  
- Set up email notifications
- Deploy to production
- Monitor and optimize

---

**Questions?** Check the documentation files or review Supabase logs.

**Ready to build?** Your database is waiting! 🎉
