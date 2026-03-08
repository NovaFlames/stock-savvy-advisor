import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisRecord } from "@/lib/history";

interface CompareModalProps {
  a: AnalysisRecord;
  b: AnalysisRecord;
  onClose: () => void;
}

function MetricRow({ label, valA, valB, higher = "better" }: { label: string; valA: string | number; valB: string | number; higher?: "better" | "worse" | "neutral" }) {
  const numA = typeof valA === "number" ? valA : parseFloat(String(valA));
  const numB = typeof valB === "number" ? valB : parseFloat(String(valB));
  const aHigher = !isNaN(numA) && !isNaN(numB) && numA > numB;
  const bHigher = !isNaN(numA) && !isNaN(numB) && numB > numA;

  const getColor = (isHigher: boolean) => {
    if (higher === "neutral") return "";
    return isHigher ? (higher === "better" ? "text-signal-up" : "text-signal-down") : "";
  };

  return (
    <div className="grid grid-cols-3 gap-4 py-1.5 border-b border-border/20 last:border-0">
      <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
      <span className={`text-xs font-mono text-right ${getColor(aHigher)}`}>{valA}</span>
      <span className={`text-xs font-mono text-right ${getColor(bHigher)}`}>{valB}</span>
    </div>
  );
}

export function CompareModal({ a, b, onClose }: CompareModalProps) {
  const recA = a.advice?.overall_recommendation || "—";
  const recB = b.advice?.overall_recommendation || "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in-up">
      <div className="glass-card p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold font-mono">COMPARE ANALYSES</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-3 gap-4 mb-4 pb-2 border-b border-border/40">
          <span className="text-[10px] font-mono text-muted-foreground">METRIC</span>
          <span className="text-sm font-mono font-bold text-right">{a.ticker}</span>
          <span className="text-sm font-mono font-bold text-right">{b.ticker}</span>
        </div>

        {/* Comparison metrics */}
        <div className="space-y-0">
          <MetricRow label="RECOMMENDATION" valA={recA.replace("_", " ").toUpperCase()} valB={recB.replace("_", " ").toUpperCase()} higher="neutral" />
          <MetricRow label="CONFIDENCE" valA={`${a.advice?.confidence_score || a.prediction.current_analysis.confidence}%`} valB={`${b.advice?.confidence_score || b.prediction.current_analysis.confidence}%`} />
          <MetricRow label="TREND" valA={a.prediction.current_analysis.trend} valB={b.prediction.current_analysis.trend} higher="neutral" />
          <MetricRow label="SUPPORT" valA={`₹${a.prediction.current_analysis.support_level}`} valB={`₹${b.prediction.current_analysis.support_level}`} higher="neutral" />
          <MetricRow label="RESISTANCE" valA={`₹${a.prediction.current_analysis.resistance_level}`} valB={`₹${b.prediction.current_analysis.resistance_level}`} higher="neutral" />
          <MetricRow label="RISK LEVEL" valA={a.prediction.risk_level} valB={b.prediction.risk_level} higher="neutral" />
          <MetricRow label="NEWS SENTIMENT" valA={a.news.overall_sentiment} valB={b.news.overall_sentiment} higher="neutral" />
          <MetricRow
            label="1W FORECAST"
            valA={`${a.prediction.predictions[0]?.predicted_change_percent ?? "—"}%`}
            valB={`${b.prediction.predictions[0]?.predicted_change_percent ?? "—"}%`}
          />
          <MetricRow
            label="1M FORECAST"
            valA={`${a.prediction.predictions[1]?.predicted_change_percent ?? "—"}%`}
            valB={`${b.prediction.predictions[1]?.predicted_change_percent ?? "—"}%`}
          />
          <MetricRow
            label="3M FORECAST"
            valA={`${a.prediction.predictions[2]?.predicted_change_percent ?? "—"}%`}
            valB={`${b.prediction.predictions[2]?.predicted_change_percent ?? "—"}%`}
          />
          <MetricRow label="RSI" valA={a.prediction.technical_indicators.rsi} valB={b.prediction.technical_indicators.rsi} higher="neutral" />
          <MetricRow label="MACD" valA={a.prediction.technical_indicators.macd} valB={b.prediction.technical_indicators.macd} higher="neutral" />
        </div>

        {/* Key risks side by side */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-mono text-muted-foreground mb-2">{a.ticker} RISKS</div>
            <ul className="space-y-1">
              {a.news.key_risks.slice(0, 3).map((r, i) => (
                <li key={i} className="text-[10px] text-foreground/70">• {r}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground mb-2">{b.ticker} RISKS</div>
            <ul className="space-y-1">
              {b.news.key_risks.slice(0, 3).map((r, i) => (
                <li key={i} className="text-[10px] text-foreground/70">• {r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
