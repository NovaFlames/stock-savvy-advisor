import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ticker, timeframe } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a quantitative stock analysis AI. You analyze stocks using technical analysis, fundamental analysis, and market sentiment patterns.

When given a stock ticker, provide a detailed prediction analysis in the following JSON format:
{
  "ticker": "SYMBOL",
  "company_name": "Full Company Name",
  "current_analysis": {
    "trend": "bullish" | "bearish" | "neutral",
    "confidence": 0-100,
    "support_level": number,
    "resistance_level": number
  },
  "predictions": [
    {
      "timeframe": "1 week" | "1 month" | "3 months",
      "direction": "up" | "down" | "sideways",
      "predicted_change_percent": number,
      "confidence": 0-100,
      "rationale": "brief explanation"
    }
  ],
  "technical_indicators": {
    "rsi": "overbought" | "neutral" | "oversold",
    "macd": "bullish" | "bearish" | "neutral",
    "moving_averages": "above" | "below" | "crossing"
  },
  "risk_level": "low" | "medium" | "high",
  "summary": "2-3 sentence summary of the overall prediction"
}

Be realistic and balanced. Include disclaimers about market uncertainty. Base analysis on known patterns and general market knowledge up to your training data.`;

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
          { role: "user", content: `Analyze and predict the stock trend for ticker: ${ticker}. Timeframe focus: ${timeframe || "all"}. Return ONLY valid JSON, no markdown.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "stock_prediction",
              description: "Return stock prediction analysis",
              parameters: {
                type: "object",
                properties: {
                  ticker: { type: "string" },
                  company_name: { type: "string" },
                  current_analysis: {
                    type: "object",
                    properties: {
                      trend: { type: "string", enum: ["bullish", "bearish", "neutral"] },
                      confidence: { type: "number" },
                      support_level: { type: "number" },
                      resistance_level: { type: "number" },
                    },
                    required: ["trend", "confidence", "support_level", "resistance_level"],
                  },
                  predictions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        timeframe: { type: "string" },
                        direction: { type: "string", enum: ["up", "down", "sideways"] },
                        predicted_change_percent: { type: "number" },
                        confidence: { type: "number" },
                        rationale: { type: "string" },
                      },
                      required: ["timeframe", "direction", "predicted_change_percent", "confidence", "rationale"],
                    },
                  },
                  technical_indicators: {
                    type: "object",
                    properties: {
                      rsi: { type: "string" },
                      macd: { type: "string" },
                      moving_averages: { type: "string" },
                    },
                    required: ["rsi", "macd", "moving_averages"],
                  },
                  risk_level: { type: "string", enum: ["low", "medium", "high"] },
                  summary: { type: "string" },
                },
                required: ["ticker", "company_name", "current_analysis", "predictions", "technical_indicators", "risk_level", "summary"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "stock_prediction" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let prediction;
    if (toolCall?.function?.arguments) {
      prediction = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      prediction = JSON.parse(content.replace(/```json\n?|```/g, "").trim());
    }

    return new Response(JSON.stringify({ success: true, data: prediction }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-predict error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
