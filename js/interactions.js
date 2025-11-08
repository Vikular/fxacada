/* filepath: c:\Users\BUYPC COMPUTERS\Desktop\X\web-app-project\js\interactions.js */
// ============================================
// INTERACTIVE FEATURES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initFAQAccordion();
  initMobileMenu();
  initSmoothScroll();
  initFormValidation();
  initTooltips();
  initLoadingStates();
});

// ============================================
// FAQ ACCORDION
// ============================================
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (!question || !answer) return;
    
    // Hide all answers initially
    answer.style.display = 'none';
    
    // Add toggle icon if not exists
    if (!question.querySelector('.faq-icon')) {
      const icon = document.createElement('span');
      icon.className = 'faq-icon';
      icon.textContent = '▼';
      question.appendChild(icon);
    }
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other FAQs
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.display = 'none';
      });
      
      // Toggle current FAQ
      if (!isActive) {
        item.classList.add('active');
        answer.style.display = 'block';
      }
    });
  });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const header = document.querySelector('header');
  if (!header) return;
  
  const nav = header.querySelector('nav');
  if (!nav) return;
  
  // Create hamburger button
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  hamburger.setAttribute('aria-label', 'Toggle menu');
  
  // Insert hamburger before nav
  header.querySelector('.header-content').insertBefore(hamburger, nav);
  
  // Toggle menu
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('mobile-open');
    hamburger.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && nav.classList.contains('mobile-open')) {
      nav.classList.remove('mobile-open');
      hamburger.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
  
  // Close menu on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-open');
      hamburger.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ============================================
// FORM VALIDATION
// ============================================
function initFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      let isValid = true;
      
      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        showMessage(form, 'error', '⚠️ Please fix the errors before submitting');
      }
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const required = field.hasAttribute('required');
  let error = '';
  
  // Clear previous error
  clearFieldError(field);
  
  // Required check
  if (required && !value) {
    error = 'This field is required';
  }
  
  // Email validation
  else if (type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      error = 'Please enter a valid email';
    }
  }
  
  // Phone validation
  else if (field.name === 'phone' && value) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value) || value.length < 10) {
      error = 'Please enter a valid phone number';
    }
  }
  
  // Password strength
  else if (type === 'password' && value && value.length < 8) {
    error = 'Password must be at least 8 characters';
  }
  
  if (error) {
    showFieldError(field, error);
    return false;
  }
  
  return true;
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Remove existing error
  const existingError = field.parentElement.querySelector('.field-error');
  if (existingError) existingError.remove();
  
  // Add error message
  const errorEl = document.createElement('span');
  errorEl.className = 'field-error';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}

function clearFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.parentElement.querySelector('.field-error');
  if (errorEl) errorEl.remove();
}

function showMessage(form, type, message) {
  // Remove existing messages
  const existingMsg = form.querySelector('.form-message');
  if (existingMsg) existingMsg.remove();
  
  const msgEl = document.createElement('div');
  msgEl.className = `form-message ${type}`;
  msgEl.textContent = message;
  form.insertBefore(msgEl, form.firstChild);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    msgEl.remove();
  }, 5000);
}

// ============================================
// TOOLTIPS
// ============================================
function initTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  tooltipElements.forEach(el => {
    const tooltipText = el.getAttribute('data-tooltip');
    
    el.addEventListener('mouseenter', (e) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipText;
      document.body.appendChild(tooltip);
      
      const rect = el.getBoundingClientRect();
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
      
      el._tooltip = tooltip;
    });
    
    el.addEventListener('mouseleave', () => {
      if (el._tooltip) {
        el._tooltip.remove();
        el._tooltip = null;
      }
    });
  });
}

// ============================================
// LOADING STATES
// ============================================
function initLoadingStates() {
  // Add loading state to buttons on form submit
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        showButtonLoading(submitBtn);
        
        // Reset after 3 seconds if still loading (fallback)
        setTimeout(() => {
          hideButtonLoading(submitBtn);
        }, 10000);
      }
    });
  });
}

function showButtonLoading(button) {
  button.disabled = true;
  button._originalText = button.textContent;
  button.textContent = '⏳ Loading...';
  button.classList.add('loading');
}

function hideButtonLoading(button) {
  button.disabled = false;
  if (button._originalText) {
    button.textContent = button._originalText;
  }
  button.classList.remove('loading');
}

// ============================================
// UTILITY FUNCTIONS (Export for use elsewhere)
// ============================================
window.interactions = {
  showButtonLoading,
  hideButtonLoading,
  showMessage,
  validateField
};