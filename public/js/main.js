// --- SUPABASE DATA FETCH ---
import {
  fetchStudentDashboard,
  fetchCourseModules,
} from "../src/api/supabase-student.js";
import supabase from "../src/config/supabase.js";

let STUDENT_DATA = null;
let COURSE_MODULES = [
  {
    id: 1,
    title: "Introduction to Forex & Market Basics",
    status: "completed",
    tierRequired: "Starter",
    details:
      "What is Forex, how the market works, currency pairs, brokers, and trading platforms.",
  },
  {
    id: 2,
    title: "Support & Resistance Essentials",
    status: "in-progress",
    tierRequired: "Starter",
    details:
      "Identifying key support and resistance zones, drawing levels, and using them for trade entries/exits.",
  },
  {
    id: 3,
    title: "Price Action Fundamentals",
    status: "locked",
    tierRequired: "Core",
    details: "Candlestick patterns, market structure, breakouts, and fakeouts.",
  },
  {
    id: 4,
    title: "Smart Money Concepts (SMC) Basics",
    status: "locked",
    tierRequired: "Core",
    details:
      "Liquidity, order blocks, inducement, and institutional trading logic.",
  },
  {
    id: 5,
    title: "ICT (Inner Circle Trader) Methodology",
    status: "locked",
    tierRequired: "Pro",
    details:
      "ICT concepts, market maker models, dealing ranges, and advanced trade management.",
  },
  {
    id: 6,
    title: "Putting It All Together: Building a Trading Plan",
    status: "locked",
    tierRequired: "Pro",
    details:
      "Combining SMC, ICT, price action, and S&R into a rules-based trading plan.",
  },
];
let DASHBOARD_ERROR = null;

// --- DASHBOARD RENDERING FUNCTIONS ---

/**
 * Renders the primary dashboard statistics and the progress bar.
 */
function renderStats() {
  if (!STUDENT_DATA) return;
  const stats = STUDENT_DATA.stats;
  document.querySelector(
    ".dashboard-header h2"
  ).textContent = `Welcome back, ${STUDENT_DATA.name}!`;

  // Render Stats
  document.querySelector(".stat-value:nth-child(1)").textContent = stats
    ? `${stats.courseCompletion}%`
    : "--";
  document.querySelector(".stat-value:nth-child(2)").textContent = stats
    ? stats.sessionsAttended
    : "--";
  document.querySelector(".stat-value:nth-child(3)").textContent = stats
    ? stats.sessionsRemaining
    : "--";

  // Add a progress bar to the course completion card
  const completionCard = document.querySelector(".dashboard-card:nth-child(1)");
  if (stats) {
    completionCard.insertAdjacentHTML(
      "beforeend",
      `
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${stats.courseCompletion}%"></div>
      </div>
    `
    );
  }
}

/**
 * Renders the FTMO challenge status, locking it if the tier is too low.
 */
function renderFTMOTracker() {
  const trackerSection = document.getElementById("ftmo-tracker");
  if (!STUDENT_DATA) return;
  const data = STUDENT_DATA.ftmo;
  const tier = STUDENT_DATA.tier;

  if (tier !== "Pro") {
    trackerSection.innerHTML = `
      <h3>🏆 FTMO Challenge Status</h3>
      <div class="dashboard-card status-locked">
        <div class="card-title">FTMO Tracker is a **PRO TIER** Feature</div>
        <p>Upgrade to the Pro Tier to unlock dedicated FTMO coaching, real-time tracking, and mentor support.</p>
        <a href="#pricing" class="btn btn-primary">Upgrade Now</a>
      </div>
    `;
    return;
  }

  // Logic for Pro Tier
  if (!data) return;
  const profitProgress = (data.currentProfit / data.target) * 100;

  trackerSection.querySelector(".dashboard-card").innerHTML = `
    <div class="card-title">${data.accountType}</div>
    <p><strong>Profit Target:</strong> $${
      data.target?.toLocaleString?.() ?? 0
    } (Current: $${data.currentProfit?.toLocaleString?.() ?? 0})</p>
    <div class="progress-bar-container ftmo-progress">
      <div class="progress-bar status-success" style="width: ${Math.min(
        profitProgress || 0,
        100
      )}%"></div>
    </div>
    <p><strong>Daily Loss Used:</strong> $${
      data.dailyLossUsed?.toLocaleString?.() ?? 0
    }</p>
    <p><strong>Overall Status:</strong> <span class="status-value status-warning">${
      data.status || ""
    }</span></p>
  `;
}

