# AutoSphere AI – Web Application

Web application for the **AutoSphere AI** platform, aligned with the **Complete Screen Inventory** BRD (Business Requirements Document). It provides a single portal to explore all platform areas: Driver, Insurance, Dealer, Sales, Technician, Property, Government, AI Admin, Analytics, and AI Assistant.

## BRD alignment

The app implements the structure from *AutoSphere_AI_Complete_Screen_Inventory.docx*:

| # | Platform | Screens |
|---|----------|--------|
| 1 | **Driver** | Auth, Dashboard, Mobility Score, Vehicle Health, Trips, Insurance, Claims, Service, Parking, EV, Emergency, Resale, Loan, Marketplace, Settings |
| 2 | **Insurance** | Admin Login, Portfolio, Risk Monitor, Premiums, Claims, Fraud Detection, Heatmaps, Policy, Loss Forecasting, Compliance, API |
| 3 | **Dealer** | Login, Inventory, Digital Twin, Pricing, Demand Forecast, Trade-In, Leads, Sales Funnel, Analytics, Commission, Finance, Market Trends |
| 4 | **Sales** | Dashboard, Lead Assignment, Interaction Logs, Performance, Commission, AI Suggestions, Follow-Up, Targets |
| 5 | **Technician** | Login, Job Queue, Diagnostic Digital Twin, AI Fault Detection, Repair Flow, AR, Time Estimator, Performance, Earnings |
| 6 | **Property** | Login, Dashboard, Parking Heatmap, Slots, Pricing, EV Control, Load Balancing, Revenue, Peak Prediction, Access, Carbon |
| 7 | **Government** | Login, Vehicle Overview, Compliance, Emissions, Traffic Heatmap, Accident/Risk, Policy Simulation, Recall, Fraud, Reports |
| 8 | **AI Admin** | Super Admin, Users/Roles, Model Monitoring, Federated Learning, Data Flow, API Gateway, Health, Incidents, Audit, Security, Billing |
| 9 | **Analytics** | Global Dashboard, Mobility/Health/Risk/Sales/Technician/Parking/Emission Trends, Forecasts, Model Comparison |
| 10 | **AI Assistant** | Chat, Voice, Predictive Suggestions, Context-Aware Actions, Explanation (Why This Score?) |

## Run locally

```bash
cd autosphere-web
npm install
npm run dev
```

Open **http://localhost:5173** (or the URL shown in the terminal).

## Build

```bash
npm run build
npm run preview   # optional: serve production build
```

## Structure

- **`/`** – Landing page and platform overview
- **`/login`** – Sign-in (placeholder) with role selector
- **`/app`** – Main app shell with sidebar; default route is `/app/driver`
- **`/app/driver`**, **`/app/insurance`**, … – One route per platform, each listing its BRD screens

## Stack

- **React 19** + **TypeScript**
- **Vite 7**
- **React Router 7**
- CSS with variables (dark theme, accent `#00d4aa`)

## Next steps

- Replace placeholder login with real auth and role-based access
- Implement full UI for each screen (forms, tables, charts) per BRD
- Connect to backend/APIs from the AutoSphere monorepo
