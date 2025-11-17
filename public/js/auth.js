// --- Element References ---
const loginForm = document.getElementById("loginForm");
const resetForm = document.getElementById("resetForm");
const setPasswordForm = document.getElementById("setPasswordForm");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const backToLoginLink = document.getElementById("backToLogin");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

// --- Utility Functions ---
function showMessage(element, message, isError = false) {
  errorMsg.classList.add("d-none");
  successMsg.classList.add("d-none");
  element.textContent = message;
  element.classList.remove("d-none");
  if (isError) {
    element.setAttribute("role", "alert");
    element.setAttribute("aria-live", "assertive");
  } else {
    element.removeAttribute("role");
    element.setAttribute("aria-live", "polite");
  }
  element.focus && element.focus();
}

function clearMessages() {
  errorMsg.classList.add("d-none");
  successMsg.classList.add("d-none");
  errorMsg.textContent = "";
  successMsg.textContent = "";
}

function showForm(formToShow) {
  loginForm.classList.add("d-none");
  resetForm.classList.add("d-none");
  setPasswordForm.classList.add("d-none");
  clearMessages();
  formToShow.classList.remove("d-none");
  // Focus first input for accessibility
  const firstInput = formToShow.querySelector("input");
  if (firstInput) firstInput.focus();
}

function setLoading(form, isLoading) {
  const btn = form.querySelector("button[type='submit']");
  if (btn) {
    btn.disabled = isLoading;
    btn.textContent = isLoading
      ? "Please wait..."
      : btn.getAttribute("data-i18n") || btn.textContent;
  }
}

// --- 1. Login Handler ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  setLoading(loginForm, true);
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) {
    showMessage(errorMsg, "Please enter both email and password.", true);
    setLoading(loginForm, false);
    return;
  }
  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword(
      {
        email,
        password,
      }
    );
    if (error) throw error;
    window.location.href = "student.html";
  } catch (err) {
    showMessage(errorMsg, `Login failed: ${err.message || err}`, true);
  } finally {
    setLoading(loginForm, false);
  }
});

// --- 2. Password Reset Request Handler ---
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  showForm(resetForm);
});

backToLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  showForm(loginForm);
});

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  setLoading(resetForm, true);
  const resetEmail = document.getElementById("resetEmail").value.trim();
  if (!resetEmail) {
    showMessage(errorMsg, "Please enter your email.", true);
    setLoading(resetForm, false);
    return;
  }
  try {
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(
      resetEmail,
      {
        redirectTo: window.location.origin + window.location.pathname,
      }
    );
    if (error) throw error;
    showMessage(
      successMsg,
      "Password reset link sent! Check your email.",
      false
    );
  } catch (err) {
    showMessage(errorMsg, `Error: ${err.message || err}`, true);
  } finally {
    setLoading(resetForm, false);
  }
});

// --- 3. Set New Password (Handles Supabase URL Hash) ---
let setPasswordListenerAdded = false;
async function checkAuthForPasswordReset() {
  try {
    const {
      data: { session },
    } = await window.supabaseClient.auth.getSession();
    if (
      session &&
      session.user &&
      window.location.hash.includes("type=recovery")
    ) {
      showForm(setPasswordForm);
      showMessage(successMsg, "Please set your new password below.", false);
      history.replaceState(null, "", window.location.pathname);
      if (!setPasswordListenerAdded) {
        setPasswordForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          clearMessages();
          setLoading(setPasswordForm, true);
          const newPassword = document.getElementById("newPassword").value;
          if (!newPassword || newPassword.length < 8) {
            showMessage(
              errorMsg,
              "Password must be at least 8 characters.",
              true
            );
            setLoading(setPasswordForm, false);
            return;
          }
          try {
            const { error } = await window.supabaseClient.auth.updateUser({
              password: newPassword,
            });
            if (error) throw error;
            showMessage(
              successMsg,
              "Password updated successfully! Redirecting...",
              false
            );
            setTimeout(() => {
              window.location.href = "student.html";
            }, 2000);
          } catch (err) {
            showMessage(
              errorMsg,
              `Password update failed: ${err.message || err}`,
              true
            );
          } finally {
            setLoading(setPasswordForm, false);
          }
        });
        setPasswordListenerAdded = true;
      }
    } else {
      showForm(loginForm);
    }
  } catch (err) {
    showMessage(errorMsg, `Error: ${err.message || err}`, true);
    showForm(loginForm);
  }
}

// Hide all forms except loginForm on initial load (unless password reset is detected)
function hideAllFormsExceptLogin() {
  loginForm.classList.remove("d-none");
  resetForm.classList.add("d-none");
  setPasswordForm.classList.add("d-none");
}

hideAllFormsExceptLogin();
// Check for the hash on page load
checkAuthForPasswordReset();
