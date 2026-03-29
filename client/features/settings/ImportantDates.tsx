import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: "exam" | "event" | "deadline" | "holiday";
  note: string;
}

const FALLBACK: ImportantDate[] = [
  { id: "1", title: "Mid-Semester Exams",     date: new Date(Date.now() + 5  * 86400000).toISOString().split("T")[0], type: "exam",    note: "Covers chapters 1-6"  },
  { id: "2", title: "Science Fair",           date: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0], type: "event",   note: "Submit project by 9 AM"},
  { id: "3", title: "Final Exams",            date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], type: "exam",    note: "All subjects"          },
  { id: "4", title: "College Foundation Day", date: new Date(Date.now() + 20 * 86400000).toISOString().split("T")[0], type: "holiday", note: "No classes"            },
];

const TYPE_CFG = {
  exam:     { color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",         dot: "bg-red-500"     },
  event:    { color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",     dot: "bg-blue-500"    },
  deadline: { color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500"   },
  holiday:  { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500" },
};

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0)  return { label: `${Math.abs(days)}d ago`, cls: "text-slate-400 dark:text-slate-500" };
  if (days === 0) return { label: "Today!",                cls: "text-red-600 dark:text-red-400 font-extrabold" };
  if (days === 1) return { label: "Tomorrow",              cls: "text-amber-600 dark:text-amber-400 font-bold"  };
  return { label: `${days} days`,                          cls: "text-slate-500 dark:text-slate-400" };
}

export default function ImportantDates() {
  const [dates,   setDates]   = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(false);
  const [title,   setTitle]   = useState("");
  const [date,    setDate]    = useState("");
  const [type,    setType]    = useState<ImportantDate["type"]>("exam");
  const [note,    setNote]    = useState("");

  useEffect(() => {
    fetch("/api/settings/dates")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setDates)
      .catch(() => setDates(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const body = { title: title.trim(), date, type, note: note.trim() };
    try {
      const res = await fetch("/api/settings/dates", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const created = await res.json();
      setDates(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
    } catch {
      setDates(prev => [...prev, { ...body, id: Date.now().toString() }].sort((a, b) => a.date.localeCompare(b.date)));
    }
    setTitle(""); setDate(""); setNote(""); setOpen(false);
  };

  const remove = async (id: string) => {
    try { await fetch(`/api/settings/dates/${id}`, { method: "DELETE" }); } catch {}
    setDates(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="glass rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden">
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100">Add Important Date</span>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <form onSubmit={add} className="px-5 pb-5 pt-4 space-y-3 border-t border-white/20 dark:border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Physics Final Exam"
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Date *</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Type</Label>
                <div className="flex gap-2 flex-wrap">
                  {(["exam","event","deadline","holiday"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize", type === t ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Note</Label>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note"
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
              <Calendar className="w-4 h-4 mr-2" /> Add Date
            </Button>
          </form>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
      ) : dates.length === 0 ? (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">No important dates added</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dates.map(d => {
            const cfg = TYPE_CFG[d.type];
            const due = daysUntil(d.date);
            return (
              <div key={d.id} className="flex items-center gap-4 p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-md transition-shadow">
                <div className={cn("w-2.5 h-10 rounded-full shrink-0", cfg.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{d.title}</p>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full capitalize", cfg.color)}>{d.type}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className={cn("text-xs", due.cls)}>{due.label}</span>
                  </div>
                  {d.note && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">{d.note}</p>}
                </div>
                <button onClick={() => remove(d.id)}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
