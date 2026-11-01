import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { Activity, TrendingUp, Newspaper, Bot, IndianRupee, ArrowRight, Search } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "AI TREND PREDICTION",
    body: "A prediction model projects each stock's future trend over 1-week, 1-month and 3-month horizons, plotted as a ₹ price path anchored at today's price.",
  },
  {
    icon: Newspaper,
    title: "NEWS INTELLIGENCE",
    body: "The AI scans the web for the latest news, earnings reports and incidents around the stock, then scores each item's sentiment and likely market impact.",
  },
  {
    icon: Bot,
    title: "ADVISORY AGENT",
    body: "An advisory agent weighs the prediction against the news to suggest how much to buy, when to enter, and when to exit — with a buy favorability score out of 100.",
  },
];

const steps = [
  "Type any NSE ticker or company name — RELIANCE, TCS, INFY, HDFCBANK and more.",
  "The AI pipeline predicts the trend, scans the latest news, and produces a rupee-denominated forecast chart.",
  "Read the advisory: entry range, target price, stop loss and position guidance — all in ₹.",
];

export default function AiStocksIndia() {
  return (
    <div className="min-h-screen bg-background terminal-grid">
      <Seo
        title="AI Stocks in India — AI-Powered NSE Stock Analysis & Forecasts in ₹"
        description="Research AI stocks in India with StockOracle: AI trend prediction, news intelligence and buy/sell advice in rupees for any NSE or US ticker, free in your browser."
        path="/ai-stocks-india"
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <header className="mb-10 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <Activity className="h-4 w-4 text-primary" />
            STOCK<span className="text-primary">ORACLE</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight mb-3">
            AI Stocks in India —<br />
            <span className="text-primary">Research Any NSE Ticker with AI</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            StockOracle is a free AI stock research terminal for Indian investors. Enter any NSE-listed
            ticker — or any US one — and get an AI trend prediction, a scan of the latest news and
            incidents, and a buy/sell advisory, all in Indian Rupees.
          </p>
        </header>

        {/* How it works */}
        <section className="glass-card p-6 mb-6 animate-fade-in-up" aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="font-semibold font-mono text-sm mb-4">WHAT THE AI DOES</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="bg-muted/20 rounded-md p-4 border border-border/30">
                <f.icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="text-xs font-mono font-semibold mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="glass-card p-6 mb-6 animate-fade-in-up" aria-labelledby="get-started">
          <h2 id="get-started" className="font-semibold font-mono text-sm mb-4">HOW TO ANALYZE AN NSE STOCK</h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/85">
                <span className="shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-mono flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground font-mono">
            <IndianRupee className="h-3.5 w-3.5 text-primary" />
            Every forecast, target and stop loss is shown in ₹ (INR) — no currency conversion needed.
          </div>
        </section>

        {/* Who it's for */}
        <section className="glass-card p-6 mb-8 animate-fade-in-up" aria-labelledby="use-cases">
          <h2 id="use-cases" className="font-semibold font-mono text-sm mb-4">WHO IT'S FOR</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">If you're tracking the best AI stocks in India</span> — or
              AI-heavy names in software and IT services — the terminal turns hours of news reading into a
              one-screen summary: trend direction, confidence, catalysts, risks and a ₹-denominated price path.
            </p>
            <p>
              <span className="text-foreground font-medium">If you're new to the market,</span> the advisory agent
              explains its reasoning in plain language: why it rates a stock favorable to buy now, what price
              range it would enter at, and what would change its mind.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-sm font-semibold py-3 px-6 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Analyze a stock now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Free · No download · Works with NSE and US tickers
          </p>
        </section>

        <footer className="border-t border-border/40 pt-6 pb-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
            Disclaimer: StockOracle provides AI-generated research and analysis for informational purposes
            only. It is not investment advice, and predictions are probabilistic estimates, not guarantees.
            Consult a registered financial advisor before making investment decisions.
          </p>
        </footer>
      </div>
    </div>
  );
}
