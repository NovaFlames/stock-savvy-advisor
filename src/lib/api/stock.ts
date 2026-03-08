import { supabase } from "@/integrations/supabase/client";

export interface StockPrediction {
  ticker: string;
  company_name: string;
  current_price?: number;
  current_analysis: {
    trend: "bullish" | "bearish" | "neutral";
    confidence: number;
    support_level: number;
    resistance_level: number;
  };
  predictions: Array<{
    timeframe: string;
    direction: "up" | "down" | "sideways";
    predicted_change_percent: number;
    confidence: number;
    rationale: string;
  }>;
  technical_indicators: {
    rsi: string;
    macd: string;
    moving_averages: string;
  };
  risk_level: "low" | "medium" | "high";
  summary: string;
}

export interface StockNews {
  ticker: string;
  news_items: Array<{
    title: string;
    summary: string;
    source: string;
    date: string;
    sentiment: "positive" | "negative" | "neutral";
    impact_level: "high" | "medium" | "low";
    category: string;
  }>;
  overall_sentiment: string;
  key_risks: string[];
  key_catalysts: string[];
  related_events: Array<{
    event: string;
    potential_impact: string;
    likelihood: string;
  }>;
}

export interface StockAdvice {
  ticker: string;
  overall_recommendation: string;
  confidence_score: number;
  investment_strategy: {
    action: string;
    entry_strategy: {
      timing: string;
      price_range: string;
      allocation_percent: number;
      reasoning: string;
    };
    exit_strategy: {
      target_price: string;
      stop_loss: string;
      timeline: string;
      reasoning: string;
    };
    position_sizing: {
      recommended_shares: string;
      dollar_amount: string;
      portfolio_allocation: string;
    };
  };
  risk_assessment: {
    overall_risk: string;
    key_risks: string[];
    risk_mitigation: string[];
  };
  scenario_analysis: Array<{
    scenario: string;
    probability: number;
    outcome: string;
    potential_return: string;
  }>;
  detailed_reasoning: string;
  disclaimer: string;
}

export async function predictStock(ticker: string, timeframe?: string): Promise<StockPrediction> {
  const { data, error } = await supabase.functions.invoke("stock-predict", {
    body: { ticker: ticker.toUpperCase(), timeframe },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data.data;
}

export async function searchStockNews(ticker: string, company_name?: string): Promise<StockNews> {
  const { data, error } = await supabase.functions.invoke("stock-news", {
    body: { ticker: ticker.toUpperCase(), company_name },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data.data;
}

export async function getStockAdvice(
  ticker: string,
  prediction: StockPrediction,
  news: StockNews,
  investment_amount?: number
): Promise<StockAdvice> {
  const { data, error } = await supabase.functions.invoke("stock-advisor", {
    body: { ticker: ticker.toUpperCase(), prediction, news, investment_amount },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data.data;
}