/**
 * Renders the list of available and locked courses/modules.
 */
function renderCourses() {
  const coursesSection = document.getElementById("courses");
  let coursesHTML = '<h3>📚 My Courses</h3><div class="course-list">';
  const studentTier = STUDENT_DATA ? STUDENT_DATA.tier : "";
  const tierOrder = { starter: 1, core: 2, pro: 3 };
  const currentTierLevel = tierOrder[studentTier?.toLowerCase?.()] || 0;

  (COURSE_MODULES || []).forEach((module, idx) => {
    let icon = "";
    let buttonText = "Start Module";
    let moduleClass = "";
    let lockedByTier = false;
    const moduleTierLevel = module.tierRequired
      ? tierOrder[module.tierRequired.toLowerCase?.()]
      : 0;
    if (module.tierRequired && moduleTierLevel > currentTierLevel) {
      lockedByTier = true;
    }

    if (module.status === "completed") {
      icon = "✅";
      buttonText = "Review";
      moduleClass = "completed";
    } else if (module.status === "in-progress") {
      icon = "⏳";
      buttonText = "Continue";
      moduleClass = "in-progress";
    } else if (module.status === "locked" || lockedByTier) {
      icon = "🔒";
      buttonText = module.tierRequired
        ? `Upgrade to ${
            module.tierRequired.charAt(0).toUpperCase() +
            module.tierRequired.slice(1)
          }`
        : "Locked";
      moduleClass = "locked";
    }

    coursesHTML += `
      <div class="course-module ${moduleClass}" data-course-idx="${idx}">
        <div class="module-title">${icon} ${module.title}</div>
        <div class="module-action">
          ${
            lockedByTier
              ? `<a href="#pricing" class="btn btn-secondary">${buttonText}</a>`
              : module.status === "locked" &&
                module.tierRequired !== studentTier
              ? `<a href="#pricing" class="btn btn-secondary">${buttonText}</a>`
              : `<button class="btn btn-primary">${buttonText}</button>`
          }
        </div>
        <button class="expand-details" aria-label="View details">Details</button>
      </div>
    `;
  });

  coursesHTML += "</div>";
  coursesSection.innerHTML = coursesHTML;

  // Attach modal/expand handlers
  coursesSection.querySelectorAll(".expand-details").forEach((btn) => {
    btn.onclick = (e) => {
      const idx = btn.closest(".course-module").getAttribute("data-course-idx");
      const module = COURSE_MODULES[idx];
      const modal = createCourseModal(module);
      document.body.appendChild(modal);
    };
  });
}

/**
 * Creates a modal for course module details.
 * @param {Object} module - The course module data.
 * @returns {HTMLElement} The modal element.
 */
function createCourseModal(module) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  // Tier badge logic
  let tierBadge = "";
  if (module.tierRequired) {
    let color = "#bbb";
    if (module.tierRequired.toLowerCase() === "starter") color = "#4caf50";
    else if (module.tierRequired.toLowerCase() === "core") color = "#2196f3";
    else if (module.tierRequired.toLowerCase() === "pro") color = "#ff9800";
    tierBadge = `<span class="tier-badge" style="background:${color}">${
      module.tierRequired.charAt(0).toUpperCase() + module.tierRequired.slice(1)
    }</span>`;
  }
  modal.innerHTML = `
    <div class="modal course-modal">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h2>${module.title} ${tierBadge}</h2>
      <div class="modal-body">
        <p><strong>Status:</strong> ${
          module.status.charAt(0).toUpperCase() + module.status.slice(1)
        }</p>
        ${
          module.tierRequired
            ? `<p><strong>Tier Required:</strong> ${
                module.tierRequired.charAt(0).toUpperCase() +
                module.tierRequired.slice(1)
              }</p>`
            : ""
        }
        <div class="module-details">${
          module.details || "No additional details available."
        }</div>
      </div>
      <div class="modal-actions">
        ${
          module.status === "locked"
            ? `<a href="#pricing" class="btn btn-secondary">Upgrade to ${module.tierRequired}</a>`
            : `<button class="btn btn-primary">${
                module.status === "completed" ? "Review" : "Start/Continue"
              }</button>`
        }
      </div>
    </div>
  `;
  // Close logic
  modal.querySelector(".modal-close").onclick = () =>
    document.body.removeChild(modal);
  modal.onclick = (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  };
  return modal;
}

