import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, CheckCircle2, Circle, Bell, BellOff,
  AlertTriangle, Clock, Calendar, ChevronDown, Volume2, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { alertDeadline, speak, notify, startDeadlineChecker, stopDeadlineChecker } from "../alerts/voice";

// ── Types ──────────────────────────────────────────────────────────────────────
interface DeadlineItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: "high" | "low";
  completed: boolean;
  status: "upcoming" | "near" | "missed" | "completed";
}

// ── Fallback data (used when API unreachable) ──────────────────────────────────
const FALLBACK: DeadlineItem[] = [
  { id: "1", title: "Advanced Calculus Assignment", subject: "Mathematics",      dueDate: new Date(Date.now() + 1 * 86400000).toISOString(), priority: "high", completed: false, status: "near"     },
  { id: "2", title: "Psychology Research Paper",    subject: "Psychology",       dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), priority: "high", completed: false, status: "upcoming"  },
  { id: "3", title: "Data Structures Project",      subject: "Computer Science", dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), priority: "low",  completed: false, status: "upcoming"  },
  { id: "4", title: "Physics Lab Report",           subject: "Physics",          dueDate: new Date(Date.now() - 1 * 86400000).toISOString(), priority: "high", completed: false, status: "missed"    },
];

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  upcoming:  { label: "Upcoming",  color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",       dot: "bg-blue-500",    border: "border-blue-200 dark:border-blue-800"    },
  near:      { label: "Due Soon",  color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",   dot: "bg-amber-500",   border: "border-amber-200 dark:border-amber-800"  },
  missed:    { label: "Missed",    color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",           dot: "bg-red-500",     border: "border-red-200 dark:border-red-800"      },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-800" },
};

const PRIORITY_CFG = {
  high: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  low:  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDue(iso: string) {
  const d    = new Date(iso);
  const diff = d.getTime() - Date.now();
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor(diff / 3600000);
  if (diff < 0)      return `${Math.abs(days)}d overdue`;
  if (hrs < 24)      return `${hrs}h left`;
  if (days === 1)    return "Tomorrow";
  return `${days} days left`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Add Task Form ──────────────────────────────────────────────────────────────
interface FormProps { onAdd: (d: Omit<DeadlineItem, "id" | "completed" | "status">) => void }

function AddTaskForm({ onAdd }: FormProps) {
  const [open,     setOpen]     = useState(false);
  const [title,    setTitle]    = useState("");
  const [subject,  setSubject]  = useState("");
  const [dueDate,  setDueDate]  = useState("");
  const [priority, setPriority] = useState<"high" | "low">("high");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    onAdd({ title: title.trim(), subject: subject.trim() || "General", dueDate: new Date(dueDate).toISOString(), priority });
    setTitle(""); setSubject(""); setDueDate(""); setPriority("high"); setOpen(false);
  };

  return (
    <div className="glass rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Plus className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100">Add New Task</span>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <form onSubmit={submit} className="px-5 pb-5 space-y-4 border-t border-white/20 dark:border-white/10 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Task Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Submit assignment"
                className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics"
                className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Due Date *</Label>
              <Input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Priority</Label>
              <div className="flex gap-2">
                {(["high", "low"] as const).map(p => (
                  <button key={p} type="button" onClick={() => setPriority(p)}
                    className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border", priority === p
                      ? p === "high" ? "bg-red-500 text-white border-red-500" : "bg-slate-600 text-white border-slate-600"
                      : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300")}>
                    {p === "high" ? "High" : "Low"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </form>
      )}
    </div>
  );
}

// ── Deadline Card ──────────────────────────────────────────────────────────────
interface CardProps {
  item: DeadlineItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAlert:  (item: DeadlineItem) => void;
}

function DeadlineCard({ item, onToggle, onDelete, onAlert }: CardProps) {
  const cfg = STATUS_CFG[item.status];
  const isOverdue = item.status === "missed";

  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-md",
      item.completed ? "opacity-60" : "",
      cfg.border,
      item.status === "missed" ? "bg-red-50/50 dark:bg-red-950/10" :
      item.status === "near"   ? "bg-amber-50/50 dark:bg-amber-950/10" :
      "bg-white/60 dark:bg-white/5"
    )}>
      {/* Complete toggle */}
      <button onClick={() => onToggle(item.id)} className="mt-0.5 shrink-0">
        {item.completed
          ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          : <Circle className={cn("w-6 h-6", isOverdue ? "text-red-400" : "text-slate-300 dark:text-slate-600")} />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className={cn("font-bold text-slate-800 dark:text-slate-100 truncate", item.completed && "line-through text-slate-400 dark:text-slate-500")}>
            {item.title}
          </p>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full shrink-0", PRIORITY_CFG[item.priority])}>
            {item.priority === "high" ? "High Priority" : "Low Priority"}
          </span>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full shrink-0", cfg.color)}>
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.subject}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(item.dueDate)}
          </div>
          <div className={cn("flex items-center gap-1 text-xs font-bold",
            isOverdue ? "text-red-500" : item.status === "near" ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400")}>
            <Clock className="w-3.5 h-3.5" />
            {formatDue(item.dueDate)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!item.completed && (item.status === "near" || item.status === "missed") && (
          <button onClick={() => onAlert(item)}
            className="p-2 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-500 transition-colors" title="Voice alert">
            <Volume2 className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => onDelete(item.id)}
          className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 text-red-400 hover:text-red-600 transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DeadlineFeature() {
  const [items,       setItems]       = useState<DeadlineItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState<"all" | "upcoming" | "near" | "missed" | "completed">("all");
  const [voiceOn,     setVoiceOn]     = useState(true);
  const [sortBy,      setSortBy]      = useState<"date" | "priority">("date");
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/deadlines")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setItems)
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  // ── Voice checker ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!voiceOn) { stopDeadlineChecker(); return; }
    notify("EIRIX", "Deadline reminders are active.");
    startDeadlineChecker(() => itemsRef.current.filter(d => !d.completed), 60 * 60 * 1000);
    return () => stopDeadlineChecker();
  }, [voiceOn]);

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const addItem = async (data: Omit<DeadlineItem, "id" | "completed" | "status">) => {
    try {
      const res = await fetch("/api/deadlines", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const created = await res.json();
      setItems(prev => [...prev, created]);
    if (voiceOn) speak(`New task added: ${data.title}. Due in ${formatDue(data.dueDate)}.`);
    } catch {
      const fake: DeadlineItem = { ...data, id: Date.now().toString(), completed: false, status: "upcoming" };
      setItems(prev => [...prev, fake]);
    }
  };

  const toggleItem = async (id: string) => {
    try {
      const res = await fetch(`/api/deadlines/${id}/toggle`, { method: "PATCH" });
      const updated = await res.json();
      setItems(prev => prev.map(d => d.id === id ? updated : d));
    if (voiceOn && updated.completed) speak(`Great job! ${updated.title} marked as complete.`);
    } catch {
      setItems(prev => prev.map(d => d.id === id ? { ...d, completed: !d.completed, status: !d.completed ? "completed" : "upcoming" } : d));
    }
  };

  const deleteItem = async (id: string) => {
    try { await fetch(`/api/deadlines/${id}`, { method: "DELETE" }); } catch {}
    setItems(prev => prev.filter(d => d.id !== id));
  };

  const manualAlert = (item: DeadlineItem) => {
    alertDeadline(item.title, item.status === "missed" ? "missed" : "near");
  };

  // ── Filter + sort ─────────────────────────────────────────────────────────────
  const filtered = items
    .filter(d => filter === "all" || d.status === filter)
    .sort((a, b) => {
      if (sortBy === "priority") return a.priority === "high" && b.priority !== "high" ? -1 : 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = {
    total:     items.length,
    upcoming:  items.filter(d => d.status === "upcoming").length,
    near:      items.filter(d => d.status === "near").length,
    missed:    items.filter(d => d.status === "missed").length,
    completed: items.filter(d => d.status === "completed" || d.completed).length,
  };

  const FILTERS = [
    { id: "all",       label: "All",       count: stats.total,     color: "indigo"  },
    { id: "upcoming",  label: "Upcoming",  count: stats.upcoming,  color: "blue"    },
    { id: "near",      label: "Due Soon",  count: stats.near,      color: "amber"   },
    { id: "missed",    label: "Missed",    count: stats.missed,    color: "red"     },
    { id: "completed", label: "Completed", count: stats.completed, color: "emerald" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: stats.total,     color: "indigo",  icon: Calendar      },
          { label: "Due Soon",  value: stats.near,      color: "amber",   icon: AlertTriangle },
          { label: "Missed",    value: stats.missed,    color: "red",     icon: Clock         },
          { label: "Completed", value: stats.completed, color: "emerald", icon: CheckCircle2  },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`p-4 rounded-2xl bg-${color}-50 dark:bg-${color}-950/30 border border-${color}-100 dark:border-${color}-800`}>
            <Icon className={`w-5 h-5 text-${color}-500 mb-2`} />
            <p className={`text-2xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Add task */}
      <AddTaskForm onAdd={addItem} />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                filter === f.id ? "bg-indigo-600 text-white shadow-md" : "bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-white/40 dark:border-white/10")}>
              <Filter className="w-3 h-3" />
              {f.label}
              <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-extrabold",
                filter === f.id ? "bg-white/20 text-white" : `bg-${f.color}-100 dark:bg-${f.color}-950/40 text-${f.color}-700 dark:text-${f.color}-400`)}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as "date" | "priority")}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 cursor-pointer">
            <option value="date">Sort: Date</option>
            <option value="priority">Sort: Priority</option>
          </select>

          {/* Voice toggle */}
          <button onClick={() => setVoiceOn(v => !v)}
            className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
              voiceOn ? "bg-indigo-600 text-white border-indigo-600" : "bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-white/40 dark:border-white/10")}>
            {voiceOn ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            {voiceOn ? "Alerts On" : "Alerts Off"}
          </button>

          {/* Test voice */}
          {voiceOn && (
            <button onClick={() => speak("Voice alerts are working correctly.")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all">
              <Volume2 className="w-4 h-4 text-emerald-500" />
              Test Voice
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No tasks in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <DeadlineCard key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} onAlert={manualAlert} />
          ))}
        </div>
      )}

      {/* Voice info */}
      {voiceOn && (
        <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <Bell className="w-4 h-4 text-indigo-500 shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
            Voice alerts active — you'll hear reminders for tasks due within 48 hours and missed deadlines. Click the speaker icon on any task for an instant alert.
          </p>
        </div>
      )}
    </div>
  );
}
