// Handles login and password reset logic for auth-modal.html

document.addEventListener("DOMContentLoaded", function () {
  // Password reset UI logic
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const resetForm = document.getElementById("resetForm");
  const loginForm = document.getElementById("loginForm");
  const backToLogin = document.getElementById("backToLogin");
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");

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
    resetForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // TODO: Implement backend call for password reset
      const email = document.getElementById("resetEmail").value.trim();
      errorMsg.style.display = "none";
      successMsg.style.display = "none";
      if (!email) {
        errorMsg.textContent = "Please enter your email.";
        errorMsg.style.display = "block";
        return;
      }
      // Simulate success message
      successMsg.textContent =
        "If this email exists, a reset link has been sent.";
      successMsg.style.display = "block";
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
