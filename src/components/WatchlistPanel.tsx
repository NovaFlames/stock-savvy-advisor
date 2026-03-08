import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Star, Trash2, RefreshCw, TrendingUp, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WatchlistItem {
  id: string;
  ticker: string;
  company_name: string | null;
  current_price: number | null;
  added_at: string;
}

interface WatchlistPanelProps {
  onAnalyze: (ticker: string) => void;
  currentTicker?: string;
  currentCompany?: string;
  currentPrice?: number;
}

export function WatchlistPanel({ onAnalyze, currentTicker, currentCompany, currentPrice }: WatchlistPanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .order("added_at", { ascending: false });
    if (error) {
      console.error("Watchlist fetch error:", error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async () => {
    if (!user || !currentTicker) return;
    const { error } = await supabase.from("watchlist").upsert(
      {
        user_id: user.id,
        ticker: currentTicker.toUpperCase(),
        company_name: currentCompany || null,
        current_price: currentPrice || null,
        last_checked_at: new Date().toISOString(),
      },
      { onConflict: "user_id,ticker" }
    );
    if (error) {
      toast.error("Failed to add to watchlist");
    } else {
      toast.success(`${currentTicker} added to watchlist`);
      fetchWatchlist();
    }
  };

  const removeFromWatchlist = async (id: string, ticker: string) => {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove");
    } else {
      toast.success(`${ticker} removed`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const isInWatchlist = items.some((i) => i.ticker === currentTicker?.toUpperCase());

  if (!user) {
    return (
      <div className="glass-card p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-signal-neutral" />
          <h3 className="font-semibold font-mono text-sm">WATCHLIST</h3>
        </div>
        <div className="text-center py-8">
          <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">Sign in to save stocks to your watchlist</p>
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs font-semibold py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-signal-neutral" />
          <h3 className="font-semibold font-mono text-sm">WATCHLIST</h3>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {currentTicker && !isInWatchlist && (
            <button
              onClick={addToWatchlist}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 font-mono text-[10px] font-semibold py-1 px-2.5 rounded-md hover:bg-primary/20 transition-colors"
            >
              <Star className="h-3 w-3" />
              Add {currentTicker}
            </button>
          )}
          {currentTicker && isInWatchlist && (
            <span className="inline-flex items-center gap-1.5 text-signal-neutral font-mono text-[10px] py-1 px-2.5">
              <Star className="h-3 w-3 fill-current" />
              Watching
            </span>
          )}
          <button
            onClick={fetchWatchlist}
            disabled={loading}
            className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground font-mono">
            No stocks in watchlist. Analyze a stock and add it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-muted/20 rounded-md p-3 border border-border/30 group hover:border-primary/20 transition-colors"
            >
              <button
                onClick={() => onAnalyze(item.ticker)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">{item.ticker}</span>
                  {item.current_price && (
                    <span className="font-mono text-xs text-primary">
                      ₹{Number(item.current_price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {item.company_name && (
                  <p className="text-[10px] text-muted-foreground truncate">{item.company_name}</p>
                )}
              </button>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAnalyze(item.ticker)}
                  className="p-1 rounded hover:bg-primary/10 text-primary transition-colors"
                  title="Analyze"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeFromWatchlist(item.id, item.ticker)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
