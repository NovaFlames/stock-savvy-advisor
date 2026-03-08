import { useState, useCallback } from "react";
import { toast } from "sonner";
import { StockSearch } from "@/components/StockSearch";
import { PredictionPanel } from "@/components/PredictionPanel";
import { NewsPanel } from "@/components/NewsPanel";
import { AdvisorPanel } from "@/components/AdvisorPanel";
import { WorkflowStatus, getWorkflowSteps } from "@/components/WorkflowStatus";
import { predictStock, searchStockNews, getStockAdvice } from "@/lib/api/stock";
import type { StockPrediction, StockNews, StockAdvice } from "@/lib/api/stock";
import { Activity } from "lucide-react";

type StepStatus = "pending" | "running" | "done" | "error";

const Index = () => {
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [news, setNews] = useState<StockNews | null>(null);
  const [advice, setAdvice] = useState<StockAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictStatus, setPredictStatus] = useState<StepStatus>("pending");
  const [newsStatus, setNewsStatus] = useState<StepStatus>("pending");
  const [advisorStatus, setAdvisorStatus] = useState<StepStatus>("pending");

  const handleSearch = useCallback(async (ticker: string, amount?: number) => {
    setIsLoading(true);
    setPrediction(null);
    setNews(null);
    setAdvice(null);
    setPredictStatus("running");
    setNewsStatus("pending");
    setAdvisorStatus("pending");

    try {
      // Step 1 & 2: Run prediction and news in parallel
      setNewsStatus("running");
      const [predResult, newsResult] = await Promise.all([
        predictStock(ticker).then((r) => { setPredictStatus("done"); return r; }).catch((e) => { setPredictStatus("error"); throw e; }),
        searchStockNews(ticker).then((r) => { setNewsStatus("done"); return r; }).catch((e) => { setNewsStatus("error"); throw e; }),
      ]);

      setPrediction(predResult);
      setNews(newsResult);

      // Step 3: Advisor agent synthesizes both
      setAdvisorStatus("running");
      const adviceResult = await getStockAdvice(ticker, predResult, newsResult, amount);
      setAdvisorStatus("done");
      setAdvice(adviceResult);

      toast.success(`Analysis complete for ${ticker}`);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showWorkflow = predictStatus !== "pending" || newsStatus !== "pending" || advisorStatus !== "pending";
  const steps = getWorkflowSteps(predictStatus, newsStatus, advisorStatus);

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-mono tracking-tight">
              STOCK<span className="text-primary">ORACLE</span>
            </h1>
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">v1.0</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Prediction + News */}
            <div className="space-y-6">
              {prediction && <PredictionPanel prediction={prediction} />}
              {news && <NewsPanel news={news} />}
            </div>

            {/* Right column: Advisor */}
            <div>
              {advice && <AdvisorPanel advice={advice} />}
            </div>
          </div>
        )}

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
    </div>
  );
};

export default Index;
