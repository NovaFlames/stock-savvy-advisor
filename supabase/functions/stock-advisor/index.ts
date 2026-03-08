import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ticker, prediction, news, investment_amount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert AI investment advisor agent. You synthesize stock predictions and news research to provide actionable investment advice.

All monetary values must be in Indian Rupees (₹/INR).

IMPORTANT DISCLAIMER: You must always remind users that this is AI-generated analysis and not financial advice. They should consult with a licensed financial advisor before making investment decisions.

Given the stock prediction data and news analysis, provide comprehensive advice in this JSON format:
{
  "ticker": "SYMBOL",
  "overall_recommendation": "strong_buy" | "buy" | "hold" | "sell" | "strong_sell",
  "confidence_score": 0-100,
  "investment_strategy": {
    "action": "Description of recommended action",
    "entry_strategy": {
      "timing": "When to buy",
      "price_range": "Ideal entry price range",
      "allocation_percent": number,
      "reasoning": "Why this entry point"
    },
    "exit_strategy": {
      "target_price": "Target sell price",
      "stop_loss": "Stop loss level",
      "timeline": "Expected holding period",
      "reasoning": "Why this exit strategy"
    },
    "position_sizing": {
      "recommended_shares": "Based on investment amount",
      "dollar_amount": "Recommended $ to invest",
      "portfolio_allocation": "Suggested % of portfolio"
    }
  },
  "risk_assessment": {
    "overall_risk": "low" | "medium" | "high" | "very_high",
    "key_risks": ["risk1", "risk2"],
    "risk_mitigation": ["strategy1", "strategy2"]
  },
  "scenario_analysis": [
    {
      "scenario": "Bull case" | "Base case" | "Bear case",
      "probability": number,
      "outcome": "Description",
      "potential_return": "percentage"
    }
  ],
  "detailed_reasoning": "3-5 paragraph detailed analysis combining prediction data with news sentiment",
  "disclaimer": "Standard investment disclaimer"
}`;

    const userMessage = `
Analyze and advise on ${ticker}.

PREDICTION DATA:
${JSON.stringify(prediction, null, 2)}

NEWS ANALYSIS:
${JSON.stringify(news, null, 2)}

${investment_amount ? `INVESTMENT BUDGET: ₹${investment_amount}` : ""}

Synthesize all this information and provide comprehensive investment advice. Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(content.replace(/```json\n?|```/g, "").trim());

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
