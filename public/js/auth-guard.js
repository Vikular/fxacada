// Authentication guard - include in protected pages

function checkAuth(requiredRole = null) {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    // Not logged in - redirect to login
    console.log("No user session found, redirecting to login");
    window.location.href = "auth-modal.html";
    return null;
  }

  let userData;
  try {
    userData = JSON.parse(userStr);
  } catch (e) {
    console.error("Invalid user data in localStorage:", e);
    localStorage.removeItem("user");
    window.location.href = "auth-modal.html";
    return null;
  }

  // Check if user account is active
  if (userData.is_active === false) {
    alert("Your account is inactive. Please contact support.");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    window.location.href = "index.html";
    return null;
  }

  // Check role if specified
  if (requiredRole) {
    const adminRoles = ["admin", "super-admin", "limited-admin"];

    if (requiredRole === "admin" && !adminRoles.includes(userData.role)) {
      alert("Access denied. Admin access required.");
      window.location.href = "index.html";
      return null;
    }

    if (requiredRole === "student" && adminRoles.includes(userData.role)) {
      // Admin trying to access student page - allow it
      console.log("Admin accessing student area");
    }
  }

  console.log("✅ User authenticated:", userData.email, userData.role);
  return userData;
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("user_role");
  console.log("User logged out");
  window.location.href = "index.html";
}

// Export for use
window.checkAuth = checkAuth;
window.logout = logout;

// To protect a page, call checkAuth('student') in your page's script after including this file.
// Example usage (in your HTML or another JS file):
// const user = checkAuth('student');
// if (user) {
//   console.log('Logged in as:', user.email, user.role);
//   // Load dashboard data...
// }
