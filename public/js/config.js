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
    checkSupabaseConnection();
  } else {
    console.error("❌ Supabase library not loaded");
  }
}

// Helper: Check Supabase connection by pinging a simple table (public schema)
async function checkSupabaseConnection() {
  if (!window.supabaseClient) return;
  try {
    // Try to fetch from a public table (change 'course_materials' to any table you have)
    const { error } = await window.supabaseClient
      .from("course_materials")
      .select("*")
      .limit(1);
    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
    } else {
      console.log("🔗 Supabase connection test succeeded.");
    }
  } catch (err) {
    console.error("❌ Supabase connection error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSupabaseClient);
} else {
  initSupabaseClient();
}
