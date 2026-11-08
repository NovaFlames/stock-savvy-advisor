# StockOracle

AI-powered stock research for NSE and US tickers. StockOracle combines trend forecasts, market news, and an AI-generated advisory in one browser-based dashboard.

**Published app:** [finance-finder-agent.lovable.app](https://finance-finder-agent.lovable.app/)

## Features

- **Stock forecasts:** Explore projected trends across 1-week, 1-month, and 3-month horizons. Visualizations should support both percentage change and projected prices anchored to the current price, s[...]
- **News intelligence:** Review recent stock-related news and sentiment.
- **AI advisory:** Get an analysis with entry, target, stop-loss, and position guidance.
- **Research tools:** Keep a watchlist, revisit saved analyses, and compare past analyses.
- **Authentication:** Sign in to access account features.

> **Disclaimer:** StockOracle provides AI-generated research for informational purposes only. Forecasts are estimates, not guarantees, and are not financial advice. Consult a qualified financial profe[...]

## Technology

- React 18 and TypeScript
- Vite
- Tailwind CSS and shadcn/ui (Radix UI)
- Supabase (authentication and Edge Functions)
- TanStack Query and Recharts

## Getting started

### Prerequisites

- Node.js and npm
- A Supabase project configured for this application

### Setup

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/NovaFlames/stock-savvy-advisor.git
   cd stock-savvy-advisor
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure your Supabase project values:

   ```dotenv
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Vite prints the local development URL in the terminal.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run build:dev` | Create a development-mode build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run the test suite once. |
| `npm run test:watch` | Run tests in watch mode. |

## Backend

The application uses Supabase Edge Functions for stock prediction, news search, and advisory requests. Configure the required Supabase project and function secrets, then deploy the functions in `supab[...]

## Production build

Build the frontend with `npm run build`, then deploy the generated `dist/` directory to a static hosting provider. Configure the host to serve the single-page application routes correctly, and ensure [...]
