import { useState, useEffect } from "react";
import { Play, Pause, RefreshCw, Coffee, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudyTip { tip: string; category: string; icon: string }

// ── Pomodoro Timer ─────────────────────────────────────────────────────────────
const MODES = [
  { id: "focus", label: "Focus",      duration: 25 * 60, color: "from-indigo-500 to-purple-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  { id: "short", label: "Short Break",duration: 5  * 60, color: "from-emerald-400 to-teal-500",  bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { id: "long",  label: "Long Break", duration: 15 * 60, color: "from-amber-400 to-orange-500",  bg: "bg-amber-50 dark:bg-amber-950/30" },
] as const;

function PomodoroTimer() {
  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const mode = MODES[modeIdx];

  useEffect(() => {
    setTimeLeft(mode.duration);
    setRunning(false);
  }, [modeIdx, mode.duration]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft === 0) {
      setRunning(false);
      if (mode.id === "focus") setSessions(s => s + 1);
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft, mode.id]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const progress = ((mode.duration - timeLeft) / mode.duration) * 100;
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        {MODES.map((m, i) => (
          <button key={m.id} onClick={() => setModeIdx(i)}
            className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", modeIdx === i ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400")}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
            <circle cx="80" cy="80" r={r} fill="none" strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
              className={cn("transition-all duration-1000", mode.id === "focus" ? "stroke-indigo-500" : mode.id === "short" ? "stroke-emerald-500" : "stroke-amber-500")} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">{mins}:{secs}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{mode.label}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setRunning(r => !r)}
            className={cn("rounded-xl text-white px-6 bg-gradient-to-r", mode.color)}>
            {running ? <><Pause className="w-4 h-4 mr-2" />Pause</> : <><Play className="w-4 h-4 mr-2" />Start</>}
          </Button>
          <Button variant="outline" onClick={() => { setTimeLeft(mode.duration); setRunning(false); }}
            className="rounded-xl dark:border-slate-600 dark:text-slate-200">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Session counter */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("w-4 h-4 rounded-full transition-all", i < sessions % 4 ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700")} />
          ))}
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-medium">{sessions} sessions today</span>
        </div>
      </div>

      {/* Tips */}
      <div className={cn("p-4 rounded-2xl text-sm", mode.bg)}>
        {mode.id === "focus"
          ? <p className="text-slate-700 dark:text-slate-300"><BookOpen className="w-4 h-4 inline mr-2 text-indigo-500" />Put your phone in another room. Close all unrelated tabs. Focus on ONE task.</p>
          : <p className="text-slate-700 dark:text-slate-300"><Coffee className="w-4 h-4 inline mr-2 text-emerald-500" />Step away from your screen. Stretch, hydrate, or take a short walk.</p>
        }
      </div>
    </div>
  );
}

// ── Study Tips ─────────────────────────────────────────────────────────────────
function StudyTips() {
  const [tips, setTips] = useState<StudyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/resources/study-tips")
      .then(r => r.json())
      .then(d => setTips(d.tips ?? []))
      .catch(() => setTips([
        { tip: "Use active recall — close your notes and write everything you remember", category: "Memory",       icon: "🧠" },
        { tip: "Spaced repetition: review at 1 day, 3 days, 1 week, 1 month",           category: "Retention",    icon: "📅" },
        { tip: "Teach the concept to an imaginary student — if you can explain it, you know it", category: "Understanding", icon: "🎓" },
        { tip: "Study in 25-min Pomodoro blocks with 5-min breaks",                    category: "Focus",        icon: "⏱️" },
        { tip: "Study the hardest subject first when your energy is highest",           category: "Productivity", icon: "⚡" },
        { tip: "Use the Feynman Technique: simplify complex topics into plain language",category: "Understanding", icon: "💡" },
        { tip: "Eliminate phone notifications during study blocks",                     category: "Focus",        icon: "📵" },
        { tip: "Review notes within 24 hours of a lecture to retain 80% more",         category: "Retention",    icon: "📖" },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(tips.map(t => t.category)))];
  const filtered = filter === "All" ? tips : tips.filter(t => t.category === filter);

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={cn("px-3 py-1 rounded-full text-xs font-bold transition-all", filter === c ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30")}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-md transition-shadow">
              <span className="text-2xl shrink-0">{t.icon}</span>
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{t.category}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{t.tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function StudyManagement() {
  const [tab, setTab] = useState<"pomodoro" | "tips">("pomodoro");
  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {([["pomodoro","⏱️ Pomodoro"],["tips","📖 Study Tips"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", tab === id ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400")}>
            {label}
          </button>
        ))}
      </div>
      {tab === "pomodoro" && <PomodoroTimer />}
      {tab === "tips"     && <StudyTips />}
    </div>
  );
}
