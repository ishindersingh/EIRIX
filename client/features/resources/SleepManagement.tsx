import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Moon, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SleepTip    { tip: string; category: string; icon: string }
interface RoutineStep { time: string; action: string; icon: string }

const categoryColor: Record<string, string> = {
  Consistency: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
  Environment: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  Nutrition:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  Relaxation:  "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  Mental:      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  Routine:     "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400",
};

// ── Sleep Tips ─────────────────────────────────────────────────────────────────
function SleepTips({ tips }: { tips: SleepTip[] }) {
  const [filter, setFilter] = useState("All");

  if (!tips.length) return (
    <div className="text-center py-12 text-slate-400 dark:text-slate-500">
      <Moon className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="font-semibold">Loading sleep tips...</p>
    </div>
  );

  const categories = ["All", ...Array.from(new Set(tips.map(t => t.category)))];
  const filtered   = filter === "All" ? tips : tips.filter(t => t.category === filter);

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold transition-all",
              filter === c
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tips list */}
      <div className="space-y-3">
        {filtered.map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl shrink-0">{t.icon}</span>
            <div>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", categoryColor[t.category] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>
                {t.category}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{t.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Routine Builder ────────────────────────────────────────────────────────────
function RoutineBuilder({ routine }: { routine: RoutineStep[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setChecked(prev => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });

  if (!routine.length) return (
    <div className="text-center py-12 text-slate-400 dark:text-slate-500">
      <Moon className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="font-semibold">Loading routine...</p>
    </div>
  );

  const progress = Math.round((checked.size / routine.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
          <span>Tonight's Routine</span>
          <span className="text-indigo-600 dark:text-indigo-400">{checked.size}/{routine.length} done</span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {routine.map((step, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
              checked.has(i)
                ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                : "bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10 hover:shadow-md"
            )}
          >
            <div className="shrink-0">
              {checked.has(i)
                ? <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                : <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{step.time}</span>
                <span className="text-base">{step.icon}</span>
              </div>
              <p className={cn(
                "text-sm font-medium",
                checked.has(i) ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"
              )}>
                {step.action}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Completion banner */}
      {progress === 100 && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <Star className="w-6 h-6 text-indigo-500 shrink-0" />
          <p className="font-extrabold text-indigo-600 dark:text-indigo-400">
            Perfect routine! Sleep well tonight.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SleepManagement() {
  const [tab,     setTab]     = useState<"tips" | "routine">("tips");
  const [tips,    setTips]    = useState<SleepTip[]>([]);
  const [routine, setRoutine] = useState<RoutineStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resources/sleep")
      .then(r => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(d => {
        setTips(d.tips ?? []);
        setRoutine(d.routine ?? []);
      })
      .catch(() => {
        // Fallback data if server unreachable
        setTips([
          { tip: "Keep the same wake time every day — even weekends",                     category: "Consistency", icon: "⏰" },
          { tip: "Keep your room cool (18-20°C) — body temperature drop triggers sleep", category: "Environment", icon: "🌡️" },
          { tip: "No caffeine after 2 PM — it has a 6-hour half-life in your body",      category: "Nutrition",   icon: "☕" },
          { tip: "Try the 4-7-8 breathing method: inhale 4s, hold 7s, exhale 8s",       category: "Relaxation",  icon: "🫁" },
          { tip: "Dim lights 1 hour before bed — blue light suppresses melatonin",       category: "Environment", icon: "💡" },
          { tip: "Write tomorrow's to-do list before bed to offload mental load",        category: "Mental",      icon: "📝" },
          { tip: "Avoid heavy meals within 3 hours of sleep",                            category: "Nutrition",   icon: "🍽️" },
          { tip: "A consistent pre-sleep routine trains your brain to wind down",        category: "Routine",     icon: "🌙" },
        ]);
        setRoutine([
          { time: "9:00 PM",  action: "Stop studying — switch to light reading or journaling", icon: "📖" },
          { time: "9:30 PM",  action: "Dim all lights, put phone on Do Not Disturb",           icon: "📵" },
          { time: "9:45 PM",  action: "Warm shower or wash face — signals body to cool down",  icon: "🚿" },
          { time: "10:00 PM", action: "Write tomorrow's top 3 tasks in a notebook",            icon: "📝" },
          { time: "10:15 PM", action: "4-7-8 breathing exercise (3 rounds)",                   icon: "🫁" },
          { time: "10:30 PM", action: "Lights out — same time every night",                    icon: "🌙" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {(["tips", "routine"] as const).map(id => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              tab === id
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <Moon className="w-4 h-4" />
            {id === "tips" ? "Sleep Tips" : "Routine Builder"}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {tab === "tips"    && <SleepTips tips={tips} />}
          {tab === "routine" && <RoutineBuilder routine={routine} />}
        </>
      )}
    </div>
  );
}
