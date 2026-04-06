# Zorvyn Finance Dashboard

A responsive financial analytics dashboard built to demonstrate frontend engineering maturity, focusing on UI systems, performance, and real-world UX patterns.

**Live Demo:** https://zorvyn-finance-dashboard-ui.vercel.app/dashboard  
**Repository:** https://github.com/ANKANJAGTAP/Zorvyn-Finance-Dashboard-UI

---

## Overview

This project simulates a production-style finance dashboard used to track transactions, analyze spending patterns, and generate insights.

**Focus Areas:**
- Clean UI architecture  
- Scalable state management  
- Consistent data-driven rendering  
- Responsive and accessible user experience  

In a production environment, server state would be managed using TanStack Query and real-time updates via WebSockets.

---

## Why This Project Stands Out

- Designed with product-level thinking, not just UI implementation  
- Strong emphasis on data consistency across all components  
- Performance-aware architecture using lazy loading and skeleton states  
- Accessibility considerations including focus trapping and keyboard navigation  
- Clean separation of concerns using Zustand for predictable state flow  
- Mobile-first responsiveness with adaptive data formatting  

---

## Features

### Dashboard
- Financial summary (Balance, Income, Expenses, Savings Rate)  
- Time-based trend analysis (7D, 30D, 90D)  
- Category-wise spending visualization  
- Insights with human-readable summaries  

### Transactions
- Search, filter, and sorting  
- Add, edit, and delete transactions (Admin mode)  
- Bulk selection with action bar  
- "Delete All" action included for testing data consistency across the application  

### Insights
- Highest spending category detection  
- Monthly comparison  
- Savings rate calculation  
- AI-style summary for quick understanding  

---

## Engineering Highlights

- Lazy loading and code splitting for improved performance  
- Skeleton loading to prevent layout shifts  
- Focus trapping and keyboard accessibility for modals and drawers  
- Consistent currency and data formatting across the application  
- Mobile-first responsive design with optimized layouts for smaller screens  

---

## Tech Stack

- React (Vite)  
- Tailwind CSS + CSS Variables  
- Zustand (state management)  
- Recharts (data visualization)  
- Framer Motion (animations)  
- Lucide React (icons)  
- Sonner (notifications)  

---

## Responsiveness

The application is fully responsive and optimized for:

- Desktop  
- Tablet  
- Mobile devices  

UI components adapt layout, spacing, and data formatting for smaller screens.

---

## Getting Started

```bash
git clone https://github.com/ANKANJAGTAP/Zorvyn-Finance-Dashboard.git
npm install
npm run dev
```

---

## Related Work

**Outfyld (Full-Stack Product)**  
A production-grade sports booking platform focused on real-world reservation workflows and scalability.  
https://www.outfyld.in/

**Portfolio**  
A collection of projects showcasing frontend systems, UI/UX design, and full-stack development work.  
https://ankan-portfolio-smoky.vercel.app/

---

## Notes

- This project uses mock data for all transactions and analytics.  
- The "Delete All" functionality is intentionally included to validate data consistency and UI updates across the application.  
- No backend integration is included, as the focus is on frontend architecture, UI systems, and interaction design.  

---

## License

Proprietary. This project was developed as part of an engineering assessment.