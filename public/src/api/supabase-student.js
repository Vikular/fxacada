// src/api/supabase-student.js
// Scaffolding for Supabase-backed student data fetches
import supabase from "../config/supabase";

/**
 * Fetches the current student's profile and dashboard data from Supabase.
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} Student dashboard data
 */
export async function fetchStudentDashboard(userId) {
  // Fetch student profile
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (studentError) throw studentError;

  // Fetch FTMO status
  const { data: ftmo, error: ftmoError } = await supabase
    .from("ftmo_status")
    .select("*")
    .eq("user_id", userId)
    .single();
  // FTMO is optional, so don't throw if not found

  // Fetch live sessions (could be global or user-specific)
  const { data: liveSessions, error: liveError } = await supabase
    .from("live_sessions")
    .select("*")
    .order("date", { ascending: true });
  // If error, fallback to empty array

  return {
    tier: student.tier,
    name: student.name,
    stats: {
      courseCompletion: student.course_completion || 0,
      sessionsAttended: student.sessions_attended || 0,
      sessionsRemaining: student.sessions_remaining || 0,
    },
    ftmo: ftmo || {},
    liveSessions: liveSessions || [],
  };
}

/**
 * Fetches course modules for the current student, with tier-based access.
 * @param {string} userId
 * @returns {Promise<Array>} List of course modules
 */
export async function fetchCourseModules(userId) {
  // Fetch course modules for the user (with status and tier lock)
  const { data, error } = await supabase
    .from("course_modules")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: true });
  if (error) throw error;
  // Map to expected structure
  return (data || []).map((mod) => ({
    id: mod.id,
    title: mod.title,
    status: mod.status,
    tierRequired: mod.tier_required || null,
  }));
}
