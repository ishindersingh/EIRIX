import { useState, useEffect } from "react";
import { TrendingDown, TrendingUp, Minus, RefreshCw, Clock, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealEntry {
  score:   number;
  level:   "low" | "moderate" | "high";
  insight: string;
  time:    string;
  input: {
    sleep_hours:      number;
    study_hours:      number;
    stress_level:     number;
    screen_time:      number;
    mood:             string;
    motivation_level: number;
  };
}

function scoreColor(score: number) {
  if (score > 70) return "bg-red-500";
  if (score > 45) return "bg-amber-500";
  return "bg-emerald-500";
}

function scoreLabel(score: number) {
  if (score > 70) return { text: "High",     cls: "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400"         };
  if (score > 45) return { text: "Moderate", cls: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400" };
  return           { text: "Low",      cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" };
}

function loadFromStorage(): RealEntry[] {
  try {
    const user    = JSON.parse(localStorage.getItem("user") ?? "{}");
    const rollNo  = user.rollNo;
    // Try roll-no specific key first, then generic
    const key     = rollNo ? `burnout_history_${rollNo}` : "burnout_history";
    const data    = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (data.length) return data;
    return JSON.parse(localStorage.getItem("burnout_history") ?? "[]");
  } catch { return []; }
}

export default function History() {
  const [entries, setEntries] = useState<RealEntry[]>([]);

  const load = () => setEntries(loadFromStorage());

  // Load on mount + listen for storage changes (real-time across tabs)
  useEffect(() => {
    load();
    const onStorage = () => load();
    window.addEventListener("storage", onStorage);
    // Also poll every 3 seconds to catch same-tab updates
    const interval = setInterval(load, 3000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 dark:text-slate-500">
        <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-semibold">No assessments yet</p>
        <p className="text-sm mt-1">Complete a burnout check on the Dashboard tab to see your history here.</p>
      </div>
    );
  }

  const scores  = entries.map(e => e.score);
  const avg     = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const max     = Math.max(...scores);
  const min     = Math.min(...scores);
  const trend   = entries.length >= 2 ? entries[entries.length - 1].score - entries[entries.length - 2].score : 0;
  const latest  = entries[entries.length - 1];

  return (
    <div className="space-y-6">

      {/* Live badge */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
          Live — updates after every assessment
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg Score", value: avg, icon: Minus,        color: "indigo"  },
          { label: "Highest",   value: max, icon: TrendingUp,   color: "red"     },
          { label: "Lowest",    value: min, icon: TrendingDown, color: "emerald" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-950/30 text-center border border-${color}-100 dark:border-${color}-800`}>
            <Icon className={`w-5 h-5 mx-auto mb-1 text-${color}-500`} />
            <p className={`text-2xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Trend */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold",
        trend > 5  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" :
        trend < -5 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" :
        "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
      )}>
        {trend > 5  ? <TrendingUp className="w-4 h-4" /> :
         trend < -5 ? <TrendingDown className="w-4 h-4" /> :
         <Minus className="w-4 h-4" />}
        {trend > 5  ? `Burnout rising (+${trend} pts since last check)` :
         trend < -5 ? `Burnout improving (${trend} pts since last check)` :
         "Burnout stable since last check"}
      </div>

      {/* Latest insight */}
      {latest?.insight && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Latest AI Insight</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">"{latest.insight}"</p>
        </div>
      )}

      {/* All entries — newest first */}
      <div className="space-y-3">
        {[...entries].reverse().map((entry, i) => {
          const lbl = scoreLabel(entry.score);
          return (
            <div key={i} className="p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-2">
                {/* Bar */}
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700", scoreColor(entry.score))}
                    style={{ width: `${entry.score}%` }} />
                </div>
                <span className="w-8 text-sm font-extrabold text-slate-700 dark:text-slate-200 text-right shrink-0">{entry.score}</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full shrink-0", lbl.cls)}>{lbl.text}</span>
              </div>

              {/* Metrics row */}
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.input && (
                  <>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                      Sleep {entry.input.sleep_hours}h
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                      Stress {entry.input.stress_level}/10
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Screen {entry.input.screen_time}h
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">
                      {entry.input.mood}
                    </span>
                  </>
                )}
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                <Clock className="w-3 h-3" />
                {entry.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button onClick={load}
          className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <button
          onClick={() => {
            const user   = JSON.parse(localStorage.getItem("user") ?? "{}");
            const rollNo = user.rollNo;
            if (rollNo) localStorage.removeItem(`burnout_history_${rollNo}`);
            localStorage.removeItem("burnout_history");
            load();
          }}
          className="text-xs text-red-400 dark:text-red-500 hover:underline font-medium"
        >
          Clear history
        </button>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        {entries.length} assessment{entries.length !== 1 ? "s" : ""} recorded
      </p>
    </div>
  );
}
