import { useEffect, useState } from "react";
import {
  BrainCircuit, TrendingUp, TrendingDown, Minus,
  BookOpen, AlertTriangle, CheckCircle2, Info,
  RefreshCw, Users, ChevronDown
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
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

interface AssignedStudent {
  rollNo:  string;
  name:    string;
  course:  string;
  year:    string;
}

// ── Risk config ────────────────────────────────────────────────────────────────
const RISK = {
  high:     { label: "High Risk",     bg: "bg-red-50 dark:bg-red-950/30",         border: "border-red-200 dark:border-red-800",         text: "text-red-600 dark:text-red-400",         bar: "bg-red-500",     ring: "stroke-red-500"     },
  moderate: { label: "Moderate Risk", bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800",     text: "text-amber-600 dark:text-amber-400",     bar: "bg-amber-500",   ring: "stroke-amber-500"   },
  low:      { label: "Low Risk",      bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", ring: "stroke-emerald-500" },
};

// ── Academic recommendations (mentor-level, professional) ─────────────────────
function getRecommendations(entry: BurnoutEntry): { action: string; rationale: string; priority: "urgent" | "moderate" | "routine" }[] {
  const { score, level, input } = entry;
  const recs = [];

  if (level === "high") {
    recs.push({ action: "Schedule an immediate 1-on-1 counseling session", rationale: "Burnout score above 70 indicates academic crisis risk. Early intervention prevents dropout.", priority: "urgent" as const });
    recs.push({ action: "Coordinate with the student welfare office", rationale: "Formal support structures are needed at this risk level.", priority: "urgent" as const });
  }
  if (input.sleep_hours < 6)
    recs.push({ action: `Address sleep deficit (currently ${input.sleep_hours}h) in next session`, rationale: "Sleep below 6h impairs cognitive function and academic retention by up to 40%.", priority: "urgent" as const });
  if (input.study_hours > 9)
    recs.push({ action: "Review and restructure the student's study schedule", rationale: `${input.study_hours}h of daily study without adequate breaks leads to diminishing returns and burnout.`, priority: "moderate" as const });
  if (input.stress_level >= 7)
    recs.push({ action: "Introduce structured stress management techniques", rationale: "Stress at 7+/10 activates cortisol responses that impair memory consolidation and exam performance.", priority: "moderate" as const });
  if (input.motivation_level <= 4)
    recs.push({ action: "Conduct a motivational interview to identify academic blockers", rationale: "Low motivation is a leading predictor of course withdrawal and poor GPA outcomes.", priority: "moderate" as const });
  if (input.assignment_load >= 7)
    recs.push({ action: "Review assignment deadlines and consider phased submission", rationale: "High assignment load without prioritization leads to surface-level learning and increased anxiety.", priority: "moderate" as const });
  if (input.social_activity <= 3)
    recs.push({ action: "Encourage participation in study groups or peer learning", rationale: "Social isolation correlates with a 2x increase in academic burnout risk.", priority: "routine" as const });
  if (level === "low")
    recs.push({ action: "Maintain current academic routine and schedule monthly check-ins", rationale: `Score of ${score}% reflects healthy academic balance. Preventive monitoring is sufficient.`, priority: "routine" as const });

  return recs.slice(0, 5);
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, level }: { score: number; level: "low" | "moderate" | "high" }) {
  const r = 48; const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke="#e2e8f0" strokeWidth="9" className="dark:stroke-slate-700" />
        <circle cx="54" cy="54" r={r} fill="none" strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round" className={cn("transition-all duration-1000", RISK[level].ring)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{score}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

// ── Priority badge ─────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  urgent:   { cls: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",         label: "Urgent"   },
  moderate: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", label: "Moderate" },
  routine:  { cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",    label: "Routine"  },
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MentorDashboard() {
  const { darkMode } = useTheme();
  const [history,         setHistory]         = useState<BurnoutEntry[]>([]);
  const [latest,          setLatest]          = useState<BurnoutEntry | null>(null);
  const [assignedStudents,setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [selectedRollNo,  setSelectedRollNo]  = useState<string>("");
  const [mentorName,      setMentorName]      = useState("Mentor");

  const load = (rollNo?: string) => {
    try {
      const mentorUser = JSON.parse(localStorage.getItem("user") ?? "{}");
      setMentorName(mentorUser.name ?? "Mentor");

      const students: AssignedStudent[] = mentorUser.assignedStudents ?? [];
      setAssignedStudents(students);

      // Pick which student to view
      const targetRollNo = rollNo ?? selectedRollNo ?? students[0]?.rollNo ?? "";
      if (targetRollNo) setSelectedRollNo(targetRollNo);

      // Load that student's burnout history
      const key     = `burnout_history_${targetRollNo}`;
      let stored    = JSON.parse(localStorage.getItem(key) || "[]") as BurnoutEntry[];
      if (!stored.length) stored = JSON.parse(localStorage.getItem("burnout_history") || "[]") as BurnoutEntry[];

      setHistory(stored);
      setLatest(stored[stored.length - 1] ?? null);
    } catch {
      setHistory([]); setLatest(null);
    }
  };

  useEffect(() => { load(); }, []);

  const selectedStudent = assignedStudents.find(s => s.rollNo === selectedRollNo);
  const chartData = history.slice(-7).map((h, i) => ({
    day:   ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i] ?? `D${i+1}`,
    score: h.score,
  }));
  const trend = history.length >= 2
    ? history[history.length - 1].score - history[history.length - 2].score
    : 0;

  const tickColor = darkMode ? "#94a3b8" : "#64748b";
  const gridColor = darkMode ? "#1e293b" : "#e2e8f0";

  // ── No data ──────────────────────────────────────────────────────────────────
  if (!latest) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">No Assessment Data</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
          {selectedStudent
            ? <><span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedStudent.name}</span> hasn't submitted a burnout assessment yet.</>
            : "No students assigned or no assessments submitted yet."
          }
        </p>
        <button onClick={() => load()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
    );
  }

  const cfg  = RISK[latest.level];
  const recs = getRecommendations(latest);

  return (
    <div className="space-y-6">

      {/* Student selector */}
      {assignedStudents.length > 1 && (
        <div className="flex items-center gap-3 p-4 glass rounded-2xl border border-white/20 dark:border-white/10">
          <Users className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Viewing:</span>
          <div className="relative flex-1 max-w-xs">
            <select
              value={selectedRollNo}
              onChange={e => load(e.target.value)}
              className="w-full appearance-none bg-white/60 dark:bg-white/10 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer pr-8"
            >
              {assignedStudents.map(s => (
                <option key={s.rollNo} value={s.rollNo}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Top row: score + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Score card */}
        <div className={cn("glass rounded-3xl border p-6 flex flex-col items-center gap-3 shadow-xl", cfg.border)}>
          <ScoreRing score={latest.score} level={latest.level} />
          <div className={cn("px-4 py-1.5 rounded-full font-bold text-sm", cfg.bg, cfg.text)}>{cfg.label}</div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Confidence: <span className="font-bold text-slate-600 dark:text-slate-300">{latest.confidence}%</span></p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">{latest.time}</p>

          {/* Trend */}
          <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold w-full justify-center",
            trend > 5  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" :
            trend < -5 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" :
            "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
            {trend > 5  ? <TrendingUp className="w-3.5 h-3.5" /> :
             trend < -5 ? <TrendingDown className="w-3.5 h-3.5" /> :
             <Minus className="w-3.5 h-3.5" />}
            {trend > 0 ? `+${trend}` : trend} pts since last check
          </div>
        </div>

        {/* Academic metrics */}
        <div className="lg:col-span-2 glass rounded-3xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
            <Info className="w-4 h-4 text-emerald-500" /> Academic Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Study Hours",    value: `${latest.input.study_hours}h`,        warn: latest.input.study_hours > 9,   color: "indigo"  },
              { label: "Sleep Hours",    value: `${latest.input.sleep_hours}h`,        warn: latest.input.sleep_hours < 6,   color: "blue"    },
              { label: "Stress Level",   value: `${latest.input.stress_level}/10`,     warn: latest.input.stress_level >= 7, color: "amber"   },
              { label: "Assignment Load",value: `${latest.input.assignment_load}/10`,  warn: latest.input.assignment_load >= 7, color: "red"  },
              { label: "Motivation",     value: `${latest.input.motivation_level}/10`, warn: latest.input.motivation_level <= 4, color: "purple"},
              { label: "Screen Time",    value: `${latest.input.screen_time}h`,        warn: latest.input.screen_time >= 6,  color: "slate"   },
              { label: "Social Activity",value: `${latest.input.social_activity}/10`,  warn: latest.input.social_activity <= 3, color: "pink" },
              { label: "Mood",           value: latest.input.mood,                     warn: ["Low","Very Low"].includes(latest.input.mood), color: "emerald" },
            ].map(({ label, value, warn, color }) => (
              <div key={label} className={cn("p-3 rounded-xl text-center border", warn ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" : `bg-${color}-50 dark:bg-${color}-950/20 border-${color}-100 dark:border-${color}-800`)}>
                <p className={cn("text-sm font-extrabold", warn ? "text-red-600 dark:text-red-400" : `text-${color}-700 dark:text-${color}-300`)}>{value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Score bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Burnout Score</span><span>{latest.score}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-1000", cfg.bar)} style={{ width: `${latest.score}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Trend graph */}
      {chartData.length > 1 && (
        <div className="glass rounded-3xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Burnout Trend
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mentorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", backgroundColor: darkMode ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)", color: darkMode ? "#f1f5f9" : "#0f172a" }}
                  formatter={(v: number) => [`${v}`, "Burnout Score"]} />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fill="url(#mentorGrad)" dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold">
            {trend > 5  ? <><TrendingUp className="w-4 h-4 text-red-500" /><span className="text-red-600 dark:text-red-400">Burnout increasing — intervention recommended</span></> :
             trend < -5 ? <><TrendingDown className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">Improving trend — continue current support</span></> :
             <><Minus className="w-4 h-4 text-slate-400" /><span className="text-slate-500 dark:text-slate-400">Score stable — monitor weekly</span></>}
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div className={cn("glass rounded-3xl border p-5 shadow-xl", cfg.border, cfg.bg)}>
        <div className="flex items-start gap-3">
          <BrainCircuit className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">AI Academic Insight</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{latest.insight}"</p>
          </div>
        </div>
      </div>

      {/* Mentor Recommendations */}
      <div className="glass rounded-3xl border border-white/20 dark:border-white/10 p-6 shadow-xl">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mentor Action Plan
        </h3>
        <div className="space-y-3">
          {recs.map((r, i) => {
            const pcfg = PRIORITY_CFG[r.priority];
            return (
              <div key={i} className="flex items-start gap-3 p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{r.action}</p>
                    <span className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide", pcfg.cls)}>{pcfg.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.rationale}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <button onClick={() => load()} className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
          <RefreshCw className="w-4 h-4" /> Refresh data
        </button>
      </div>
    </div>
  );
}
