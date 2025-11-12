// Handles login and password reset logic for auth-modal.html

document.addEventListener("DOMContentLoaded", async function () {
  // Password reset UI logic
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const resetForm = document.getElementById("resetForm");
  const loginForm = document.getElementById("loginForm");
  const backToLogin = document.getElementById("backToLogin");
  const setPasswordForm = document.getElementById("setPasswordForm");
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");

  // --- Supabase password reset: handle access_token in URL fragment ---
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  let sessionSet = false;

  if (urlParams.get("reset") === "1" && setPasswordForm) {
    // If access_token is present, set the session for Supabase
    if (accessToken && refreshToken && window.supabaseClient) {
      try {
        await window.supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        sessionSet = true;
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = "Session error: " + (err.message || err);
          errorMsg.style.display = "block";
        }
      }
    }
    if (loginForm) loginForm.style.display = "none";
    if (resetForm) resetForm.style.display = "none";
    setPasswordForm.style.display = "flex";
  }

  if (forgotPasswordLink && resetForm && loginForm && backToLogin) {
    forgotPasswordLink.addEventListener("click", function (e) {
      e.preventDefault();
      loginForm.style.display = "none";
      resetForm.style.display = "flex";
    });
    backToLogin.addEventListener("click", function (e) {
      e.preventDefault();
      resetForm.style.display = "none";
      loginForm.style.display = "flex";
    });
    resetForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("resetEmail").value.trim();
      errorMsg.style.display = "none";
      successMsg.style.display = "none";
      if (!email) {
        errorMsg.textContent = "Please enter your email.";
        errorMsg.style.display = "block";
        return;
      }
      try {
        // Use dynamic redirectTo for local and production
        let redirectTo = window.location.origin + "/auth-modal.html?reset=1";
        // Optionally, customize for production domain if needed
        // if (window.location.hostname === "your-production-domain.com") {
        //   redirectTo = "https://your-production-domain.com/auth-modal.html?reset=1";
        // }
        const { error } =
          await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo,
          });
        if (error) throw error;
        successMsg.textContent =
          "If this email exists, a reset link has been sent.";
        successMsg.style.display = "block";
      } catch (err) {
        errorMsg.textContent = err.message || "Failed to send reset email.";
        errorMsg.style.display = "block";
      }
    });
  }

  // Set new password logic
  if (setPasswordForm) {
    setPasswordForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorMsg.style.display = "none";
      successMsg.style.display = "none";
      const newPassword = document.getElementById("newPassword").value;
      if (!newPassword || newPassword.length < 8) {
        errorMsg.textContent = "Password must be at least 8 characters.";
        errorMsg.style.display = "block";
        return;
      }
      try {
        // Ensure session is set before updating password
        if (
          !sessionSet &&
          accessToken &&
          refreshToken &&
          window.supabaseClient
        ) {
          await window.supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
        const { error } = await window.supabaseClient.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;

        // Also update password hash in users table via backend
        const user = await window.supabaseClient.auth.getUser();
        const email = user?.data?.user?.email;
        if (email) {
          // Use correct backend URL for local and production
          let backendUrl = "http://localhost:4000/auth/update-password";
          if (
            window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
          ) {
            // Replace with your production backend URL if needed
            // backendUrl = "https://your-production-backend.com/auth/update-password";
          }
          await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword }),
          });
        }

        successMsg.textContent = "Password updated! You can now log in.";
        successMsg.style.display = "block";
        setTimeout(() => {
          window.location.href = "auth-modal.html";
        }, 1500);
      } catch (err) {
        errorMsg.textContent = err.message || "Failed to update password.";
        errorMsg.style.display = "block";
      }
    });
  }

  // Login form logic (Supabase built-in)
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.style.display = "none";
      successMsg.style.display = "none";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const { data, error } =
          await window.supabaseClient.auth.signInWithPassword({
            email,
            password,
          });
        if (error) throw error;
        // Optionally, fetch user profile from your backend or Supabase table if needed
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_role", data.user.role || "student");
        successMsg.textContent = "Login successful! Redirecting...";
        successMsg.style.display = "block";
        setTimeout(() => {
          window.location.href = "student.html";
        }, 1000);
      } catch (err) {
        console.error("Login error:", err);
        errorMsg.textContent = err.message || "Login failed. Please try again.";
        errorMsg.style.display = "block";
      }
    });
  }

  // Removed invalid app.get (not for frontend)
});
