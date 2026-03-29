import { useData } from "../context/DataContext";
import { HistoryEntry } from "../services/burnoutLogic";
import { TrendingDown, TrendingUp, Minus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function scoreColor(score: number) {
  if (score > 70) return "bg-red-500";
  if (score > 45) return "bg-amber-500";
  return "bg-emerald-500";
}

function scoreLabel(score: number) {
  if (score > 70) return { text: "High", cls: "text-red-600 bg-red-50 dark:bg-red-950/40" };
  if (score > 45) return { text: "Moderate", cls: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" };
  return { text: "Low", cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" };
}

export default function History() {
  const { history, refetchHistory } = useData();

  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0;
  const max = history.length ? Math.max(...history.map(h => h.score)) : 0;
  const min = history.length ? Math.min(...history.map(h => h.score)) : 0;
  const trend = history.length >= 2 ? history[history.length - 1].score - history[0].score : 0;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "7-Day Avg", value: avg, icon: Minus, color: "indigo" },
          { label: "Peak",      value: max, icon: TrendingUp,   color: "red"     },
          { label: "Best Day",  value: min, icon: TrendingDown, color: "emerald" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-950/30 text-center`}>
            <Icon className={`w-5 h-5 mx-auto mb-1 text-${color}-500`} />
            <p className={`text-2xl font-extrabold text-${color}-600`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Trend indicator */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold",
        trend > 5 ? "bg-red-50 dark:bg-red-950/30 text-red-600" :
        trend < -5 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" :
        "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
      )}>
        {trend > 5 ? <TrendingUp className="w-4 h-4" /> : trend < -5 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
        {trend > 5 ? `Burnout rising (+${trend} pts this week)` :
         trend < -5 ? `Burnout improving (${trend} pts this week)` :
         "Burnout stable this week"}
      </div>

      {/* Day-by-day list */}
      <div className="space-y-3">
        {history.map((entry: HistoryEntry, i: number) => {
          const lbl = scoreLabel(entry.score);
          return (
            <div key={i} className="flex items-center gap-4 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10">
              <span className="w-10 text-sm font-bold text-slate-500 dark:text-slate-400">{entry.day}</span>
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", scoreColor(entry.score))}
                  style={{ width: `${entry.score}%` }}
                />
              </div>
              <span className="w-8 text-sm font-bold text-slate-700 dark:text-slate-200 text-right">{entry.score}</span>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", lbl.cls)}>{lbl.text}</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={refetchHistory}
        className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
      >
        <RefreshCw className="w-4 h-4" /> Refresh history
      </button>
    </div>
  );
}
