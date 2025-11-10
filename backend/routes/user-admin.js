
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { logAdminAction } from '../middleware/audit.js';
import { sendEmail } from '../utils/email.js';

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
  // Email notification (stub)
  await sendEmail({
    to: data[0]?.email,
    subject: 'Account Updated',
    text: 'Your account details have been updated by an admin.'
  });
  // Audit log
  await logAdminAction({
    admin_id: req.user.id,
    action: 'update_user',
    target_type: 'user',
    target_id: id,
    details: updates,
    ip_address: req.ip
  });
  res.json({ success: true, user: data[0] });
});


// Deactivate user (admin only)
router.post('/:id/deactivate', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').update({ is_active: false }).eq('id', id).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  // Email notification (stub)
  await sendEmail({
    to: data[0]?.email,
    subject: 'Account Deactivated',
    text: 'Your account has been deactivated by an admin.'
  });
  // Audit log
  await logAdminAction({
    admin_id: req.user.id,
    action: 'deactivate_user',
    target_type: 'user',
    target_id: id,
    details: {},
    ip_address: req.ip
  });
  res.json({ success: true, user: data[0] });
});


// Promote/demote user role (admin only)
router.post('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) return res.status(400).json({ success: false, error: 'Role required' });
  const { data, error } = await supabase.from('users').update({ role }).eq('id', id).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  // Email notification (stub)
  await sendEmail({
    to: data[0]?.email,
    subject: 'Role Changed',
    text: `Your account role has been changed to ${role} by an admin.`
  });
  // Audit log
  await logAdminAction({
    admin_id: req.user.id,
    action: 'change_role',
    target_type: 'user',
    target_id: id,
    details: { role },
    ip_address: req.ip
  });
  res.json({ success: true, user: data[0] });
});

export default router;
