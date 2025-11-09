// Supabase configuration
const SUPABASE_CONFIG = {
  url: import.meta.env?.VITE_SUPABASE_URL || 'https://dgbfqtmffgkamfgskkks.supabase.co',
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE'
};

// Initialize Supabase client
if (typeof window.supabase !== 'undefined') {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
  );
  console.log('✅ Supabase client initialized');
} else {
  console.error('❌ Supabase library not loaded');
}