// Simple Node.js/Express admin login handler for local testing
// Usage: node src/api/admin-login.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Admin login endpoint
app.post('/auth/admin-login', async (req, res) => {
  const { email, password, requestedRole } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }
  // Fetch user from Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('role', requestedRole || 'super-admin')
    .single();
  if (error || !user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials or role' });
  }
  // Simple plaintext password check (replace with hash in production)
  if (user.password_hash !== password) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  // Generate a fake token (replace with JWT in production)
  const token = 'admin-' + Buffer.from(email).toString('base64');
  res.json({
    success: true,
    token,
    role: user.role,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name
  });
});

// Health check
app.get('/auth/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Admin login API running on http://localhost:${PORT}`);
});
