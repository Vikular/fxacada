import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'
);

// List all payment submissions
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('payment_submissions').select('*');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, payments: data });
});

// Submit a new payment
router.post('/', async (req, res) => {
  const { user_id, payment_method, transaction_id, amount, tier, proof_url, notes } = req.body;
  if (!user_id || !payment_method || !amount || !tier) return res.status(400).json({ success: false, error: 'Missing required fields' });
  const { data, error } = await supabase.from('payment_submissions').insert([{ user_id, payment_method, transaction_id, amount, tier, proof_url, notes }]).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  // Send notification (stub)
  await sendEmail({
    to: 'admin@fxacademy.com',
    subject: 'New Payment Submission',
    text: `A new payment was submitted by user ${user_id}.`,
  });
  res.json({ success: true, payment: data[0] });
});

export default router;
