// js/config.js

const SUPABASE_URL = "https://dgbfqtmffgkamfgskkks.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmZxdG1mZmdrYW1mZ3Nra2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDkxNjYsImV4cCI6MjA3ODE4NTE2Nn0.qfePtu3UjQBNEy6bIYJnGSva4yZJ3H8PF5PK69MM_mQ";

/**
 * Initializes the global Supabase client instance.
 */
function initSupabaseClient() {
  if (typeof window.supabase === "undefined") {
    console.error("Supabase CDN not loaded.");
    return;
  }

  if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
    console.log("Supabase client initialized via config.");
  }
}

// Export the initialization function
window.initSupabaseClient = initSupabaseClient;
