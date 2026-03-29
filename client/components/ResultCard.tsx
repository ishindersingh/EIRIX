import { PredictResult } from "../services/burnoutLogic";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ShieldX, RefreshCw } from "lucide-react";

interface Props {
  result: PredictResult;
  onReset: () => void;
  onViewInsights: () => void;
}

const levelConfig = {
  low:      { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", bar: "bg-emerald-500", icon: ShieldCheck,  ring: "stroke-emerald-500", label: "Low Risk",      emoji: "🟢" },
  moderate: { color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40",     bar: "bg-amber-500",   icon: ShieldAlert,  ring: "stroke-amber-500",   label: "Moderate Risk", emoji: "🟡" },
  high:     { color: "text-red-600",     bg: "bg-red-50 dark:bg-red-950/40",         bar: "bg-red-500",     icon: ShieldX,      ring: "stroke-red-500",     label: "High Risk",     emoji: "🔴" },
};

export default function ResultCard({ result, onReset, onViewInsights }: Props) {
  const cfg = levelConfig[result.risk_level];
  const Icon = cfg.icon;

  // SVG ring params
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (result.burnout_score / 100) * circ;

  return (
    <div className="space-y-6">
      {/* Score ring */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={r} fill="none"
              strokeWidth="10"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn("transition-all duration-1000", cfg.ring)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{result.burnout_score}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">/ 100</span>
          </div>
        </div>

        <div className={cn("flex items-center gap-2 px-5 py-2 rounded-full font-bold text-lg", cfg.bg, cfg.color)}>
          <Icon className="w-5 h-5" />
          {cfg.emoji} {cfg.label}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI Confidence: <span className="font-bold text-slate-700 dark:text-slate-200">{result.confidence}%</span>
          <span className="ml-2 text-xs">(k-NN on 150,000 student records)</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Burnout Score</span><span>{result.burnout_score}%</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-1000", cfg.bar)}
            style={{ width: `${result.burnout_score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>0 — Healthy</span><span>100 — Critical</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onReset} variant="outline" className="flex-1 h-12 rounded-xl dark:border-slate-600 dark:text-slate-200">
          <RefreshCw className="w-4 h-4 mr-2" /> New Check
        </Button>
        <Button onClick={onViewInsights} className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
          View Insights →
        </Button>
      </div>
    </div>
  );
}
