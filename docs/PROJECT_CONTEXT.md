# Project Context

## App Overview

- **App:** Forex Mentorship Platform (static HTML/CSS/JS)
- **Pages:** index, auth-modal, admin-login, student, admin, manage-users, reports, settings, enrollment, submit-payment, submit-ftmo, contact, terms, privacy, 404
- **CSS:** css/globals.css, css/components.css (+ page/section styles)
- **JS:** js/main.js (app init/auth hooks), js/interactions.js (UI helpers)

## Tiered Progression Structure

The academy is structured into three progressive tiers: **Starter**, **Core**, and **Pro**. Advancement is conditional on meeting specific, measurable scaling conditions:

### Tier 1: Starter Trader (Foundation & Skill Acquisition)

- **Objective:** Understand market mechanics, master basic technical analysis, and demonstrate disciplined trade execution.
- **Core Modules:**
  - Market Fundamentals (Forex, brokers, leverage, margin)
  - Charting Mastery (candlesticks, S/R, trends)
  - Basic Indicator Setup (MA, RSI, MACD)
  - Trade Execution (order types, SL/TP)
- **Scaling Condition:** Pass FTMO Free Trial (profit target, max daily/total loss, min trading days, submit certificate)

### Tier 2: Core Trader (System Development & Risk Control)

- **Objective:** Develop a complete trading system, integrate fundamentals, master money management.
- **Core Modules:**
  - Deep Money Management (position size, drawdown, correlation)
  - Fundamental Context (economic data, central banks)
  - Strategy Development (trading plan)
  - Testing & Optimization (backtesting, forward testing)
- **Mandatory Daily Risk Rules:** Max 2 trades/day, max 2% risk/trade, daily stop on drawdown or trades hit
- **Scaling Condition:** 90-day demo/micro account challenge (20% net profit, <10% drawdown, 90% plan adherence, submit plan/journal/statements)

### Tier 3: Pro Trader (Psychology & Consistency)

- **Objective:** Master trading psychology, achieve sustained profitability, establish review cycles.
- **Core Modules:**
  - Advanced Psychology (FOMO, perfectionism, recovery)
  - Performance Review (quarterly/annual)
  - Tax & Regulatory (compliance)
  - The Transition (scaling up)
- **Scaling Condition:** 3 months of live, consistent profit (min 2%/month), 1% max risk/trade, submit live statements, final review

## Dashboard Features

- Tier recognition and access control (Starter, Core, Pro)
- Onboarding checklist (Starter)
- Module progress tracking (Starter)
- FTMO submission and verification (Starter → Core)
- Community & support integration
- Payment and FTMO history
- Dynamic Quiz Generator (AI-powered)
- Upgrade prompts and admin review logic (for scaling)
- Expandable sidebar navigation (collapsible for content focus)
- Dynamic course listing with status indicators (Completed, In Progress, Locked)
- FTMO Challenge status section (tier-gated)
- Responsive design (desktop/mobile)

## Technology Stack

| Technology             | Purpose                                                                                             |
| :--------------------- | :-------------------------------------------------------------------------------------------------- |
| **HTML5**              | Core structure (`student.html`).                                                                    |
| **CSS3**               | Styling and responsive layout (`css/components.css`, etc.).                                         |
| **JavaScript (ES6+)**  | Dynamic data rendering, UI interactions, and state management (`js/main.js`, `js/interactions.js`). |
| **Supabase (Planned)** | Placeholder for future backend integration (authentication, data storage).                          |

## Conventions

- No inline styles (use CSS classes)
- Favicon on all pages
- Responsive + a11y

## Project Structure

public/
student.html # Main dashboard UI
...
css/
components.css # Component styles
...
js/
main.js # Dashboard logic, dynamic rendering
interactions.js # Sidebar toggle, UI utilities
...

```plaintext
public/
  student.html         # Main dashboard UI
  ...
css/
  components.css       # Component styles
  ...
js/
  main.js              # Dashboard logic, dynamic rendering
  interactions.js      # Sidebar toggle, UI utilities
  ...
```

- All dashboard sections initialize with loading placeholders and are populated by `main.js`.
- Sidebar toggle and navigation are handled by `js/interactions.js` for maintainability.
- Course and feature access is simulated based on user tier, ready for backend integration.

## Next Steps

- Finish lint cleanup if any
- Supabase schema + env config
- Add scaling condition widgets and review flows
- Deploy (GitHub Pages)

## Next Phase: Platform Evolution

- **Backend Integration**

  - Connect Supabase for authentication, user data, and real-time updates.
  - Implement secure API endpoints for course progress, FTMO status, and payments.
  - Enforce Row Level Security (RLS) for user data privacy.

- **Dynamic Data & Tier Logic**

  - Replace mock data in `main.js` with live data from Supabase.
  - Implement real tier-based access control for dashboard features and course modules.
  - Add admin controls for user management, tier upgrades, and FTMO verification.

- **AI-Powered Tools**

  - Integrate LLM-powered Quiz Generator, News Summarizer, and Strategy Critic.
  - Add UI for students to access and interact with these tools.

- **User Experience & Community**

  - Build onboarding flows and checklists for new users.
  - Integrate community features (chat, forums, or Discord links).
  - Add notifications for live sessions, progress milestones, and admin feedback.

- **Testing & Quality**

  - Add unit and integration tests for JS modules and backend endpoints.
  - Set up CI/CD for automated deployment and linting.

- **Documentation & Support**
  - Expand user and admin documentation.
  - Add in-app help and support resources.
