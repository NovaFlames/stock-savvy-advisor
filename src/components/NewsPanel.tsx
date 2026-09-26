import { Newspaper, AlertTriangle, Zap, Globe } from "lucide-react";
import type { StockNews } from "@/lib/api/stock";

interface NewsPanelProps {
  news: StockNews;
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const cls = sentiment === "positive" ? "bg-signal-up/10 text-signal-up border-signal-up/20" :
    sentiment === "negative" ? "bg-signal-down/10 text-signal-down border-signal-down/20" :
    "bg-muted text-muted-foreground border-border";
  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${cls}`}>
      {sentiment}
    </span>
  );
}

function ImpactBadge({ level }: { level: string }) {
  const cls = level === "high" ? "bg-signal-down/10 text-signal-down" :
    level === "medium" ? "bg-signal-neutral/10 text-signal-neutral" :
    "bg-muted text-muted-foreground";
  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${cls}`}>
      {level}
    </span>
  );
}

export function NewsPanel({ news }: NewsPanelProps) {
  return (
    <div className="glass-card p-6 animate-fade-in-up glow-accent">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-5 w-5 text-accent" />
        <h2 className="font-semibold font-mono text-sm">NEWS INTELLIGENCE</h2>
        <SentimentBadge sentiment={news.overall_sentiment} />
      </div>

      {/* News Items */}
      <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-1">
        {news.news_items.map((item, i) => (
          <div key={i} className="bg-muted/20 rounded-md p-3 border border-border/30">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-medium leading-tight">{item.title}</h3>
              <div className="flex gap-1 shrink-0">
                <SentimentBadge sentiment={item.sentiment} />
                <ImpactBadge level={item.impact_level} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{item.summary}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono text-muted-foreground">{item.source}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">{item.date}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-secondary-foreground font-mono">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Key Catalysts & Risks */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-3.5 w-3.5 text-signal-up" />
            <span className="text-xs font-mono text-muted-foreground">CATALYSTS</span>
          </div>
          <ul className="space-y-1">
            {news.key_catalysts.map((c, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                <span className="text-signal-up mt-1">▸</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-signal-down" />
            <span className="text-xs font-mono text-muted-foreground">RISKS</span>
          </div>
          <ul className="space-y-1">
            {news.key_risks.map((r, i) => (
              <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                <span className="text-signal-down mt-1">▸</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related Events */}
      {news.related_events.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-mono text-muted-foreground">RELATED EVENTS</span>
          </div>
          <div className="space-y-2">
            {news.related_events.map((ev, i) => (
              <div key={i} className="bg-muted/15 rounded-md p-2 border border-border/20">
                <div className="text-xs font-medium">{ev.event}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{ev.potential_impact}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
