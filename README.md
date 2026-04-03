# Finance Dashboard UI (React)

A simple finance dashboard built with React + Vite. The goal is to keep it clean and usable while covering the assignment requirements (summary, charts, transactions, insights, and a lightweight role toggle).

## Features
- Summary cards: balance, income, expenses, savings rate
- Balance trend (SVG line chart)
- Spending breakdown by category (SVG donut chart)
- Transactions with search, filter, and sorting
- Viewer/Admin role toggle (Admin can add/edit/delete)
- Insights from the current dataset
- Local storage for transactions + theme
- Responsive layout

## Getting Started
1. `npm install`
2. `npm run dev`

## Requirement Mapping
- **Dashboard Overview**: summary cards + trend chart + category chart
- **Transactions**: list + search/filter/sort + edit/add/delete (Admin)
- **Role Based UI**: dropdown switch
- **Insights**: top spend, month-over-month change, expense ratio
- **State Management**: React state in `App.jsx`
- **Empty States**: friendly messaging when filters return nothing

## File Structure
- `index.html` — Vite entry
- `src/main.jsx` — React entry
- `src/App.jsx` — UI + state + logic
- `src/styles.css` — styling

## Extras
- Theme toggle
- Local storage persistence
- Subtle entry animations
