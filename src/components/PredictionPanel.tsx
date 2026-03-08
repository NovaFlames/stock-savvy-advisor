import { TrendingUp, TrendingDown, Minus, Activity, BarChart3, Target } from "lucide-react";
import type { StockPrediction } from "@/lib/api/stock";

interface PredictionPanelProps {
  prediction: StockPrediction;
}

function TrendIcon({ direction }: { direction: string }) {
  if (direction === "up") return <TrendingUp className="h-4 w-4 text-signal-up" />;
  if (direction === "down") return <TrendingDown className="h-4 w-4 text-signal-down" />;
  return <Minus className="h-4 w-4 text-signal-neutral" />;
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 70 ? "bg-signal-up" : value >= 40 ? "bg-signal-neutral" : "bg-signal-down";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground">{value}%</span>
    </div>
  );
}

export function PredictionPanel({ prediction }: PredictionPanelProps) {
  const trendColor =
    prediction.current_analysis.trend === "bullish" ? "signal-up" :
    prediction.current_analysis.trend === "bearish" ? "signal-down" : "signal-neutral";

  const trendGlow =
    prediction.current_analysis.trend === "bullish" ? "glow-green" :
    prediction.current_analysis.trend === "bearish" ? "glow-red" : "";

  return (
    <div className={`glass-card p-6 animate-fade-in-up ${trendGlow}`}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-accent" />
        <h3 className="font-semibold font-mono text-sm">PREDICTION MODEL</h3>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-mono">{prediction.ticker}</h2>
          <p className="text-sm text-muted-foreground">{prediction.company_name}</p>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold font-mono ${trendColor} capitalize`}>
            {prediction.current_analysis.trend}
          </span>
          <div className="text-xs text-muted-foreground mt-1">
            Confidence: {prediction.current_analysis.confidence}%
          </div>
        </div>
      </div>

      {/* Support/Resistance */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-muted/30 rounded-md p-3">
          <div className="text-xs text-muted-foreground mb-1">Support</div>
          <div className="font-mono font-semibold text-signal-up">₹{prediction.current_analysis.support_level}</div>
        </div>
        <div className="bg-muted/30 rounded-md p-3">
          <div className="text-xs text-muted-foreground mb-1">Resistance</div>
          <div className="font-mono font-semibold text-signal-down">₹{prediction.current_analysis.resistance_level}</div>
        </div>
      </div>

      {/* Predictions */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">FORECASTS</span>
        </div>
        {prediction.predictions.map((p, i) => (
          <div key={i} className="bg-muted/20 rounded-md p-3 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendIcon direction={p.direction} />
                <span className="font-mono text-sm font-medium">{p.timeframe}</span>
              </div>
              <span className={`font-mono text-sm font-bold ${
                p.predicted_change_percent >= 0 ? "signal-up" : "signal-down"
              }`}>
                {p.predicted_change_percent >= 0 ? "+" : ""}{p.predicted_change_percent}%
              </span>
            </div>
            <ConfidenceBar value={p.confidence} />
            <p className="text-xs text-muted-foreground mt-2">{p.rationale}</p>
          </div>
        ))}
      </div>

      {/* Technical Indicators */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">TECHNICAL INDICATORS</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(prediction.technical_indicators).map(([key, val]) => (
            <div key={key} className="bg-muted/20 rounded-md p-2 text-center">
              <div className="text-[10px] font-mono text-muted-foreground uppercase">{key}</div>
              <div className="text-xs font-mono font-medium capitalize">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk */}
      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
        <span className="text-xs text-muted-foreground">Risk:</span>
        <span className={`text-xs font-mono font-semibold capitalize ${
          prediction.risk_level === "low" ? "signal-up" :
          prediction.risk_level === "high" ? "signal-down" : "signal-neutral"
        }`}>{prediction.risk_level}</span>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{prediction.summary}</p>
    </div>
  );
}
