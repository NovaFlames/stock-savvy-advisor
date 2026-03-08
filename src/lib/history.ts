import type { StockPrediction, StockNews, StockAdvice } from "@/lib/api/stock";

export interface AnalysisRecord {
  id: string;
  ticker: string;
  company_name: string;
  timestamp: number;
  prediction: StockPrediction;
  news: StockNews;
  advice: Record<string, any>;
}

const STORAGE_KEY = "stockoracle_history";
const MAX_HISTORY = 20;

export function getHistory(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAnalysis(
  prediction: StockPrediction,
  news: StockNews,
  advice: Record<string, any>
): AnalysisRecord {
  const record: AnalysisRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ticker: prediction.ticker,
    company_name: prediction.company_name,
    timestamp: Date.now(),
    prediction,
    news,
    advice,
  };
  const history = [record, ...getHistory()].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return record;
}

export function deleteAnalysis(id: string): void {
  const history = getHistory().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
