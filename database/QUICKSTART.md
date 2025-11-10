# 🚀 Quick Start Guide - Database Setup

## 5-Minute Setup

### Step 1: Run Main Schema (2 min)
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Copy & paste `database/schema.sql`
4. Click **Run** ▶️

✅ Creates all tables, policies, triggers, and default admin

### Step 2: Create Storage Buckets (2 min)
1. Go to **Storage** → **New Bucket**
2. Create `payment-proofs` (Private, 5MB limit)
3. Create `ftmo-screenshots` (Private, 5MB limit)
4. Go back to **SQL Editor** → **New Query**
5. Copy & paste `database/storage-setup.sql`
6. Click **Run** ▶️

✅ Sets up file upload permissions

### Step 3: Add Test Data (1 min) - OPTIONAL
1. **SQL Editor** → **New Query**
2. Copy & paste `database/seed-test-data.sql`
3. Click **Run** ▶️

✅ Creates test users, payments, and FTMO submissions

---

## Login & Test

### Default Admin Account
```
Email: admin@fxacademy.com
Password: Admin123!
```

### Test Student Accounts (if you ran seed data)
```
Email: john.starter@test.com
Password: Test123!
```

---

## Verify Everything Works

Run this query in SQL Editor:
```sql
SELECT 
  'Users' as table_name, COUNT(*)::text as count FROM users
UNION ALL
SELECT 'Payments', COUNT(*)::text FROM payment_submissions
UNION ALL
SELECT 'FTMO', COUNT(*)::text FROM ftmo_submissions
UNION ALL
SELECT 'Logs', COUNT(*)::text FROM admin_logs;
```

Expected results:
- Users: At least 1 (admin)
- Others: 0 (or more if you ran seed data)

---

## Next Steps

1. **Change default password** ⚠️
2. Open your website → Test enrollment
3. Login as student
4. Test payment submission
5. Login as admin
6. Review & approve payments

---

## Common Files

| File | Purpose |
|------|---------|
| `schema.sql` | Main database setup |
| `storage-setup.sql` | File upload buckets |
| `seed-test-data.sql` | Test data (optional) |
| `common-queries.sql` | SQL reference |
| `README.md` | Full documentation |
| `STRUCTURE.md` | Database diagram |

---

## Troubleshooting

**Can't login?**
```sql
-- Check if user exists
SELECT * FROM users WHERE email = 'your@email.com';
```

**Payment not saving?**
```sql
-- Check RLS policies
SELECT * FROM payment_submissions WHERE user_id = 'user-uuid';
```

**File upload fails?**
- Verify buckets exist in Storage dashboard
- Check bucket names match: `payment-proofs`, `ftmo-screenshots`

---

## 🎉 Done!

Your database is ready. Test the enrollment flow:
1. Visit `enrollment.html`
2. Fill form & submit
3. Check SQL: `SELECT * FROM users ORDER BY created_at DESC LIMIT 1;`

Need help? Check `database/README.md` for full documentation.
