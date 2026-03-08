import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ticker, company_name } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a financial news research AI agent. Your job is to search through your knowledge and provide comprehensive news analysis about stocks.

For the given stock, provide news in the following JSON format:
{
  "ticker": "SYMBOL",
  "news_items": [
    {
      "title": "News headline",
      "summary": "2-3 sentence summary",
      "source": "Source name",
      "date": "approximate date",
      "sentiment": "positive" | "negative" | "neutral",
      "impact_level": "high" | "medium" | "low",
      "category": "earnings" | "market" | "regulatory" | "product" | "management" | "macro" | "industry" | "geopolitical"
    }
  ],
  "overall_sentiment": "positive" | "negative" | "mixed" | "neutral",
  "key_risks": ["risk1", "risk2"],
  "key_catalysts": ["catalyst1", "catalyst2"],
  "related_events": [
    {
      "event": "Description of macro/geopolitical event",
      "potential_impact": "How it could affect the stock",
      "likelihood": "high" | "medium" | "low"
    }
  ]
}

Include recent and relevant news. Also consider macro-economic events, geopolitical events, industry trends, and regulatory changes that could affect this stock. Provide 5-8 news items and 2-4 related events.`;

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
          { role: "user", content: `Research all recent news and events for ${ticker} (${company_name || ""}). Include company-specific news AND external events that could impact the stock. Return ONLY valid JSON.` },
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
    console.error("stock-news error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
