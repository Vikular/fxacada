// src/api/community.js
// Scaffolding for onboarding and community features

/**
 * Fetch onboarding checklist for the current user.
 * @param {string} userId
 * @returns {Promise<Array>} Checklist items
 */
export async function fetchOnboardingChecklist(userId) {
  // TODO: Replace with real Supabase query
  return [];
}

/**
 * Fetch community links (chat, forums, Discord, etc.)
 * @returns {Promise<Array>} Community resources
 */
export async function fetchCommunityLinks() {
  // TODO: Replace with real data or Supabase query
  return [
    { name: "Discord", url: "#" },
    { name: "Forum", url: "#" },
  ];
}
