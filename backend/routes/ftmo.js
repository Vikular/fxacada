import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'
);

// List all FTMO submissions
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('ftmo_submissions').select('*');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, ftmo: data });
});

// Submit a new FTMO challenge
router.post('/', async (req, res) => {
  const { user_id, challenge_type, account_size, current_profit, trading_days, challenge_goal, challenges_facing, screenshot_url, notes } = req.body;
  if (!user_id || !challenge_type || !account_size) return res.status(400).json({ success: false, error: 'Missing required fields' });
  const { data, error } = await supabase.from('ftmo_submissions').insert([{ user_id, challenge_type, account_size, current_profit, trading_days, challenge_goal, challenges_facing, screenshot_url, notes }]).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, ftmo: data[0] });
});

export default router;
