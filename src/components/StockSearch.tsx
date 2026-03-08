import { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface StockSearchProps {
  onSearch: (ticker: string, amount?: number) => void;
  isLoading: boolean;
}

interface TickerResult {
  ticker: string;
  name: string;
}

const POPULAR_TICKERS = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "WIPRO", "SBIN", "AAPL", "NVDA", "TSLA"];

export function StockSearch({ onSearch, isLoading }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [suggestions, setSuggestions] = useState<TickerResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Only search if query looks like a company name (has lowercase or spaces)
    const isCompanySearch = query.length >= 2 && (/[a-z]/.test(query) || query.includes(" "));

    if (!isCompanySearch) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke("ticker-search", {
          body: { query },
        });
        if (!error && data?.results?.length) {
          setSuggestions(data.results);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query.trim().toUpperCase(), amount ? parseFloat(amount) : undefined);
    }
  };

  const selectTicker = (result: TickerResult) => {
    setQuery(result.ticker);
    setShowSuggestions(false);
    onSearch(result.ticker, amount ? parseFloat(amount) : undefined);
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold font-mono">STOCK ANALYZER</h2>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--signal-up))] animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1" ref={containerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
            )}
            <Input
              placeholder="Ticker or company name (e.g., AAPL or Apple)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 font-mono bg-muted/50 border-border/50 focus:border-primary/50"
              disabled={isLoading}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full mt-1 left-0 right-0 glass-card border border-border/50 rounded-md overflow-hidden shadow-xl">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.ticker}-${i}`}
                    type="button"
                    onClick={() => selectTicker(s)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-primary/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-primary">{s.ticker}</span>
                      <span className="text-muted-foreground text-xs truncate max-w-[200px]">{s.name}</span>
                    </div>
                    <Search className="h-3 w-3 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <Input
            type="number"
            placeholder="Budget (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32 font-mono bg-muted/50 border-border/50 focus:border-primary/50"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Popular:</span>
        {POPULAR_TICKERS.map((t) => (
          <button
            key={t}
            onClick={() => { setQuery(t); onSearch(t, amount ? parseFloat(amount) : undefined); }}
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
