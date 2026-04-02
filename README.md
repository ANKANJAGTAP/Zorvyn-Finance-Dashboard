# 🚀 Zorvyn Finance Dashboard

A production-inspired financial analytics dashboard designed to simulate a real-world SaaS product used by finance teams.

This project focuses on **clean UI systems, scalable state management, and product-level UX thinking**, rather than just visual implementation.

---

## 🌐 Live Demo

👉 https://zorvyn-finance-dashboard-ui.vercel.app
👉 Repository: https://github.com/ANKANJAGTAP/Zorvyn-Finance-Dashboard-UI

---

## 🧠 Product Thinking

Instead of building a "UI project", this dashboard was designed as:

> **A simplified internal financial analytics tool**

Key goals:

* Reflect real-world financial workflows
* Maintain visual consistency with Zorvyn's design system
* Ensure data → UI → insight flow is intuitive
* Keep interactions lightweight but meaningful

---

## ✨ Features

### 📊 Dashboard

* Financial summary (Balance, Income, Expenses, Savings Rate)
* **Animated number counters** — values tick from 0 → actual amount on load
* Time-based trend analysis (7D / 30D / 90D)
* Category-wise spending breakdown (interactive donut chart)
* Recent transactions preview with empty state handling
* **Progressive loading** — cards → charts → table with staggered reveal

---

### 📋 Transactions

* Debounced search with instant UI sync
* Multi-filter (Type, Category) with sort options
* CRUD operations (Admin only) with **toast feedback**
* **Undo delete** — toast with 5s undo window
* **Mobile-responsive card layout** — stacked cards on small screens
* Export CSV (exports filtered dataset) with success toast
* Empty states for no data + no filter results

---

### 🧠 Insights (Key Differentiator)

* Highest spending category detection
* Monthly comparison analysis
* Savings rate calculation
* **AI-style financial summary** (human-readable insights)
* **Smart alerts** — warns when a category exceeds 40% of spending
* Zero-data empty state with CTA

---

### 🔐 Role-Based UI

* **Viewer** → read-only
* **Admin** → full control (Add / Edit / Delete)

---

## 🔄 User Interaction Flows

| Action | Flow |
|--------|------|
| Add Transaction | Modal → Toast ✅ → Dashboard updates → Chart animates |
| Delete Transaction | Undo toast → Revert possible within 5s |
| Edit Transaction | Modal → Toast ✅ → UI updates instantly |
| Filter/Search | Instant UI + chart sync (no loading state) |
| Export CSV | Toast ✅ with file name confirmation |

---

## ⚙️ Architecture & State Design

State is managed using **Zustand** with a clear separation:

### Core State

* transactions (persisted)
* role (persisted)
* filters (session only)
* selectedMetric
* timeFilter

### Derived State (Computed In-Store)

* totalBalance, totalIncome, totalExpense
* filteredTransactions
* categoryBreakdown
* insights (AI summary data)
* chartData (time-filtered, running balance)

👉 Derived values are computed in-store, not in components — improving performance and separation of concerns.

### State Strategy

* `transactions` → global (Zustand, persisted)
* `filters` → global (Zustand, not persisted)
* `insights` → derived in-store via getters
* Charts react to `timeFilter` + `transactions` (filtered state)
* Components subscribe via specific selectors (not full store)

---

## 🧪 Edge Case Handling

- Empty states handled across Dashboard, Transactions, and Insights
- Loading states implemented using **shimmer skeleton UI** with progressive reveal
- Role-based UI enforced at component level
- Input validation for transaction creation:
  - Prevents ₹0 and negative amounts
  - Prevents future dates
  - Max character limit on descriptions
  - Inline error messages + toast on validation failure
- Error states with retry buttons on data load failures
- Undo pattern for destructive actions (delete)

---

## 🎯 Performance Optimizations

- Memoized derived state (`useMemo` for totals computation)
- Specific Zustand selectors to prevent unnecessary re-renders
- `requestAnimationFrame`-based animated counters (60fps)
- Progressive/staggered loading (300ms → 550ms → 750ms)
- Framer Motion `AnimatePresence` for page transitions
- Chart animations with 800ms ease-out curves

---

## ♿ Accessibility

- `aria-label` on all interactive buttons and inputs
- `aria-current="page"` on active navigation links
- `role="dialog"` and `aria-modal` on modals
- `role="radiogroup"` on toggle groups (type/category selectors)
- `focus-visible` ring styling for keyboard users
- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<aside>`
- Escape key to close modals
- `aria-invalid` and `aria-describedby` for form validation errors

---

## 🎨 Design System

* Dark-first theme inspired by Zorvyn
* CSS custom properties for all design tokens (colors, spacing, radius)
* Gradient accents (Indigo → Purple → Cyan → Emerald)
* Glassmorphism UI (blur + subtle borders)
* Consistent typography using Inter
* **Reusable `<Button />` component** with variants (primary, secondary, ghost, danger)
* **Reusable `<EmptyState />` component** with configurable presets
* Micro-interactions: hover glow, tap scale, card elevation, tooltip animations

---

## 🧱 Tech Stack

* React 18 (Vite)
* Tailwind CSS
* Zustand (persistent state)
* React Router
* Recharts
* Framer Motion
* Lucide React
* **Sonner** (toast notifications)

---

## 📦 Key Engineering Decisions

* Used **React Router** for realistic navigation flows
* Chose **Zustand** for simplicity + scalability
* Kept insights **independent from time filters** (reduces cognitive load)
* CSV export reflects **current filtered state** (real-world behavior)
* **Sonner over react-hot-toast** — modern API, built-in dark mode, undo pattern
* **Shared `<Button />` component** — all buttons use consistent design system
* **No inline styles policy** — Tailwind + CSS custom properties
* **Progressive loading** — staggered reveal for premium feel

---

## ⚠️ Trade-offs

* No backend (mock data used intentionally to focus on frontend architecture)
* Dark mode only (aligned with design direction)
* Some dynamic color styles use minimal inline CSS (category colors, gradient accents)

---

## 🛠️ Setup

```bash
git clone https://github.com/ANKANJAGTAP/Zorvyn-Finance-Dashboard-UI
cd Zorvyn-Finance-Dashboard-UI
npm install
npm run dev
```

---

## 📈 Future Improvements

* Backend integration (Node + DB)
* Authentication & user sessions
* Real-time analytics
* Light mode system
* Lazy-loaded route splitting

---

## 🔗 Related Work

### 🟢 Outfyld (Full-Stack Product)

A production-grade sports booking platform solving real-world turf reservation problems.

👉 https://www.outfyld.in/

* Built with Next.js, Node.js, and scalable backend architecture
* Handles real user workflows and booking logic

---

### 🌐 Portfolio

Explore more of my work and projects:

👉 https://www.ankanjagtap.site/


## 👤 Author

**Ankan Jagtap**
B.Tech CSE (2027)
Full-stack developer focused on building scalable systems and product-grade UIs
