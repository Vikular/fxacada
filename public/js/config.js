// Supabase configuration
const SUPABASE_CONFIG = {
  url: "https://dgbfqtmffgkamfgskkks.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ",
};

function initSupabaseClient() {
  if (window.supabase && typeof window.supabase.createClient === "function") {
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
    console.log("✅ Supabase client initialized");
  } else {
    console.error("❌ Supabase library not loaded");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSupabaseClient);
} else {
  initSupabaseClient();
}
