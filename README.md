# Zorvyn Finance Dashboard
> A premium, highly-interactive financial analytics dashboard engineered for production-level performant web applications.

![Dashboard Preview](https://via.placeholder.com/1200x630?text=Zorvyn+Finance+Dashboard)

## 🎯 Overview
Zorvyn Finance is a production-grade, state-of-the-art dashboard built to evaluate frontend engineering maturity. The application prioritizes micro-interactive polish, deep glassmorphism aesthetics, accessibility (a11y), and zero-layout-shift data visualization.

*“In a production environment, server state would be managed using TanStack Query and real-time updates via WebSockets.”*

## ✨ Key Features
- **Intelligent Analytics:** Dynamic Recharts integration for Expense/Income visualization spanning multiple timeframes (7D, 30D, 90D).
- **Premium Glassmorphism:** Custom Tailwind-engineered glass panes mapped directly onto raw RGB primitives.
- **Micro-Interactions Driven by Framer Motion:** Fluid layout animations, scale-in modals, and hover dynamics perfectly synced at 150-300ms intervals.
- **Enterprise-Grade Mobile UX:** Fully responsive bottom-sheet filter drawers, complete with drag-handle aesthetics and robust keyboard focus-trapping.
- **Native Light/Dark Inversion Engine:** CSS variable-based token system orchestrating flawless dynamic backgrounds depending on system theme preference.

## 🛠️ Tech Stack
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS + Vanilla CSS Variables
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Charting Engine:** Recharts
- **Icons:** Lucide React
- **Notifications:** Sonner

## 🧠 Core Engineering & Design Decisions
1. **Performance via Sub-Chunking:** Heavy layout engines (`Recharts`, `Framer Motion`) and individual App Routes are natively chunked using React `lazy()` + `Suspense` to guarantee instantaneous Time-to-Interactive (TTI).
2. **Focus-Trapping (A11y):** Modals and drawers utilize a custom lightweight `useFocusTrap` hook to strictly encapsulate keyboard loops (Tab/Shift+Tab) ensuring screen-readers and visual impaired users are never trapped behind a backdrop.
3. **Skeleton Shimmer Engine:** Skeleton loading blocks strictly match the dimensions of their final loaded counterparts to eliminate Cumulative Layout Shift (CLS).
4. **CSS Primitive Variables:** Used `rgb(var(--primary) / alpha)` over static hex codes allowing instant theme resolution without re-rendering React components globally.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node JS (v18+) installed.

### Installation
1. Install standard dependencies:
   ```bash
   npm install
   ```

2. Spin up the Vite development server:
   ```bash
   npm run dev
   ```

3. View in browser at [http://localhost:5173/](http://localhost:5173/)

## 📝 License
Proprietary / Built as an engineering assessment.
