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
        const { error } =
          await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/auth-modal.html?reset=1",
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

  // Login form logic
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.style.display = "none";
      successMsg.style.display = "none";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const { data, error } = await window.supabaseClient.rpc(
          "verify_user_password",
          {
            p_email: email,
            p_password: password,
          }
        );

        if (error) throw new Error("Authentication failed");
        if (!data || data.length === 0) {
          errorMsg.textContent = "Invalid email or password";
          errorMsg.style.display = "block";
          return;
        }

        const user = data[0];

        if (["admin", "super-admin", "limited-admin"].includes(user.role)) {
          errorMsg.textContent = "Please use Admin Login for admin accounts";
          errorMsg.style.display = "block";
          return;
        }

        await window.supabaseClient.rpc("update_last_login", {
          p_user_id: user.user_id,
        });
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("user_role", user.role);

        successMsg.textContent = "Login successful! Redirecting...";
        successMsg.style.display = "block";

        setTimeout(() => {
          window.location.href = "student.html";
        }, 1000);
      } catch (err) {
        console.error("Login error:", err);
        errorMsg.textContent = "Login failed. Please try again.";
        errorMsg.style.display = "block";
      }
    });
  }
});
