# 🚀 Zorvyn Finance Dashboard

A production-inspired financial analytics dashboard designed to simulate a real-world SaaS product used by finance teams.

This project focuses on **clean UI systems, scalable state management, and product-level UX thinking**, rather than just visual implementation.

---

## 🌐 Live Demo

👉 https://zorvyn-finance-dashboard-ui.vercel.app
👉 Repository: https://github.com/ANKANJAGTAP/Zorvyn-Finance-Dashboard-UI

---

## 🧠 Product Thinking

Instead of building a “UI project”, this dashboard was designed as:

> **A simplified internal financial analytics tool**

Key goals:

* Reflect real-world financial workflows
* Maintain visual consistency with Zorvyn’s design system
* Ensure data → UI → insight flow is intuitive
* Keep interactions lightweight but meaningful

---

## ✨ Features

### 📊 Dashboard

* Financial summary (Balance, Income, Expenses, Savings Rate)
* Time-based trend analysis (7D / 30D / 90D)
* Category-wise spending breakdown
* Recent transactions preview (with navigation)

---

### 📋 Transactions

* Debounced search
* Multi-filter (Type, Category)
* Sorting (Date, Amount)
* CRUD operations (Admin only)
* Export CSV (exports filtered dataset)

---

### 🧠 Insights (Key Differentiator)

* Highest spending category detection
* Monthly comparison analysis
* Savings rate calculation
* AI-style financial summary (human-readable insights)

---

### 🔐 Role-Based UI

* **Viewer** → read-only
* **Admin** → full control (Add / Edit / Delete)

---

## ⚙️ Architecture & State Design

State is managed using **Zustand** with a clear separation:

### Core State

* transactions
* role
* filters
* selectedMetric

### Derived State

* totalBalance
* totalIncome
* totalExpense
* insights

👉 Derived values are computed in-store, not in components — improving performance and separation of concerns.

---

## 🎨 Design System

* Dark-first theme inspired by Zorvyn
* Gradient accents (Indigo → Purple → Cyan → Emerald)
* Glassmorphism UI (blur + subtle borders)
* Consistent typography using Inter
* Micro-interactions for feedback (hover, transitions)

---

## 🧱 Tech Stack

* React (Vite)
* Tailwind CSS
* Zustand
* React Router
* Recharts
* Framer Motion
* Lucide React

---

## 📦 Key Engineering Decisions

* Used **React Router** for realistic navigation flows
* Chose **Zustand** for simplicity + scalability
* Kept insights **independent from time filters** (reduces cognitive load)
* CSV export reflects **current filtered state** (real-world behavior)

---

## ⚠️ Trade-offs

* No backend (mock data used intentionally to focus on frontend architecture)
* Limited validation (UI-first approach)
* Dark mode only (aligned with design direction)

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
