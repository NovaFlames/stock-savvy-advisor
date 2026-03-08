import { Loader2, Brain, Newspaper, TrendingUp } from "lucide-react";

interface AnalysisStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "pending" | "running" | "done" | "error";
}

interface WorkflowStatusProps {
  steps: AnalysisStep[];
}

export function WorkflowStatus({ steps }: WorkflowStatusProps) {
  return (
    <div className="glass-card p-4 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-mono text-muted-foreground">WORKFLOW PIPELINE</span>
      </div>
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md flex-1 transition-all ${
              step.status === "running" ? "bg-accent/10 border border-accent/30" :
              step.status === "done" ? "bg-signal-up/10 border border-signal-up/20" :
              step.status === "error" ? "bg-signal-down/10 border border-signal-down/20" :
              "bg-muted/30 border border-border/20"
            }`}>
              {step.status === "running" ? (
                <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" />
              ) : step.status === "done" ? (
                <span className="text-signal-up text-xs">✓</span>
              ) : step.status === "error" ? (
                <span className="text-signal-down text-xs">✗</span>
              ) : (
                <span className="text-muted-foreground text-xs">○</span>
              )}
              <span className={`text-[10px] font-mono ${
                step.status === "running" ? "text-accent" :
                step.status === "done" ? "text-signal-up" :
                "text-muted-foreground"
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <span className="text-muted-foreground/30 text-xs px-1">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function getWorkflowSteps(
  predictStatus: string,
  newsStatus: string,
  advisorStatus: string,
) {
  return [
    {
      id: "predict",
      label: "PREDICTION",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      status: predictStatus as AnalysisStep["status"],
    },
    {
      id: "news",
      label: "NEWS SCAN",
      icon: <Newspaper className="h-3.5 w-3.5" />,
      status: newsStatus as AnalysisStep["status"],
    },
    {
      id: "advisor",
      label: "AI ADVISOR",
      icon: <Brain className="h-3.5 w-3.5" />,
      status: advisorStatus as AnalysisStep["status"],
    },
  ];
}
