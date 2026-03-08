import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseWithRecovery(content: string): unknown {
  // Strip markdown code fences
  const cleaned = content.replace(/```json\n?|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    console.warn("Direct JSON parse failed, attempting recovery...");
    // Try to find the last complete JSON object
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace > 0) {
      // Try closing as-is
      const candidate = cleaned.substring(0, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        // Try adding missing closing brackets
        let repaired = candidate;
        const opens = (repaired.match(/\[/g) || []).length;
        const closes = (repaired.match(/\]/g) || []).length;
        for (let i = 0; i < opens - closes; i++) repaired += "]";
        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;
        for (let i = 0; i < openBraces - closeBraces; i++) repaired += "}";
        try {
          console.warn("Recovered truncated JSON");
          return JSON.parse(repaired);
        } catch (e) {
          console.error("JSON recovery failed:", e);
        }
      }
    }
    throw new Error("Cannot parse AI response");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ticker, prediction, news, investment_amount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Summarize inputs to reduce token usage and avoid truncation
    const predSummary = {
      trend: prediction?.current_analysis?.trend,
      confidence: prediction?.current_analysis?.confidence,
      support: prediction?.current_analysis?.support_level,
      resistance: prediction?.current_analysis?.resistance_level,
      risk: prediction?.risk_level,
      forecasts: prediction?.predictions?.map((p: any) => `${p.timeframe}: ${p.direction} ${p.predicted_change_percent}%`),
    };

    const newsSummary = {
      sentiment: news?.overall_sentiment,
      risks: news?.key_risks?.slice(0, 3),
      catalysts: news?.key_catalysts?.slice(0, 3),
      headlines: news?.news_items?.slice(0, 3).map((n: any) => `${n.title} (${n.sentiment})`),
    };

    const systemPrompt = `You are an expert investment advisor. All values in Indian Rupees (₹/INR). Provide concise advice. ALWAYS include a disclaimer that this is AI-generated and not financial advice.

Return JSON with these fields:
- ticker, overall_recommendation (strong_buy/buy/hold/sell/strong_sell), confidence_score (0-100)
- buy_favorability: { score (0-100), label (Highly Favorable/Favorable/Neutral/Unfavorable/Highly Unfavorable), reasoning (1-2 sentences why) }
- investment_strategy: { action, entry_price_range, stop_loss, target_price, timeline, reasoning }
- risk_assessment: { overall_risk (low/medium/high), key_risks (array of 2-3 strings) }
- scenario_analysis: array of 3 objects with { scenario, probability, potential_return }
- detailed_reasoning: 2-3 paragraphs combining prediction + news
- disclaimer: string`;

    const userMessage = `Advise on ${ticker}.
Prediction: ${JSON.stringify(predSummary)}
News: ${JSON.stringify(newsSummary)}
${investment_amount ? `Budget: ₹${investment_amount}` : ""}
Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("AI gateway error:", response.status, body);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    if (!content) {
      throw new Error("Empty response from AI");
    }

    const parsed = parseWithRecovery(content);

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
