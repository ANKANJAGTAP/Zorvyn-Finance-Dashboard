# Zorvyn Finance Dashboard

A production-inspired financial analytics dashboard designed to simulate a real-world SaaS product used by finance teams.

This project focuses on clean UI systems, scalable state management, and product-level UX thinking rather than just visual implementation.

---

## Live Demo

https://zorvyn-finance-dashboard-ui.vercel.app
Repository: https://github.com/ANKANJAGTAP/Zorvyn-Finance-Dashboard-UI

---

## Overview

This dashboard is designed as a simplified internal financial analytics tool.

Key objectives:

* Reflect real-world financial workflows
* Maintain visual consistency with a defined design system
* Ensure intuitive data-to-insight flow
* Provide meaningful, lightweight interactions

---

## Features

### Dashboard

* Financial summary (Balance, Income, Expenses, Savings Rate)
* Animated number counters for key metrics
* Time-based trend analysis (7D / 30D / 90D)
* Category-wise spending breakdown (interactive chart)
* Recent transactions preview with empty state handling
* Progressive loading with staged content rendering

---

### Transactions

* Debounced search with real-time updates
* Multi-filtering (type, category) and sorting
* CRUD operations (Admin role only) with feedback
* Undo delete functionality with a timed window
* Responsive layout with mobile-friendly card view
* CSV export of filtered data
* Proper handling of empty and filtered states

---

### Insights

* Highest spending category detection
* Monthly comparison metrics
* Savings rate calculation
* Human-readable financial summary
* Alerts for disproportionate spending patterns
* Graceful handling of zero-data scenarios

---

### Role-Based UI

* Viewer: read-only access
* Admin: full access (create, update, delete)

---

## User Interaction Flows

| Action             | Flow                                             |
| ------------------ | ------------------------------------------------ |
| Add Transaction    | Modal → confirmation feedback → dashboard update |
| Delete Transaction | Undo-enabled feedback → reversible action        |
| Edit Transaction   | Modal → immediate UI update                      |
| Filter/Search      | Instant synchronization across UI and charts     |
| Export CSV         | File generation with confirmation feedback       |

---

## Architecture and State Management

State is managed using Zustand with clear separation of responsibilities.

### Core State

* transactions (persisted)
* role (persisted)
* filters (session-based)
* selectedMetric
* timeFilter

### Derived State

* totalBalance, totalIncome, totalExpense
* filteredTransactions
* categoryBreakdown
* insights
* chartData

Derived values are computed within the store to ensure separation of concerns and performance efficiency.

---

## State Strategy

* Global state handled via Zustand
* Derived data computed inside the store
* Components subscribe using selective selectors
* Charts react to filtered and time-based state

---

## Edge Case Handling

* Empty states across all major sections
* Loading states using skeleton UI
* Input validation:

  * Prevents zero or negative amounts
  * Prevents future dates
  * Character limits enforced
* Error handling with retry options
* Undo pattern for destructive actions

---

## Performance Considerations

* Memoized derived computations
* Optimized Zustand selectors to prevent unnecessary re-renders
* Smooth animations using requestAnimationFrame
* Staggered content loading for perceived performance
* Controlled chart rendering and animation timing

---

## Accessibility

* ARIA labels for interactive elements
* Proper semantic HTML structure
* Keyboard navigation support
* Accessible modal behavior
* Validation messaging for assistive technologies

---

## Design System

* Dark theme with consistent visual language
* Centralized design tokens (colors, spacing, radius)
* Gradient accents for emphasis
* Glassmorphism-based surfaces
* Reusable UI components (buttons, empty states)
* Consistent typography and spacing

---

## Technology Stack

* React (Vite)
* Tailwind CSS
* Zustand
* React Router
* Recharts
* Framer Motion
* Lucide React
* Sonner (notifications)

---

## Engineering Decisions

* Zustand chosen for simplicity and scalability
* React Router used for realistic navigation patterns
* Derived state computed in-store to reduce component complexity
* CSV export reflects filtered UI state
* Shared component system for UI consistency
* Minimal inline styling policy

---

## Trade-offs

* No backend integration (mock data used intentionally)
* Dark mode only
* Some dynamic styling requires limited inline values

---

## Setup

```bash
git clone https://github.com/ANKANJAGTAP/Zorvyn-Finance-Dashboard-UI
cd Zorvyn-Finance-Dashboard-UI
npm install
npm run dev
```

---

## Future Improvements

* Backend integration
* Authentication system
* Real-time analytics
* Light theme support
* Route-level code splitting

---

## Related Work

Outfyld (Full-Stack Product)
https://www.outfyld.in/

A sports booking platform focused on real-world scheduling and reservation workflows.

Portfolio
https://www.ankanjagtap.site/

---

## Author

Ankan Jagtap
B.Tech Computer Science Engineering (2027)
Full-stack developer focused on scalable systems and product-oriented interfaces
