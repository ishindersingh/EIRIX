import { useState, useEffect } from "react";
import { Plus, Trash2, Target, ChevronDown, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: "academic" | "health" | "personal";
}

const FALLBACK: Goal[] = [
  { id: "1", title: "Complete assignments on time", target: 10, current: 6,  unit: "tasks",    category: "academic" },
  { id: "2", title: "Sleep 7+ hours daily",         target: 30, current: 18, unit: "days",     category: "health"   },
  { id: "3", title: "Read 1 chapter per day",       target: 20, current: 9,  unit: "chapters", category: "personal" },
];

const CAT_CFG = {
  academic: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400", bar: "bg-indigo-500" },
  health:   { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", bar: "bg-emerald-500" },
  personal: { color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400", bar: "bg-purple-500" },
};

export default function GoalsTracker() {
  const [goals,   setGoals]   = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(false);
  const [title,   setTitle]   = useState("");
  const [target,  setTarget]  = useState(10);
  const [unit,    setUnit]    = useState("tasks");
  const [category,setCategory]= useState<Goal["category"]>("academic");

  useEffect(() => {
    fetch("/api/settings/goals")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setGoals)
      .catch(() => setGoals(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const body = { title: title.trim(), target, unit: unit.trim() || "tasks", category };
    try {
      const res = await fetch("/api/settings/goals", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const created = await res.json();
      setGoals(prev => [...prev, created]);
    } catch {
      setGoals(prev => [...prev, { ...body, id: Date.now().toString(), current: 0 }]);
    }
    setTitle(""); setTarget(10); setUnit("tasks"); setOpen(false);
  };

  const updateProgress = async (id: string, delta: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newCurrent = Math.max(0, Math.min(goal.target, goal.current + delta));
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: newCurrent } : g));
    try {
      await fetch(`/api/settings/goals/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...goal, current: newCurrent }),
      });
    } catch {}
  };

  const remove = async (id: string) => {
    try { await fetch(`/api/settings/goals/${id}`, { method: "DELETE" }); } catch {}
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const overall = goals.length
    ? Math.round(goals.reduce((s, g) => s + (g.current / g.target) * 100, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      {goals.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Overall Progress</span>
            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{overall}%</span>
          </div>
          <div className="h-3 bg-white/60 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${overall}%` }} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{goals.filter(g => g.current >= g.target).length} of {goals.length} goals completed</p>
        </div>
      )}

      {/* Add form */}
      <div className="glass rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden">
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100">Add Goal</span>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <form onSubmit={add} className="px-5 pb-5 pt-4 space-y-3 border-t border-white/20 dark:border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Goal Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Complete 10 assignments"
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Target</Label>
                <Input type="number" min={1} value={target} onChange={e => setTarget(Number(e.target.value))}
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Unit</Label>
                <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="tasks / days / hours"
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Category</Label>
                <div className="flex gap-2">
                  {(["academic","health","personal"] as const).map(c => (
                    <button key={c} type="button" onClick={() => setCategory(c)}
                      className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all capitalize", category === c ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
              <Target className="w-4 h-4 mr-2" /> Add Goal
            </Button>
          </form>
        )}
      </div>

      {/* Goals list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
          <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">No goals yet — add one above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(g => {
            const pct = Math.round((g.current / g.target) * 100);
            const cfg = CAT_CFG[g.category];
            const done = g.current >= g.target;
            return (
              <div key={g.id} className={cn("p-4 rounded-2xl border transition-all", done ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" : "bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10")}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{g.title}</p>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full capitalize", cfg.color)}>{g.category}</span>
                      {done && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Completed!</span>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{g.current} / {g.target} {g.unit}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateProgress(g.id, -1)} disabled={g.current === 0}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-950/40 disabled:opacity-30 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <button onClick={() => updateProgress(g.id, 1)} disabled={done}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 disabled:opacity-30 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => remove(g.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", done ? "bg-emerald-500" : cfg.bar)}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    <span>0</span><span className={done ? "text-emerald-500" : ""}>{pct}%</span><span>{g.target}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
