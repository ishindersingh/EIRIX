import { useState, useEffect } from "react";
import { Plus, Eye, EyeOff, Copy, Trash2, Lock, CheckCircle2, ChevronDown, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PasswordEntry {
  id: string;
  label: string;
  username: string;
  password: string;
  createdAt: string;
}

const STORAGE_KEY = "eirix_passwords";

function load(): PasswordEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function save(entries: PasswordEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function PasswordManager() {
  const [entries,  setEntries]  = useState<PasswordEntry[]>(load);
  const [open,     setOpen]     = useState(false);
  const [label,    setLabel]    = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible,  setVisible]  = useState<Set<string>>(new Set());
  const [copied,   setCopied]   = useState<string | null>(null);

  useEffect(() => save(entries), [entries]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !password.trim()) return;
    const entry: PasswordEntry = {
      id: Date.now().toString(), label: label.trim(),
      username: username.trim(), password: password.trim(),
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [...prev, entry]);
    setLabel(""); setUsername(""); setPassword(""); setOpen(false);
  };

  const remove = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const toggleVisible = (id: string) =>
    setVisible(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Warning */}
      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
        <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
          Passwords are stored locally in your browser. Do not store highly sensitive passwords here.
        </p>
      </div>

      {/* Add form */}
      <div className="glass rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden">
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100">Add Password</span>
          </div>
          <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <form onSubmit={add} className="px-5 pb-5 pt-4 space-y-3 border-t border-white/20 dark:border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Label *</Label>
                <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. College Portal"
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Username / Email</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="your@email.com"
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Password *</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="bg-white/60 dark:bg-white/10 border-slate-200 dark:border-slate-600 rounded-xl dark:text-slate-100" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold">
              <Lock className="w-4 h-4 mr-2" /> Save Password
            </Button>
          </form>
        )}
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
          <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">No passwords saved yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => (
            <div key={e.id} className="flex items-center gap-4 p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{e.label}</p>
                {e.username && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{e.username}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {visible.has(e.id) ? e.password : "•".repeat(Math.min(e.password.length, 12))}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleVisible(e.id)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                  {visible.has(e.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => copy(e.password, e.id)}
                  className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-400 hover:text-indigo-600 transition-colors">
                  {copied === e.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(e.id)}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
