import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'
);

// Update user (admin only)
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, user: data[0] });
});

// Deactivate user (admin only)
router.post('/:id/deactivate', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').update({ is_active: false }).eq('id', id).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, user: data[0] });
});

// Promote/demote user role (admin only)
router.post('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) return res.status(400).json({ success: false, error: 'Role required' });
  const { data, error } = await supabase.from('users').update({ role }).eq('id', id).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, user: data[0] });
});

export default router;
