import { useEffect, useState } from "react";
import {
  BrainCircuit, ShieldAlert, ShieldCheck, ShieldX,
  TrendingUp, TrendingDown, Minus, RefreshCw,
  Moon, BookOpen, Monitor, AlertTriangle, Heart, Info
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useTheme } from "../../context/ThemeContext";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BurnoutEntry {
  score:      number;
  level:      "low" | "moderate" | "high";
  confidence: number;
  insight:    string;
  time:       string;
  input: {
    sleep_hours:      number;
    study_hours:      number;
    stress_level:     number;
    screen_time:      number;
    social_activity:  number;
    motivation_level: number;
    assignment_load:  number;
    mood:             string;
  };
}

// ── Risk config ────────────────────────────────────────────────────────────────
const RISK = {
  high:     { icon: ShieldX,     label: "High Risk",     bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-200 dark:border-red-800",     text: "text-red-600 dark:text-red-400",     bar: "bg-red-500",     ring: "stroke-red-500"     },
  moderate: { icon: ShieldAlert, label: "Moderate Risk", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", ring: "stroke-amber-500" },
  low:      { icon: ShieldCheck, label: "Low Risk",      bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", ring: "stroke-emerald-500" },
};

// ── AI Suggestion generator ────────────────────────────────────────────────────
function getSuggestions(entry: BurnoutEntry): string[] {
  const { score, level, input } = entry;
  const tips: string[] = [];

  if (input.sleep_hours < 6)
    tips.push(`Sleep is critically low at ${input.sleep_hours}h. Encourage your child to sleep before 10:30 PM — even 1 extra hour reduces burnout risk by 20%.`);
  if (input.stress_level >= 7)
    tips.push(`Stress is at ${input.stress_level}/10. Plan a relaxed family activity this weekend to help decompress.`);
  if (input.screen_time >= 6)
    tips.push(`Screen time is ${input.screen_time}h/day. Suggest a phone-free hour after 9 PM to improve sleep quality.`);
  if (input.social_activity <= 3)
    tips.push(`Social activity is very low (${input.social_activity}/10). Isolation worsens burnout — encourage one social outing this week.`);
  if (input.motivation_level <= 4)
    tips.push(`Motivation is low at ${input.motivation_level}/10. A short encouraging conversation can make a significant difference.`);
  if (input.assignment_load >= 7)
    tips.push(`Assignment load is high (${input.assignment_load}/10). Help prioritize tasks and consider requesting an extension if needed.`);
  if (input.mood === "Low" || input.mood === "Very Low")
    tips.push(`Mood is reported as "${input.mood}". Emotional support from family is the strongest protective factor against burnout.`);

  if (level === "high" && tips.length < 3)
    tips.push("Consider contacting the college counselor or student welfare office this week.");
  if (level === "low" && tips.length === 0)
    tips.push("Your child is maintaining a healthy balance. Keep encouraging current habits and check in weekly.");

  return tips.slice(0, 4);
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, level }: { score: number; level: "low" | "moderate" | "high" }) {
  const r    = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const cfg = RISK[level];

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className={cn("transition-all duration-1000", cfg.ring)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

// ── Metric Pill ────────────────────────────────────────────────────────────────
function MetricPill({ icon: Icon, label, value, color, warn }: {
  icon: React.ElementType; label: string; value: string; color: string; warn?: boolean
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold",
      warn
        ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
        : `bg-${color}-50 dark:bg-${color}-950/30 border-${color}-100 dark:border-${color}-800 text-${color}-700 dark:text-${color}-300`
    )}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <span className="font-extrabold">{value}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SimpleParentDashboard() {
  const { darkMode } = useTheme();
  const [history,     setHistory]     = useState<BurnoutEntry[]>([]);
  const [latest,      setLatest]      = useState<BurnoutEntry | null>(null);
  const [studentName, setStudentName] = useState("Your Child");
  const [studentRollNo, setStudentRollNo] = useState("");
  const [inputRollNo, setInputRollNo] = useState("");
  const [searching,   setSearching]   = useState(false);
  const [notFound,    setNotFound]    = useState(false);

  const load = (rollNo?: string) => {
    try {
      const parentUser = JSON.parse(localStorage.getItem("user") ?? "{}");
      const linked = rollNo ?? parentUser.studentRollNo ?? "";
      setStudentRollNo(linked);
      setStudentName(parentUser.studentName ?? linked ?? "Your Child");

      if (!linked) { setHistory([]); setLatest(null); return; }

      // Look up by roll no key first, then generic
      const key    = `burnout_history_${linked}`;
      let stored   = JSON.parse(localStorage.getItem(key) || "[]") as BurnoutEntry[];
      if (!stored.length) stored = JSON.parse(localStorage.getItem("burnout_history") || "[]") as BurnoutEntry[];

      setHistory(stored);
      setLatest(stored[stored.length - 1] ?? null);
      setNotFound(stored.length === 0);
    } catch {
      setHistory([]); setLatest(null);
    }
  };

  const searchByRollNo = () => {
    if (!inputRollNo.trim()) return;
    setSearching(true);
    setNotFound(false);
    // Save linked roll no to parent user
    const parentUser = JSON.parse(localStorage.getItem("user") ?? "{}");
    parentUser.studentRollNo = inputRollNo.trim().toUpperCase();
    localStorage.setItem("user", JSON.stringify(parentUser));
    load(inputRollNo.trim().toUpperCase());
    setSearching(false);
  };

  const handleRefresh = () => load();

  useEffect(() => { load(); }, []);

  // Chart data from history
  const chartData = history.slice(-7).map((h, i) => ({
    day:   ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i] ?? `Day ${i + 1}`,
    score: h.score,
  }));

  const trend = history.length >= 2
    ? history[history.length - 1].score - history[history.length - 2].score
    : 0;

  const tickColor = darkMode ? "#94a3b8" : "#64748b";
  const gridColor = darkMode ? "#1e293b" : "#e2e8f0";

  // ── No data state ────────────────────────────────────────────────────────────
  if (!latest) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
          <BrainCircuit className="w-10 h-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Student Data Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
          <span className="font-bold text-purple-600 dark:text-purple-400">{studentName}</span> hasn't submitted a burnout assessment yet. Once they complete one on the Student Dashboard, their report will appear here automatically.
        </p>
        <button onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Check Again
        </button>
      </div>
    );
  }

  const cfg         = RISK[latest.level];
  const RiskIcon    = cfg.icon;
  const suggestions = getSuggestions(latest);

  return (
    <div className="space-y-6">

      {/* ── Top: Score + Risk + Metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Score ring card */}
        <div className={cn("glass rounded-3xl border p-6 flex flex-col items-center gap-4 shadow-xl", cfg.border)}>
          <ScoreRing score={latest.score} level={latest.level} />
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm", cfg.bg, cfg.text)}>
            <RiskIcon className="w-4 h-4" />
            {cfg.label}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            AI Confidence: <span className="font-bold text-slate-600 dark:text-slate-300">{latest.confidence}%</span>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Last updated: {latest.time}</p>

          {/* Trend */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold w-full justify-center",
            trend > 5  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" :
            trend < -5 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" :
            "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          )}>
            {trend > 5  ? <TrendingUp className="w-3.5 h-3.5" /> :
             trend < -5 ? <TrendingDown className="w-3.5 h-3.5" /> :
             <Minus className="w-3.5 h-3.5" />}
            {trend > 0 ? `+${trend}` : trend} pts since last check
          </div>
        </div>

        {/* Metrics grid */}
        <div className="lg:col-span-2 glass rounded-3xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            Today's Reported Metrics
          </h3>
          <div className="flex flex-wrap gap-2">
            <MetricPill icon={Moon}          label="Sleep"      value={`${latest.input.sleep_hours}h`}        color="blue"    warn={latest.input.sleep_hours < 6} />
            <MetricPill icon={BookOpen}      label="Study"      value={`${latest.input.study_hours}h`}        color="indigo"  />
            <MetricPill icon={AlertTriangle} label="Stress"     value={`${latest.input.stress_level}/10`}     color="amber"   warn={latest.input.stress_level >= 7} />
            <MetricPill icon={Monitor}       label="Screen"     value={`${latest.input.screen_time}h`}        color="slate"   warn={latest.input.screen_time >= 6} />
            <MetricPill icon={Heart}         label="Social"     value={`${latest.input.social_activity}/10`}  color="pink"    warn={latest.input.social_activity <= 3} />
            <MetricPill icon={BrainCircuit}  label="Motivation" value={`${latest.input.motivation_level}/10`} color="purple"  warn={latest.input.motivation_level <= 4} />
          </div>

          {/* Mood */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
            <span className="text-2xl">
              {latest.input.mood === "Excellent" ? "😄" :
               latest.input.mood === "Good"      ? "🙂" :
               latest.input.mood === "Neutral"   ? "😐" :
               latest.input.mood === "Low"       ? "😔" : "😞"}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Reported Mood</p>
              <p className={cn("font-bold text-sm",
                latest.input.mood === "Low" || latest.input.mood === "Very Low"
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-800 dark:text-slate-100"
              )}>{latest.input.mood}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Burnout Score</span><span>{latest.score}%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-1000", cfg.bar)}
                style={{ width: `${latest.score}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span>0 — Healthy</span><span>100 — Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trend Graph ──────────────────────────────────────────────────────── */}
      {chartData.length > 1 && (
        <div className="glass rounded-3xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Burnout Score Trend
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="parentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", backgroundColor: darkMode ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)", color: darkMode ? "#f1f5f9" : "#0f172a" }}
                  formatter={(v: number) => [`${v}`, "Burnout Score"]}
                />
                <Area type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} fill="url(#parentGrad)" dot={{ fill: "#a855f7", r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── AI Insight ───────────────────────────────────────────────────────── */}
      <div className={cn("glass rounded-3xl border p-6 shadow-xl", cfg.border, cfg.bg)}>
        <div className="flex items-start gap-3">
          <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">AI Insight</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{latest.insight}"</p>
          </div>
        </div>
      </div>

      {/* ── AI Suggestions ───────────────────────────────────────────────────── */}
      <div className="glass rounded-3xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-500" />
          AI Suggestions for You
        </h3>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">{i + 1}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <button onClick={handleRefresh}
          className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline">
          <RefreshCw className="w-4 h-4" /> Refresh data
        </button>
      </div>
    </div>
  );
}
