import { useState, useEffect } from "react";
import { History, Trash2, Clock, TrendingUp, TrendingDown, Minus, X } from "lucide-react";
import { getHistory, deleteAnalysis, clearHistory, type AnalysisRecord } from "@/lib/history";
import { Button } from "@/components/ui/button";

interface HistoryPanelProps {
  onLoad: (record: AnalysisRecord) => void;
  onCompare: (a: AnalysisRecord, b: AnalysisRecord) => void;
  refreshKey: number;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "bullish") return <TrendingUp className="h-3.5 w-3.5 text-signal-up" />;
  if (trend === "bearish") return <TrendingDown className="h-3.5 w-3.5 text-signal-down" />;
  return <Minus className="h-3.5 w-3.5 text-signal-neutral" />;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const recColors: Record<string, string> = {
  strong_buy: "text-signal-up",
  buy: "text-signal-up",
  hold: "text-signal-neutral",
  sell: "text-signal-down",
  strong_sell: "text-signal-down",
};

export function HistoryPanel({ onLoad, onCompare, refreshKey }: HistoryPanelProps) {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHistory(getHistory());
  }, [refreshKey]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 2) next.add(id);
      return next;
    });
  };

  const handleCompare = () => {
    const ids = Array.from(selected);
    const a = history.find((r) => r.id === ids[0]);
    const b = history.find((r) => r.id === ids[1]);
    if (a && b) onCompare(a, b);
  };

  const handleDelete = (id: string) => {
    deleteAnalysis(id);
    setHistory(getHistory());
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setSelected(new Set());
  };

  if (history.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <History className="h-5 w-5 text-primary" />
          <h2 className="font-semibold font-mono text-sm">ANALYSIS HISTORY</h2>
        </div>
        <p className="text-xs text-muted-foreground text-center py-6">
          No analyses saved yet. Run an analysis to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h2 className="font-semibold font-mono text-sm">ANALYSIS HISTORY</h2>
        <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
          {history.length}
        </span>
        <div className="ml-auto flex gap-2">
          {selected.size === 2 && (
            <Button size="sm" variant="outline" onClick={handleCompare} className="text-xs font-mono h-7">
              Compare
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleClear} className="text-xs text-muted-foreground h-7">
            Clear all
          </Button>
        </div>
      </div>

      {selected.size > 0 && selected.size < 2 && (
        <p className="text-[10px] text-muted-foreground mb-2 font-mono">Select one more to compare</p>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {history.map((record) => {
          const isSelected = selected.has(record.id);
          const rec = record.advice?.overall_recommendation || "hold";
          return (
            <div
              key={record.id}
              className={`flex items-center gap-3 rounded-md p-3 transition-colors cursor-pointer border ${
                isSelected
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/20 border-border/30 hover:bg-muted/40"
              }`}
              onClick={() => toggleSelect(record.id)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <TrendIcon trend={record.prediction.current_analysis.trend} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold">{record.ticker}</span>
                    <span className={`text-[10px] font-mono font-semibold uppercase ${recColors[rec] || "text-muted-foreground"}`}>
                      {rec.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {timeAgo(record.timestamp)}
                    <span className="mx-1">·</span>
                    <span>Conf: {record.advice?.confidence_score || record.prediction.current_analysis.confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs font-mono"
                  onClick={(e) => { e.stopPropagation(); onLoad(record); }}
                >
                  View
                </Button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                  aria-label={`Delete ${record.ticker} analysis`}
                  className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
