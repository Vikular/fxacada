import { logAdminAction } from '../middleware/audit.js';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'
);

// List all payment submissions pending review
router.get('/payments/pending', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('payment_submissions').select('*').eq('status', 'pending');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, payments: data });
});

// Approve/reject a payment submission
router.post('/payments/review', requireAuth, requireAdmin, async (req, res) => {
  const { id, status, rejection_reason } = req.body;
  if (!id || !['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, error: 'Invalid request' });
  const update = { status };
  if (status === 'rejected' && rejection_reason) update.rejection_reason = rejection_reason;
  const { data, error } = await supabase.from('payment_submissions').update(update).eq('id', id).select();
  if (error) return res.status(500).json({ success: false, error: error.message });
  // Send notification (stub)
  await sendEmail({
    to: 'user@fxacademy.com',
    subject: `Payment ${status}`,
    text: `Your payment submission has been ${status}.`,
  });
  // Audit log
  await logAdminAction({
    admin_id: req.user.id,
    action: `payment_${status}`,
    target_type: 'payment',
    target_id: id,
    details: { rejection_reason },
    ip_address: req.ip
  });
  res.json({ success: true, payment: data[0] });
});

// List all FTMO submissions pending review
router.get('/ftmo/pending', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('ftmo_submissions').select('*').eq('status', 'pending');
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, ftmo: data });
});

export default router;
