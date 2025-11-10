import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'
);

// POST /upload/signed-url
// { bucket, path, contentType }
router.post('/signed-url', requireAuth, async (req, res) => {
  const { bucket, path, contentType } = req.body;
  if (!bucket || !path) return res.status(400).json({ success: false, error: 'Missing bucket or path' });
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path, 60 * 10); // 10 min
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, url: data.signedUrl, path });
});

export default router;
