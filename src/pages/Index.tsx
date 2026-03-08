import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { StockSearch } from "@/components/StockSearch";
import { PredictionPanel } from "@/components/PredictionPanel";
import { NewsPanel } from "@/components/NewsPanel";
import { AdvisorPanel } from "@/components/AdvisorPanel";
import { WorkflowStatus, getWorkflowSteps } from "@/components/WorkflowStatus";
import { HistoryPanel } from "@/components/HistoryPanel";
import { CompareModal } from "@/components/CompareModal";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { predictStock, searchStockNews, getStockAdvice } from "@/lib/api/stock";
import type { StockPrediction, StockNews } from "@/lib/api/stock";
import { saveAnalysis, type AnalysisRecord } from "@/lib/history";
import { useAuth } from "@/hooks/useAuth";
import { Activity, LogIn, LogOut, User } from "lucide-react";

type StepStatus = "pending" | "running" | "done" | "error";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [news, setNews] = useState<StockNews | null>(null);
  const [advice, setAdvice] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictStatus, setPredictStatus] = useState<StepStatus>("pending");
  const [newsStatus, setNewsStatus] = useState<StepStatus>("pending");
  const [advisorStatus, setAdvisorStatus] = useState<StepStatus>("pending");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [compareA, setCompareA] = useState<AnalysisRecord | null>(null);
  const [compareB, setCompareB] = useState<AnalysisRecord | null>(null);

  const handleSearch = useCallback(async (ticker: string, amount?: number) => {
    setIsLoading(true);
    setPrediction(null);
    setNews(null);
    setAdvice(null);
    setPredictStatus("running");
    setNewsStatus("running");
    setAdvisorStatus("pending");

    try {
      const [predResult, newsResult] = await Promise.all([
        predictStock(ticker).then((r) => { setPredictStatus("done"); return r; }).catch((e) => { setPredictStatus("error"); throw e; }),
        searchStockNews(ticker).then((r) => { setNewsStatus("done"); return r; }).catch((e) => { setNewsStatus("error"); throw e; }),
      ]);

      setPrediction(predResult);
      setNews(newsResult);

      setAdvisorStatus("running");
      const adviceResult = await getStockAdvice(ticker, predResult, newsResult, amount);
      setAdvisorStatus("done");
      setAdvice(adviceResult);

      // Save to history
      saveAnalysis(predResult, newsResult, adviceResult);
      setHistoryRefresh((k) => k + 1);

      toast.success(`Analysis complete for ${ticker}`);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoadHistory = useCallback((record: AnalysisRecord) => {
    setPrediction(record.prediction);
    setNews(record.news);
    setAdvice(record.advice);
    setPredictStatus("done");
    setNewsStatus("done");
    setAdvisorStatus("done");
    toast.info(`Loaded ${record.ticker} analysis`);
  }, []);

  const handleCompare = useCallback((a: AnalysisRecord, b: AnalysisRecord) => {
    setCompareA(a);
    setCompareB(b);
  }, []);

  const showWorkflow = predictStatus !== "pending" || newsStatus !== "pending" || advisorStatus !== "pending";
  const steps = getWorkflowSteps(predictStatus, newsStatus, advisorStatus);

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Activity className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold font-mono tracking-tight">
                STOCK<span className="text-primary">ORACLE</span>
              </h1>
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">v1.0</span>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-xs text-muted-foreground font-mono hidden sm:inline truncate max-w-[150px]">
                    {user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono py-1.5 px-2.5 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-mono font-semibold py-1.5 px-3 rounded-md hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered stock analysis with prediction model, news intelligence, and advisory agent
          </p>
        </header>

        {/* Search */}
        <div className="mb-6">
          <StockSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Workflow Status */}
        {showWorkflow && (
          <div className="mb-6">
            <WorkflowStatus steps={steps} />
          </div>
        )}

        {/* Results Grid */}
        {(prediction || news || advice) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
              {prediction && <PredictionPanel prediction={prediction} />}
              {news && <NewsPanel news={news} />}
            </div>
            <div>
              {advice && <AdvisorPanel advice={advice} />}
            </div>
          </div>
        )}

        {/* History Panel */}
        <div className="mb-6">
          <HistoryPanel
            onLoad={handleLoadHistory}
            onCompare={handleCompare}
            refreshKey={historyRefresh}
          />
        </div>

        {/* Empty State */}
        {!prediction && !isLoading && (
          <div className="text-center py-20 animate-fade-in-up">
            <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-sm">
              Enter a stock ticker to begin analysis
            </p>
            <p className="text-muted-foreground/50 text-xs mt-2">
              The AI pipeline will predict trends, scan news, and provide investment advice
            </p>
          </div>
        )}
      </div>

      {/* Compare Modal */}
      {compareA && compareB && (
        <CompareModal a={compareA} b={compareB} onClose={() => { setCompareA(null); setCompareB(null); }} />
      )}
    </div>
  );
};

export default Index;
