import { useState } from "react";
import { UserCircle, LogOut, Shield, Clock, Mail, BookOpen, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

function getStoredUser() {
  try {
    const token = localStorage.getItem("token");
    const raw   = localStorage.getItem("user");
    if (raw) return { ...JSON.parse(raw), token };
    // Parse JWT payload if no user object stored
    if (token && token.includes(".")) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { email: payload.email ?? "student@university.edu", role: payload.role ?? "student", id: payload.id ?? 1, token };
    }
    return null;
  } catch {
    return null;
  }
}

const DEMO_USER = { email: "alex@university.edu", role: "student", id: 1, token: "demo-token" };

export default function LoginStatus() {
  const navigate  = useNavigate();
  const [user]    = useState(getStoredUser() ?? DEMO_USER);
  const [session] = useState(() => {
    const stored = localStorage.getItem("session_start");
    if (!stored) { localStorage.setItem("session_start", Date.now().toString()); return Date.now(); }
    return Number(stored);
  });

  const sessionMins = Math.floor((Date.now() - session) / 60000);
  const sessionStr  = sessionMins < 60
    ? `${sessionMins} min`
    : `${Math.floor(sessionMins / 60)}h ${sessionMins % 60}m`;

  const roleColor: Record<string, string> = {
    student: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
    parent:  "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
    mentor:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("session_start");
    navigate("/");
  };

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
          <UserCircle className="w-10 h-10" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-slate-900 dark:text-white text-lg truncate">
            {user.email?.split("@")[0]?.replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) ?? "Student"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          <span className={cn("inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full capitalize", roleColor[user.role] ?? roleColor.student)}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Mail,     label: "Email",        value: user.email,                                  color: "indigo"  },
          { icon: BookOpen, label: "Role",          value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1), color: "purple"  },
          { icon: Shield,   label: "Auth Status",   value: user.token ? "Authenticated" : "Guest",     color: "emerald" },
          { icon: Clock,    label: "Session Time",  value: sessionStr,                                  color: "amber"   },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950/30 border border-${color}-100 dark:border-${color}-800`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 text-${color}-500`} />
              <span className={`text-xs font-bold text-${color}-600 dark:text-${color}-400 uppercase tracking-wide`}>{label}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Token info */}
      <div className="p-4 bg-white/60 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Session Token</span>
        </div>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
          {user.token ? `${user.token.slice(0, 32)}...` : "No token"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
