import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Bar,
  BarChart,
} from "recharts";
import { useState } from "react";
import { BarChart3 } from "lucide-react";
import type { StockPrediction } from "@/lib/api/stock";

interface ForecastChartProps {
  prediction: StockPrediction;
}

const TIMEFRAME_ORDER: Record<string, number> = {
  "1D": 0, "1W": 1, "2W": 2, "1M": 3, "3M": 4, "6M": 5, "1Y": 6,
};

function sortTimeframes(a: string, b: string) {
  return (TIMEFRAME_ORDER[a] ?? 99) - (TIMEFRAME_ORDER[b] ?? 99);
}

export function ForecastChart({ prediction }: ForecastChartProps) {
  const [view, setView] = useState<"area" | "bar">("area");

  const data = [...prediction.predictions]
    .sort((a, b) => sortTimeframes(a.timeframe, b.timeframe))
    .map((p) => ({
      timeframe: p.timeframe,
      change: p.predicted_change_percent,
      confidence: p.confidence,
      direction: p.direction,
    }));

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.change)), 2);
  const yDomain = [Math.floor(-(maxAbs * 1.3)), Math.ceil(maxAbs * 1.3)];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="glass-card px-3 py-2 text-xs space-y-1">
        <div className="font-mono font-semibold">{label}</div>
        <div className={d.change >= 0 ? "signal-up" : "signal-down"}>
          {d.change >= 0 ? "+" : ""}{d.change}%
        </div>
        <div className="text-muted-foreground">
          Confidence: {d.confidence}%
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          <span className="text-xs font-mono text-muted-foreground">FORECAST CHART</span>
        </div>
        <div className="flex gap-1">
          {(["area", "bar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {view === "area" ? (
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(142, 72%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
              <XAxis
                dataKey="timeframe"
                tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)", fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: "hsl(220, 16%, 18%)" }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)", fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${Math.round(v * 10) / 10}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="hsl(215, 15%, 55%)" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area
                type="monotone"
                dataKey="change"
                stroke="hsl(142, 72%, 50%)"
                strokeWidth={2}
                fill="url(#gradUp)"
                dot={{
                  r: 4,
                  fill: "hsl(220, 18%, 10%)",
                  stroke: "hsl(142, 72%, 50%)",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "hsl(142, 72%, 50%)",
                  stroke: "hsl(220, 18%, 10%)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 18%)" />
              <XAxis
                dataKey="timeframe"
                tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)", fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: "hsl(220, 16%, 18%)" }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)", fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${Math.round(v * 10) / 10}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="hsl(215, 15%, 55%)" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Bar
                dataKey="change"
                radius={[4, 4, 0, 0]}
                fill="hsl(142, 72%, 50%)"
                // Color bars based on positive/negative
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const isPositive = payload.change >= 0;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={4}
                      fill={isPositive ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 55%)"}
                      fillOpacity={0.8}
                    />
                  );
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Confidence row */}
      <div className="flex justify-around mt-3 pt-3 border-t border-border/30">
        {data.map((d) => (
          <div key={d.timeframe} className="text-center">
            <div className="text-[10px] font-mono text-muted-foreground">{d.timeframe}</div>
            <div className="text-xs font-mono font-medium">{d.confidence}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
