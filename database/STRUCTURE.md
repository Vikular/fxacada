# 📊 FX Academy Database Structure

## Database Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            USERS                                │
│─────────────────────────────────────────────────────────────────│
│ • id (UUID, PK)                                                 │
│ • email (TEXT, UNIQUE)                                          │
│ • password_hash (TEXT)                                          │
│ • first_name (TEXT)                                             │
│ • last_name (TEXT)                                              │
│ • phone (TEXT)                                                  │
│ • country (TEXT)                                                │
│ • tier (TEXT: starter/core/pro)                                 │
│ • experience_level (TEXT: beginner/intermediate/advanced)       │
│ • goals (TEXT)                                                  │
│ • role (TEXT: student/lead/limited-admin/super-admin)           │
│ • payment_status (TEXT: pending/approved/rejected)              │
│ • is_active (BOOLEAN)                                           │
│ • created_at (TIMESTAMPTZ)                                      │
│ • updated_at (TIMESTAMPTZ)                                      │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ PAYMENT_SUBMISSIONS  │ │ FTMO_SUBMISSIONS │ │   ADMIN_LOGS     │
├──────────────────────┤ ├──────────────────┤ ├──────────────────┤
│ • id (UUID, PK)      │ │ • id (UUID, PK)  │ │ • id (UUID, PK)  │
│ • user_id (FK)       │ │ • user_id (FK)   │ │ • admin_id (FK)  │
│ • payment_method     │ │ • challenge_type │ │ • action         │
│ • transaction_id     │ │ • account_size   │ │ • target_type    │
│ • amount             │ │ • current_profit │ │ • target_id      │
│ • tier               │ │ • trading_days   │ │ • details (JSON) │
│ • proof_url          │ │ • challenge_goal │ │ • ip_address     │
│ • notes              │ │ • challenges     │ │ • created_at     │
│ • status             │ │ • screenshot_url │ └──────────────────┘
│ • reviewed_by (FK)   │ │ • notes          │
│ • reviewed_at        │ │ • status         │
│ • rejection_reason   │ │ • assigned_coach │
│ • created_at         │ │ • coach_notes    │
│ • updated_at         │ │ • created_at     │
└──────────────────────┘ │ • updated_at     │
                         └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE BUCKETS                            │
├─────────────────────────────────────────────────────────────────┤
│ 📁 payment-proofs/                                              │
│    └── {user_id}/                                               │
│        └── payment_screenshot.jpg                               │
│                                                                  │
│ 📁 ftmo-screenshots/                                            │
│    └── {user_id}/                                               │
│        └── ftmo_dashboard.png                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Table Relationships

### Users → Payment Submissions (1:Many)
- One user can have multiple payment submissions
- Each payment is reviewed by an admin (also a user)
- Foreign key: `payment_submissions.user_id` → `users.id`
- Foreign key: `payment_submissions.reviewed_by` → `users.id`

### Users → FTMO Submissions (1:Many)
- One user can have multiple FTMO submissions
- Each FTMO can be assigned to a coach (admin user)
- Foreign key: `ftmo_submissions.user_id` → `users.id`
- Foreign key: `ftmo_submissions.assigned_coach` → `users.id`

### Users → Admin Logs (1:Many)
- One admin can create multiple log entries
- Foreign key: `admin_logs.admin_id` → `users.id`

## Data Flow Diagram

```
NEW STUDENT ENROLLMENT
┌─────────────┐
│   Website   │
│  Signup Form│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Insert to  │
│ users table │
│ role=student│
│ status=     │
│  pending    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Student   │
│  Dashboard  │
└─────────────┘

PAYMENT SUBMISSION FLOW
┌─────────────┐
│   Student   │
│   Uploads   │
│   Payment   │
│    Proof    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   Storage   │────▶│  Insert to  │
│   Bucket    │     │  payment_   │
│payment-proofs     │ submissions │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Admin    │
                    │   Reviews   │
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
         ┌─────────────┐       ┌─────────────┐
         │   APPROVE   │       │   REJECT    │
         │  Update:    │       │  Update:    │
         │ status=     │       │ status=     │
         │ approved    │       │ rejected    │
         │             │       │ + reason    │
         └──────┬──────┘       └──────┬──────┘
                │                     │
                ▼                     ▼
         ┌─────────────┐       ┌─────────────┐
         │   Update    │       │   Notify    │
         │    User     │       │   Student   │
         │ payment_    │       │ To Retry    │
         │ status=     │       └─────────────┘
         │ approved    │
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │   Student   │
         │   Gets      │
         │   Access    │
         └─────────────┘

FTMO COACHING FLOW
┌─────────────┐
│   Student   │
│   Submits   │
│    FTMO     │
│  Challenge  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   Storage   │────▶│  Insert to  │
│   Bucket    │     │    ftmo_    │
│ftmo-screenshots   │ submissions │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Admin    │
                    │   Assigns   │
                    │    Coach    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Coach    │
                    │   Provides  │
                    │   Guidance  │
                    │  & Updates  │
                    │    Notes    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Challenge  │
                    │  Completed  │
                    └─────────────┘
```

## Key Features

### 🔐 Security
- **Row Level Security (RLS)** enabled on all tables
- Students can only access their own data
- Admins have full access based on role
- All admin actions logged in `admin_logs`

### 📝 Audit Trail
- Every admin action tracked
- Timestamps on all records
- Who reviewed what and when
- IP address tracking for admin actions

### 🔄 Auto-Updates
- `updated_at` automatically updated on changes
- Triggers handle timestamp management
- No manual timestamp updates needed

### 📊 Views Available
- `admin_stats` - Platform statistics
- `user_details` - Complete user information with counts

## Database Indexes

Indexes created for performance:
- `users.email` - Fast email lookups for login
- `users.role` - Filter by user type
- `users.payment_status` - Filter by payment state
- `payment_submissions.user_id` - User payment history
- `payment_submissions.status` - Pending payments
- `ftmo_submissions.user_id` - User FTMO history
- `ftmo_submissions.status` - Pending FTMO reviews
- All `created_at` fields - Recent records queries

## Constraints & Validation

### Users
- Email must be unique
- Role must be: student/lead/limited-admin/super-admin
- Tier must be: starter/core/pro (if set)
- Payment status: pending/approved/rejected

### Payment Submissions
- Must have valid user_id (FK)
- Payment method: bank/paypal/crypto/other
- Status: pending/approved/rejected
- Amount must be positive decimal

### FTMO Submissions
- Must have valid user_id (FK)
- Challenge type: phase1/phase2/verification/funded
- Account size: 10k/25k/50k/100k/200k
- Status: pending/in-review/coaching/completed

## Storage Structure

```
payment-proofs/
├── {user-uuid-1}/
│   ├── payment_2024_01_15.jpg
│   └── receipt_2024_01_15.pdf
├── {user-uuid-2}/
│   └── bank_transfer.png
└── ...

ftmo-screenshots/
├── {user-uuid-1}/
│   ├── phase1_dashboard.png
│   └── phase2_dashboard.png
├── {user-uuid-2}/
│   └── funded_account.png
└── ...
```

## File Size & Type Limits

**Payment Proofs:**
- Max size: 5MB
- Allowed types: JPG, PNG, PDF

**FTMO Screenshots:**
- Max size: 5MB
- Allowed types: JPG, PNG
