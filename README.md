<h1 align="center">🏁 Apex F1 Live</h1>

A production-ready Formula 1 telemetry dashboard built with **Next.js 15**, **React Query**, **Recharts**, and the **OpenF1 API**. Track live race pace, monitor tyre strategy, and deep-dive into historical telemetry with a modern, responsive dark UI.

## ✨ Features

- **Live Dashboard** – Real-time speed traces, leaderboard, tyre compounds, and animated nav powered by React Query polling.
- **Race Archive** – Search past meetings by year, circuit, or driver and compare two drivers’ telemetry with stint summaries.
- **Responsive & Touch-Friendly** – Fluid layouts, hover/tap tooltips, and auto-resizing charts across mobile, tablet, and desktop.
- **Accessible Dark Mode** – High-contrast palette, focus outlines, and semantic markup for keyboard navigation.
- **Robust Data Layer** – OpenF1 REST data with automatic FastF1 fallback, caching, and configurable refetch intervals.
- **Unit Tested Components** – Critical UI primitives covered with Jest + React Testing Library.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) to access the dashboard. You’ll be redirected to `/live`; the archive view is available at `/archive`.

## 🧪 Testing

Run the Jest suite (includes DOM environment, React Query providers, and component tests):

```bash
npm test
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components where possible)
- **Language**: TypeScript (strict mode)
- **State/Data**: @tanstack/react-query, SWR-like caching, suspense-ready hooks
- **Charts**: Recharts for responsive telemetry visualisations
- **Animation**: Framer Motion for transitions and interactive navigation
- **Styling**: Tailwind (via `@tailwindcss/postcss`) + handcrafted dark theme
- **Testing**: Jest, React Testing Library, `@testing-library/jest-dom`

## 📦 Project Structure

```
src/
	app/          # App Router pages (live + archive)
	components/   # UI primitives and feature modules
	hooks/        # Data-fetching and domain hooks
	lib/          # API clients, utility helpers, colour maps
```

## 📡 Data Notes

- OpenF1 endpoints are polled every few seconds; historical endpoints revalidate manually.
- The telemetry layer gracefully falls back to a FastF1-compatible mirror when OpenF1 is unavailable.
- Speed traces default to the latest race session if live data is not streaming.

## 📄 License

This repository is for demo purposes. Data supplied by [OpenF1](https://openf1.org); all trademarks belong to their respective owners.
