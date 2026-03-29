import { PredictResult } from "../services/burnoutLogic";
import { CheckCircle2, Info, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  result: PredictResult;
  onNewCheck: () => void;
}

const levelBorder = {
  low:      "border-l-4 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30",
  moderate: "border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30",
  high:     "border-l-4 border-red-500 bg-red-50/60 dark:bg-red-950/30",
};

export default function Insights({ result, onNewCheck }: Props) {
  return (
    <div className="space-y-6">
      {/* AI Insight */}
      <div className={cn("p-5 rounded-2xl", levelBorder[result.risk_level])}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 text-indigo-600 shrink-0" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">AI Insight</p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">"{result.insights}"</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h4 className="font-bold text-slate-800 dark:text-slate-100">Actionable Recommendations</h4>
        </div>
        <ul className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{i + 1}</span>
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk warning for high */}
      {result.risk_level === "high" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            Your burnout score is critically high. Please reach out to a counselor or mentor immediately.
          </p>
        </div>
      )}

      <button
        onClick={onNewCheck}
        className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
      >
        <ChevronRight className="w-4 h-4" /> Run another assessment
      </button>
    </div>
  );
}
