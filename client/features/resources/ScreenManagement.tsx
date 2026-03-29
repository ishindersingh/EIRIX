import { useState, useEffect } from "react";
import { Monitor, Trophy, CheckCircle2, Circle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge { id: number; title: string; desc: string; duration: string; difficulty: string; points: number }

const HABITS = [
  { habit: "No phone for first 30 min after waking",    why: "Sets a calm, intentional tone for the day",          icon: "🌅" },
  { habit: "Phone in another room while studying",       why: "Eliminates the #1 focus killer",                     icon: "📵" },
  { habit: "No screens 1 hour before bed",              why: "Blue light suppresses melatonin by up to 50%",       icon: "🌙" },
  { habit: "Grayscale mode after 8 PM",                 why: "Color is designed to be addictive — remove it",      icon: "⬛" },
  { habit: "Delete social media apps (use browser)",    why: "Adds friction that reduces mindless scrolling by 70%",icon: "🗑️" },
  { habit: "Screen time limit: 2h social media/day",    why: "Studies link >3h/day to increased anxiety",          icon: "⏱️" },
  { habit: "Charge phone outside the bedroom",          why: "Removes the temptation to check it at night",        icon: "🔌" },
];

const difficultyColor: Record<string, string> = {
  Easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  Hard:   "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

function HabitsGuide() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">Small friction = big reduction in screen time. Try adding one habit per week.</p>
      {HABITS.map((h, i) => (
        <div key={i} className="flex items-start gap-3 p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-md transition-shadow">
          <span className="text-2xl shrink-0">{h.icon}</span>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{h.habit}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{h.why}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChallengesTracker() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resources/screen-challenges")
      .then(r => r.json())
      .then(d => setChallenges(d.challenges ?? []))
      .catch(() => setChallenges([
        { id: 1, title: "Phone-Free Morning",  desc: "No phone for the first 30 minutes after waking",  duration: "30 min", difficulty: "Easy",   points: 10  },
        { id: 2, title: "No Social Media",     desc: "Zero social media for the entire day",             duration: "1 day",  difficulty: "Medium", points: 30  },
        { id: 3, title: "Screen Sunset",       desc: "No screens 1 hour before bedtime for 3 days",      duration: "3 days", difficulty: "Medium", points: 40  },
        { id: 4, title: "Study Mode",          desc: "Phone in another room during every study session", duration: "1 week", difficulty: "Hard",   points: 70  },
        { id: 5, title: "Grayscale Day",       desc: "Set your phone to grayscale for 24 hours",         duration: "1 day",  difficulty: "Easy",   points: 15  },
        { id: 6, title: "App Detox",           desc: "Delete one social media app for 7 days",           duration: "7 days", difficulty: "Hard",   points: 100 },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = [...completed].reduce((sum, id) => {
    const c = challenges.find(ch => ch.id === id);
    return sum + (c?.points ?? 0);
  }, 0);

  const toggle = (id: number, type: "accept" | "complete") => {
    if (type === "accept") {
      setAccepted(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    } else {
      setCompleted(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    }
  };

  return (
    <div className="space-y-4">
      {/* Points banner */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-100 dark:border-amber-800">
        <Trophy className="w-8 h-8 text-amber-500" />
        <div>
          <p className="font-extrabold text-amber-700 dark:text-amber-400 text-xl">{totalPoints} pts</p>
          <p className="text-xs text-amber-600 dark:text-amber-500">{completed.size} challenges completed</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {challenges.map(c => (
            <div key={c.id} className={cn("p-4 rounded-2xl border transition-all", completed.has(c.id) ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" : "bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{c.title}</span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", difficultyColor[c.difficulty])}>{c.difficulty}</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1"><Zap className="w-3 h-3" />{c.points}pts</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.desc}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">⏱ {c.duration}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => toggle(c.id, "accept")}
                    className={cn("text-xs font-bold px-3 py-1.5 rounded-xl transition-all", accepted.has(c.id) ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30")}>
                    {accepted.has(c.id) ? "Accepted ✓" : "Accept"}
                  </button>
                  {accepted.has(c.id) && (
                    <button onClick={() => toggle(c.id, "complete")}
                      className={cn("text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1", completed.has(c.id) ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}>
                      {completed.has(c.id) ? <><CheckCircle2 className="w-3 h-3" />Done!</> : <><Circle className="w-3 h-3" />Mark Done</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScreenManagement() {
  const [tab, setTab] = useState<"habits" | "challenges">("habits");
  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {([["habits","📱 Habits"],["challenges","🏆 Challenges"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", tab === id ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400")}>
            {label}
          </button>
        ))}
      </div>
      {tab === "habits"     && <HabitsGuide />}
      {tab === "challenges" && <ChallengesTracker />}
    </div>
  );
}
