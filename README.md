# Forex Mentorship Platform

A comprehensive forex trading mentorship platform with tiered access, course management, and payment tracking.

## Features

- 🔐 Secure authentication (admin & student portals)
- 📚 Tiered course content (Starter, Core, Pro)
- 💳 Payment submission tracking
- 🏆 FTMO challenge management
- 👥 User role management (Lead, Student, Pro Trader, Admin)
- 📊 Admin dashboard for reviewing submissions

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Custom auth with pgcrypto
- **Storage:** Supabase Storage

## Setup

1. Clone the repository
2. Create a Supabase project
3. Run the SQL schema (see `schema.sql`)
4. Update `js/config.js` with your Supabase credentials
5. Start a local server (Live Server or `python -m http.server`)

## Test Credentials

- **Admin:** `admin@forexmentor.com` / `Admin@123456!`
- **Student:** `student@test.com` / `Student@123`

## License

MIT