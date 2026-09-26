import { Brain, ShieldCheck, Target, BarChart3, AlertTriangle, ChevronRight } from "lucide-react";

interface AdvisorPanelProps {
  advice: Record<string, any>;
}

function RecommendationBadge({ rec }: { rec: string }) {
  const config: Record<string, { cls: string; label: string }> = {
    strong_buy: { cls: "bg-signal-up/20 text-signal-up border-signal-up/30", label: "STRONG BUY" },
    buy: { cls: "bg-signal-up/10 text-signal-up border-signal-up/20", label: "BUY" },
    hold: { cls: "bg-signal-neutral/10 text-signal-neutral border-signal-neutral/20", label: "HOLD" },
    sell: { cls: "bg-signal-down/10 text-signal-down border-signal-down/20", label: "SELL" },
    strong_sell: { cls: "bg-signal-down/20 text-signal-down border-signal-down/30", label: "STRONG SELL" },
  };
  const c = config[rec] || config.hold;
  return (
    <span className={`text-sm font-mono font-bold px-3 py-1 rounded-md border ${c.cls}`}>
      {c.label}
    </span>
  );
}

export function AdvisorPanel({ advice }: AdvisorPanelProps) {
  const strategy = advice.investment_strategy || {};
  const entry = strategy.entry_strategy || {};
  const exit = strategy.exit_strategy || {};
  const sizing = strategy.position_sizing || {};
  const risk = advice.risk_assessment || {};
  const scenarios = advice.scenario_analysis || [];
  const risks = risk.key_risks || [];
  const mitigations = risk.risk_mitigation || [];

  // Support both flat and nested strategy formats
  const entryTiming = entry.timing || strategy.timing || "—";
  const entryPriceRange = entry.price_range || strategy.entry_price_range || "—";
  const entryAllocation = entry.allocation_percent;
  const entryReasoning = entry.reasoning || strategy.reasoning || "";

  const exitTarget = exit.target_price || strategy.target_price || "—";
  const exitStopLoss = exit.stop_loss || strategy.stop_loss || "—";
  const exitTimeline = exit.timeline || strategy.timeline || "—";
  const exitReasoning = exit.reasoning || "";

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="font-semibold font-mono text-sm">AI ADVISOR AGENT</h2>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold font-mono">{advice.ticker}</h3>
          <div className="text-xs text-muted-foreground mt-1">
            Confidence: {advice.confidence_score}%
          </div>
        </div>
        <RecommendationBadge rec={advice.overall_recommendation} />
      </div>

      {/* Buy Favorability */}
      {advice.buy_favorability && (
        <div className="mb-6 bg-muted/20 rounded-md p-4 border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold">BUY FAVORABILITY</span>
            <span className={`text-sm font-mono font-bold ${
              advice.buy_favorability.score >= 70 ? "text-signal-up" :
              advice.buy_favorability.score >= 40 ? "text-signal-neutral" : "text-signal-down"
            }`}>{advice.buy_favorability.score}/100</span>
          </div>
          <div className="h-2 rounded-full bg-muted mb-2">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                advice.buy_favorability.score >= 70 ? "bg-signal-up" :
                advice.buy_favorability.score >= 40 ? "bg-signal-neutral" : "bg-signal-down"
              }`}
              style={{ width: `${advice.buy_favorability.score}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono font-semibold ${
              advice.buy_favorability.score >= 70 ? "text-signal-up" :
              advice.buy_favorability.score >= 40 ? "text-signal-neutral" : "text-signal-down"
            }`}>{advice.buy_favorability.label}</span>
          </div>
          {advice.buy_favorability.reasoning && (
            <p className="text-xs text-muted-foreground mt-2">{advice.buy_favorability.reasoning}</p>
          )}
        </div>
      )}

      {/* Strategy */}
      <div className="space-y-4 mb-6">
        <div className="bg-muted/20 rounded-md p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-semibold">STRATEGY</span>
          </div>
          <p className="text-sm text-foreground/90 mb-3">{strategy.action || "—"}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Entry */}
            <div className="bg-muted/30 rounded-md p-3">
              <div className="text-[10px] font-mono text-signal-up mb-2">▸ ENTRY</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Timing</span>
                  <span className="font-mono">{entryTiming}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Price Range</span>
                  <span className="font-mono">{entryPriceRange}</span>
                </div>
                {entryAllocation != null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Allocation</span>
                    <span className="font-mono">{entryAllocation}%</span>
                  </div>
                )}
              </div>
              {entryReasoning && <p className="text-[10px] text-muted-foreground mt-2">{entryReasoning}</p>}
            </div>

            {/* Exit */}
            <div className="bg-muted/30 rounded-md p-3">
              <div className="text-[10px] font-mono text-signal-down mb-2">▸ EXIT</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-mono">{exitTarget}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span className="font-mono">{exitStopLoss}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Timeline</span>
                  <span className="font-mono">{exitTimeline}</span>
                </div>
              </div>
              {exitReasoning && <p className="text-[10px] text-muted-foreground mt-2">{exitReasoning}</p>}
            </div>
          </div>

          {/* Position Sizing - only show if data exists */}
          {(sizing.recommended_shares || sizing.dollar_amount || sizing.portfolio_allocation) && (
            <div className="mt-3 bg-muted/30 rounded-md p-3">
              <div className="text-[10px] font-mono text-accent mb-2">▸ POSITION SIZE</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">Shares</div>
                  <div className="text-sm font-mono font-semibold">{sizing.recommended_shares || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Amount</div>
                  <div className="text-sm font-mono font-semibold">{sizing.dollar_amount || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Portfolio %</div>
                  <div className="text-sm font-mono font-semibold">{sizing.portfolio_allocation || "—"}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scenario Analysis */}
        {scenarios.length > 0 && (
          <div className="bg-muted/20 rounded-md p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-accent" />
              <span className="text-xs font-mono font-semibold">SCENARIOS</span>
            </div>
            <div className="space-y-2">
              {scenarios.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-muted/20 rounded-md p-2">
                  <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium">{s.scenario}</span>
                      <span className="text-[10px] text-muted-foreground">{s.probability}% prob</span>
                    </div>
                    {s.outcome && <p className="text-[10px] text-muted-foreground truncate">{s.outcome}</p>}
                  </div>
                  <span className={`text-xs font-mono font-bold shrink-0 ${
                    String(s.potential_return).includes("-") ? "text-signal-down" : "text-signal-up"
                  }`}>{s.potential_return}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {risks.length > 0 && (
          <div className="bg-muted/20 rounded-md p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-signal-neutral" />
              <span className="text-xs font-mono font-semibold">RISK ASSESSMENT</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                risk.overall_risk === "low" ? "bg-signal-up/10 text-signal-up" :
                risk.overall_risk === "high" || risk.overall_risk === "very_high"
                  ? "bg-signal-down/10 text-signal-down" : "bg-signal-neutral/10 text-signal-neutral"
              }`}>{risk.overall_risk}</span>
            </div>
            <div className={mitigations.length > 0 ? "grid grid-cols-2 gap-3" : ""}>
              <div>
                <div className="text-[10px] font-mono text-muted-foreground mb-1">RISKS</div>
                <ul className="space-y-1">
                  {risks.map((r: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-1">
                      <AlertTriangle className="h-3 w-3 text-signal-down mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              {mitigations.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-1">MITIGATION</div>
                  <ul className="space-y-1">
                    {mitigations.map((m: string, i: number) => (
                      <li key={i} className="text-xs flex items-start gap-1">
                        <ShieldCheck className="h-3 w-3 text-signal-up mt-0.5 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Reasoning */}
      {advice.detailed_reasoning && (
        <div className="mb-4">
          <div className="text-xs font-mono text-muted-foreground mb-2">ANALYSIS</div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{advice.detailed_reasoning}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-signal-neutral/5 border border-signal-neutral/20 rounded-md p-3 mt-4">
        <p className="text-[10px] text-signal-neutral leading-relaxed">
          ⚠️ {advice.disclaimer || "This is AI-generated analysis and not financial advice. You should consult with a licensed financial advisor before making any investment decisions."}
        </p>
      </div>
    </div>
  );
}
