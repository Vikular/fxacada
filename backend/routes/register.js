import express from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'
);
const JWT_SECRET = process.env.JWT_SECRET || 'fxacada-secret';

// User registration
router.post('/', async (req, res) => {
  const { email, password, first_name, last_name, phone, country, tier, experience_level, goals } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
  const { data: existing, error: findErr } = await supabase.from('users').select('id').eq('email', email).single();
  if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert([{ email, password_hash, first_name, last_name, phone, country, tier, experience_level, goals }]).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  const user = data[0];
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name, tier: user.tier } });
});

export default router;
