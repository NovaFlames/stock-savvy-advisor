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
import { BarChart3, ChartNoAxesCombined, TrendingDown, TrendingUp } from "lucide-react";
import type { StockPrediction } from "@/lib/api/stock";
import { Button } from "@/components/ui/button";

interface ForecastChartProps {
  prediction: StockPrediction;
}

const TIMEFRAME_ORDER: Record<string, number> = {
  "TODAY": 0,
  "1D": 1,
  "1 DAY": 1,
  "1W": 2,
  "1 WEEK": 2,
  "2W": 3,
  "2 WEEKS": 3,
  "1M": 4,
  "1 MONTH": 4,
  "3M": 5,
  "3 MONTHS": 5,
  "6M": 6,
  "6 MONTHS": 6,
  "1Y": 7,
  "1 YEAR": 7,
};

function sortTimeframes(a: string, b: string) {
  return (TIMEFRAME_ORDER[a.trim().toUpperCase()] ?? 99) - (TIMEFRAME_ORDER[b.trim().toUpperCase()] ?? 99);
}

export function ForecastChart({ prediction }: ForecastChartProps) {
  const [view, setView] = useState<"area" | "bar">("area");
  const [metric, setMetric] = useState<"price" | "change">(
    prediction.current_price ? "price" : "change",
  );
  const currentPrice = prediction.current_price;

  const forecastData = [...prediction.predictions]
    .sort((a, b) => sortTimeframes(a.timeframe, b.timeframe))
    .map((p) => ({
      timeframe: p.timeframe,
      change: p.predicted_change_percent,
      price: currentPrice
        ? currentPrice * (1 + p.predicted_change_percent / 100)
        : null,
      confidence: p.confidence,
      direction: p.direction,
    }));

  const data = currentPrice
    ? [
        {
          timeframe: "Today",
          change: 0,
          price: currentPrice,
          confidence: prediction.current_analysis.confidence,
          direction: prediction.current_analysis.trend === "bearish" ? "down" : prediction.current_analysis.trend === "bullish" ? "up" : "sideways",
        },
        ...forecastData,
      ]
    : forecastData;

  const dataKey = metric === "price" ? "price" : "change";
  const finalForecast = forecastData[forecastData.length - 1];
  const isPositive = (finalForecast?.change ?? 0) >= 0;
  const trendLabel = isPositive ? "Bullish outlook" : "Bearish outlook";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const projectedPrices = forecastData
    .map((item) => item.price)
    .filter((price): price is number => typeof price === "number");
  const projectedLow = projectedPrices.length ? Math.min(...projectedPrices) : null;
  const projectedHigh = projectedPrices.length ? Math.max(...projectedPrices) : null;

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.change)), 2);
  const changeDomain = [Math.floor(-(maxAbs * 1.3)), Math.ceil(maxAbs * 1.3)];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="glass-card px-3 py-2 text-xs space-y-1">
        <div className="font-mono font-semibold">{label}</div>
        {typeof d.price === "number" && (
          <div className="font-mono font-semibold text-foreground">
            ₹{d.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
        )}
        <div className={d.change >= 0 ? "signal-up" : "signal-down"}>
          {d.change >= 0 ? "+" : ""}{d.change}% expected
        </div>
        <div className="text-muted-foreground">
          Confidence: {d.confidence}%
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-border/50 pt-4 animate-fade-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-4 w-4 text-accent" />
            <h3 className="text-xs font-mono text-muted-foreground">FUTURE TREND</h3>
          </div>
          <div className={`mt-2 flex items-center gap-2 text-sm font-semibold ${isPositive ? "signal-up" : "signal-down"}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{trendLabel}</span>
            {finalForecast && (
              <span className="font-mono">{finalForecast.change >= 0 ? "+" : ""}{finalForecast.change}%</span>
            )}
          </div>
          {projectedLow !== null && projectedHigh !== null && (
            <p className="mt-1 text-xs text-muted-foreground">
              Projected range ₹{projectedLow.toLocaleString("en-IN", { maximumFractionDigits: 0 })}–₹{projectedHigh.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-md border border-border/70 p-0.5" aria-label="Chart metric">
            {(["price", "change"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={metric === value ? "default" : "ghost"}
                disabled={value === "price" && !currentPrice}
                onClick={() => setMetric(value)}
                className="h-7 px-2 text-[10px] font-mono"
              >
                {value === "price" ? "₹ PRICE" : "% CHANGE"}
              </Button>
            ))}
          </div>
          <div className="flex rounded-md border border-border/70 p-0.5" aria-label="Chart style">
            {(["area", "bar"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={view === value ? "secondary" : "ghost"}
                onClick={() => setView(value)}
                className="h-7 px-2 text-[10px] font-mono"
              >
                {value === "area" ? "LINE" : "BARS"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-60 min-w-0" role="img" aria-label={`${prediction.ticker} future ${metric} trend chart`}>
        <ResponsiveContainer width="100%" height="100%">
          {view === "area" ? (
            <AreaChart data={data} margin={{ top: 8, right: 8, left: metric === "price" ? 10 : -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`forecast-${prediction.ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`hsl(var(--signal-${isPositive ? "up" : "down"}))`} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={`hsl(var(--signal-${isPositive ? "up" : "down"}))`} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="timeframe"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                domain={metric === "change" ? changeDomain : ["auto", "auto"]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                width={metric === "price" ? 68 : 46}
                tickFormatter={(value: number) => metric === "price" ? `₹${Math.round(value).toLocaleString("en-IN")}` : `${value > 0 ? "+" : ""}${Math.round(value * 10) / 10}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={metric === "price" ? currentPrice : 0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.65} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={`hsl(var(--signal-${isPositive ? "up" : "down"}))`}
                strokeWidth={2.5}
                fill={`url(#forecast-${prediction.ticker})`}
                dot={{
                  r: 4,
                  fill: "hsl(var(--card))",
                  stroke: `hsl(var(--signal-${isPositive ? "up" : "down"}))`,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: `hsl(var(--signal-${isPositive ? "up" : "down"}))`,
                  stroke: "hsl(var(--card))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 8, left: metric === "price" ? 10 : -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="timeframe"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                domain={metric === "change" ? changeDomain : ["auto", "auto"]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                width={metric === "price" ? 68 : 46}
                tickFormatter={(value: number) => metric === "price" ? `₹${Math.round(value).toLocaleString("en-IN")}` : `${value > 0 ? "+" : ""}${Math.round(value * 10) / 10}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={metric === "price" ? currentPrice : 0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.65} />
              <Bar
                dataKey={dataKey}
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--signal-up))"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const barPositive = payload.change >= 0;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={4}
                      fill={barPositive ? "hsl(var(--signal-up))" : "hsl(var(--signal-down))"}
                      fillOpacity={0.8}
                    />
                  );
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid mt-3 pt-3 border-t border-border/30" style={{ gridTemplateColumns: `repeat(${forecastData.length || 1}, minmax(0, 1fr))` }}>
        {forecastData.map((d) => (
          <div key={d.timeframe} className="text-center">
            <div className="text-[10px] font-mono text-muted-foreground">{d.timeframe}</div>
            <div className="text-xs font-mono font-medium">{d.confidence}% confidence</div>
          </div>
        ))}
      </div>
    </div>
  );
}