/**
 * Initializes all dynamic components of the dashboard.
 */
async function initDashboard() {
  document.querySelector(".dashboard-header h2").textContent = "Loading...";
  document
    .querySelectorAll(".stat-value")
    .forEach((el) => (el.textContent = "--"));
  showSectionLoading("courses", "Loading course modules...");
  showSectionLoading("live", "Loading session schedule...");
  showSectionLoading("ftmo-tracker", "Loading tracker status...");

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      document.querySelector(".dashboard-header h2").textContent =
        "Please log in to view your dashboard.";
      showSectionError("courses", "Login required.");
      showSectionError("live", "Login required.");
      showSectionError("ftmo-tracker", "Login required.");
      return;
    }
    const userId = user.id;
    STUDENT_DATA = await fetchStudentDashboard(userId);
    // COURSE_MODULES = await fetchCourseModules(userId);
    DASHBOARD_ERROR = null;
  } catch (e) {
    DASHBOARD_ERROR = e;
    console.error("Dashboard data fetch error:", e);
    document.querySelector(".dashboard-header h2").textContent =
      "Error loading dashboard";
    showSectionError("courses");
    showSectionError("live");
    showSectionError("ftmo-tracker");
    return;
  }

  document.querySelector(
    ".profile p"
  ).textContent = `Tier: ${STUDENT_DATA.tier}`;

  renderStats();
  if (!STUDENT_DATA.ftmo || Object.keys(STUDENT_DATA.ftmo).length === 0) {
    showSectionEmpty("ftmo-tracker", "No FTMO challenge data available.");
  } else {
    renderFTMOTracker();
  }
  if (!STUDENT_DATA.liveSessions || STUDENT_DATA.liveSessions.length === 0) {
    showSectionEmpty("live", "No upcoming live sessions.");
  } else {
    renderLiveSessions();
  }
  if (!COURSE_MODULES || COURSE_MODULES.length === 0) {
    showSectionEmpty("courses", "No course modules assigned yet.");
  } else {
    renderCourses();
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// --- LESSON & QUIZ UI SCAFFOLD ---
async function fetchLessonsForModule(moduleId) {
  // Placeholder: Replace with real Supabase fetch
  // Example: let { data } = await supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_num');
  return [
    {
      id: 1,
      title: "Lesson 1: What is Forex?",
      content: "Forex is the global market for trading currencies.",
      completed: false,
    },
    {
      id: 2,
      title: "Lesson 2: Brokers & Platforms",
      content: "How to choose a broker and use trading platforms.",
      completed: false,
    },
  ];
}

async function fetchQuizForModule(moduleId) {
  // Placeholder: Replace with real Supabase fetch
  // Example: let { data } = await supabase.from('quizzes').select('*').eq('module_id', moduleId);
  return [
    {
      id: 1,
      question: "What does Forex stand for?",
      options: ["Foreign Exchange", "For Example", "Force X"],
      correct_answer: "Foreign Exchange",
    },
    {
      id: 2,
      question: "What is a pip?",
      options: ["A fruit", "A price movement", "A broker"],
      correct_answer: "A price movement",
    },
  ];
}

function showLessonModal(module) {
  fetchLessonsForModule(module.id).then((lessons) => {
    let currentLesson = 0;
    const modal = document.createElement("div");
    modal.className = "modal-overlay fade-in";
    modal.tabIndex = 0;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    function renderLesson(idx) {
      const lesson = lessons[idx];
      modal.innerHTML = `
        <div class="modal lesson-modal">
          <button class="modal-close" aria-label="Close" tabindex="0">&times;</button>
          <h2>${module.title} - ${lesson.title}</h2>
          <div class="modal-body">
            <div class="lesson-content">${lesson.content}</div>
            <div class="lesson-progress">
              Lesson ${idx + 1} of ${lessons.length}
              <progress value="${idx + 1}" max="${lessons.length}"></progress>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" ${
              idx === 0 ? "disabled" : ""
            } tabindex="0">Previous</button>
            <button class="btn btn-secondary" ${
              idx === lessons.length - 1 ? "disabled" : ""
            } tabindex="0">Next</button>
            <button class="btn btn-primary" tabindex="0">${
              lesson.completed ? "Completed" : "Mark as Complete"
            }</button>
            ${
              idx === lessons.length - 1
                ? '<button class="btn btn-success" id="take-quiz" tabindex="0">Take Quiz</button>'
                : ""
            }
          </div>
        </div>
      `;
      // Focus trap for accessibility
      setTimeout(() => {
        modal.querySelector(".modal-close").focus();
      }, 100);
      modal.querySelector(".modal-close").onclick = () => closeModal();
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
      function closeModal() {
        modal.classList.remove("fade-in");
        modal.classList.add("fade-out");
        setTimeout(() => {
          if (modal.parentNode) document.body.removeChild(modal);
        }, 200);
      }
      // Keyboard navigation
      modal.onkeydown = (e) => {
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowLeft" && idx > 0) renderLesson(idx - 1);
        if (e.key === "ArrowRight" && idx < lessons.length - 1)
          renderLesson(idx + 1);
      };
      // Navigation
      modal.querySelectorAll(".btn-secondary")[0].onclick = () => {
        if (idx > 0) renderLesson(idx - 1);
      };
      modal.querySelectorAll(".btn-secondary")[1].onclick = () => {
        if (idx < lessons.length - 1) renderLesson(idx + 1);
      };
      // Mark as complete (placeholder)
      modal.querySelector(".btn-primary").onclick = () => {
        lessons[idx].completed = true;
        modal.querySelector(".btn-primary").textContent = "Completed";
        modal.querySelector(".btn-primary").disabled = true;
        // Optionally: show a toast or subtle feedback
        showToast("Lesson marked as complete!");
      };
      // Quiz
      if (idx === lessons.length - 1) {
        modal.querySelector("#take-quiz").onclick = () => {
          closeModal();
          showQuizModal(module);
        };
      }
    }
    renderLesson(currentLesson);
    document.body.appendChild(modal);
  });
}

function showQuizModal(module) {
  fetchQuizForModule(module.id).then((questions) => {
    let currentQ = 0;
    let score = 0;
    const modal = document.createElement("div");
    modal.className = "modal-overlay fade-in";
    modal.tabIndex = 0;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    function renderQuestion(idx) {
      const q = questions[idx];
      modal.innerHTML = `
        <div class="modal quiz-modal">
          <button class="modal-close" aria-label="Close" tabindex="0">&times;</button>
          <h2>${module.title} - Quiz</h2>
          <div class="modal-body">
            <div class="quiz-question">${q.question}</div>
            <div class="quiz-options">
              ${q.options
                .map(
                  (opt) =>
                    `<label><input type="radio" name="quizopt" value="${opt}"> ${opt}</label>`
                )
                .join("")}
            </div>
            <div class="quiz-progress">
              Question ${idx + 1} of ${questions.length}
              <progress value="${idx + 1}" max="${questions.length}"></progress>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" ${
              idx === 0 ? "disabled" : ""
            } tabindex="0">Previous</button>
            <button class="btn btn-secondary" ${
              idx === questions.length - 1 ? "disabled" : ""
            } tabindex="0">Next</button>
            <button class="btn btn-primary" tabindex="0">Submit Answer</button>
          </div>
        </div>
      `;
      setTimeout(() => {
        modal.querySelector(".modal-close").focus();
      }, 100);
      modal.querySelector(".modal-close").onclick = () => closeModal();
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
      function closeModal() {
        modal.classList.remove("fade-in");
        modal.classList.add("fade-out");
        setTimeout(() => {
          if (modal.parentNode) document.body.removeChild(modal);
        }, 200);
      }
      // Keyboard navigation
      modal.onkeydown = (e) => {
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowLeft" && idx > 0) renderQuestion(idx - 1);
        if (e.key === "ArrowRight" && idx < questions.length - 1)
          renderQuestion(idx + 1);
      };
      // Navigation
      modal.querySelectorAll(".btn-secondary")[0].onclick = () => {
        if (idx > 0) renderQuestion(idx - 1);
      };
      modal.querySelectorAll(".btn-secondary")[1].onclick = () => {
        if (idx < questions.length - 1) renderQuestion(idx + 1);
      };
      // Submit
      modal.querySelector(".btn-primary").onclick = () => {
        const selected = modal.querySelector('input[name="quizopt"]:checked');
        if (!selected) {
          showToast("Select an answer!");
          return;
        }
        if (selected.value === q.correct_answer) {
          showToast("Correct!", "success");
          score++;
        } else {
          showToast("Incorrect.", "error");
        }
        if (idx < questions.length - 1) renderQuestion(idx + 1);
        else {
          setTimeout(() => {
            showToast(
              `Quiz complete! Your score: ${score}/${questions.length}`,
              "info"
            );
            closeModal();
          }, 400);
        }
      };
    }
    renderQuestion(currentQ);
    document.body.appendChild(modal);
  });
}

// Hook up lesson modal to course action buttons
const observer = new MutationObserver(() => {
  document.querySelectorAll(".course-module .btn-primary").forEach((btn) => {
    btn.onclick = (e) => {
      const idx = btn.closest(".course-module").getAttribute("data-course-idx");
      const module = COURSE_MODULES[idx];
      showLessonModal(module);
    };
  });
});
observer.observe(document.body, { childList: true, subtree: true });

// --- UI POLISH: Modal, Quiz, Toast Styles ---
const style2 = document.createElement("style");
style2.innerHTML = `
.modal-overlay {
  position: fixed; z-index: 1000; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s;
}
.fade-in { opacity: 1; animation: fadeIn 0.2s; }
.fade-out { opacity: 0; animation: fadeOut 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
.modal { background: #fff; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); padding: 32px 24px 24px; max-width: 95vw; width: 100%; min-width: 320px; position: relative; }
.modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 2rem; color: #888; cursor: pointer; transition: color 0.2s; }
.modal-close:focus, .modal-close:hover { color: #222; outline: 2px solid #2196f3; }
.lesson-modal, .quiz-modal { max-width: 480px; width: 100%; }
.lesson-content { margin-bottom: 24px; font-size: 1.1rem; }
.lesson-progress, .quiz-progress { margin: 12px 0 0 0; font-size: 0.95rem; color: #666; }
.lesson-progress progress, .quiz-progress progress { width: 100%; height: 8px; border-radius: 4px; accent-color: #2196f3; }
.modal-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; margin-top: 18px; }
.modal-actions .btn { min-width: 110px; }
.quiz-question { font-weight: bold; margin-bottom: 12px; }
.quiz-options label { display: block; margin-bottom: 8px; cursor: pointer; }
.quiz-options input[type="radio"] { margin-right: 8px; accent-color: #2196f3; }
@media (max-width: 600px) {
  .modal { padding: 16px 4vw 16px; }
  .lesson-modal, .quiz-modal { max-width: 98vw; }
}
/* Toast styles */
.toast {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  background: #222; color: #fff; padding: 12px 28px; border-radius: 8px;
  font-size: 1rem; z-index: 2000; opacity: 0.98; box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  animation: toastIn 0.3s;
}
.toast.success { background: #4caf50; }
.toast.error { background: #e53935; }
.toast.info { background: #2196f3; }
@keyframes toastIn { from { opacity: 0; bottom: 0; } to { opacity: 0.98; bottom: 32px; } }
`;
document.head.appendChild(style2);

// Toast feedback utility
function showToast(msg, type = "") {
  const toast = document.createElement("div");
  toast.className = `toast${type ? " " + type : ""}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = 0;
  }, 1800);
  setTimeout(() => {
    if (toast.parentNode) document.body.removeChild(toast);
  }, 2200);
}
