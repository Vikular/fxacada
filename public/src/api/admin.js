// src/api/admin.js
// Scaffolding for admin controls and tier management
import supabase from "../config/supabase";

/**
 * Fetch all users for admin dashboard.
 */
export async function fetchAllUsers() {
  // TODO: Replace with real Supabase query
  // Example: let { data, error } = await supabase.from('users').select('*');
  return [];
}

/**
 * Upgrade a user's tier (admin action).
 * @param {string} userId
 * @param {string} newTier
 */
export async function upgradeUserTier(userId, newTier) {
  // TODO: Replace with real Supabase update
  // Example: await supabase.from('users').update({ tier: newTier }).eq('id', userId);
  return true;
}
