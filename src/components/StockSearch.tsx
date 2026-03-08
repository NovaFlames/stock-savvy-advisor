import { useState } from "react";
import { Search, TrendingUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StockSearchProps {
  onSearch: (ticker: string, amount?: number) => void;
  isLoading: boolean;
}

const POPULAR_TICKERS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "META"];

export function StockSearch({ onSearch, isLoading }: StockSearchProps) {
  const [ticker, setTicker] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase(), amount ? parseFloat(amount) : undefined);
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">STOCK ANALYZER</h2>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-signal-up animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter ticker symbol (e.g., AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="pl-10 font-mono bg-muted/50 border-border/50 focus:border-primary/50 uppercase"
              disabled={isLoading}
            />
          </div>
          <Input
            type="number"
            placeholder="Budget (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32 font-mono bg-muted/50 border-border/50 focus:border-primary/50"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !ticker.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Popular:</span>
        {POPULAR_TICKERS.map((t) => (
          <button
            key={t}
            onClick={() => { setTicker(t); onSearch(t, amount ? parseFloat(amount) : undefined); }}
            disabled={isLoading}
            className="text-xs font-mono px-2 py-1 rounded bg-secondary/50 text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
