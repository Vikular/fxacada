import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ'
);

export async function logAdminAction({ admin_id, action, target_type, target_id, details, ip_address }) {
  await supabase.from('admin_logs').insert([
    { admin_id, action, target_type, target_id, details, ip_address }
  ]);
}
