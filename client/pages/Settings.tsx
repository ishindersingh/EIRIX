import { useState } from "react";
import { Settings, Moon, Lock, Calendar, Target, UserCircle, ChevronDown } from "lucide-react";
import AppSidebar from "../components/AppSidebar";
import DarkModeToggle  from "../features/settings/DarkModeToggle";
import PasswordManager from "../features/settings/PasswordManager";
import ImportantDates  from "../features/settings/ImportantDates";
import GoalsTracker    from "../features/settings/GoalsTracker";
import LoginStatus     from "../features/settings/LoginStatus";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "darkmode",
    icon: Moon,
    label: "Dark Mode",
    desc: "Appearance & theme preferences",
    color: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    component: DarkModeToggle,
  },
  {
    id: "passwords",
    icon: Lock,
    label: "Password Manager",
    desc: "Save and manage important passwords",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    component: PasswordManager,
  },
  {
    id: "dates",
    icon: Calendar,
    label: "Important Dates",
    desc: "Exams, events and key deadlines",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    component: ImportantDates,
  },
  {
    id: "goals",
    icon: Target,
    label: "Goals Tracker",
    desc: "Set and track your personal goals",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    component: GoalsTracker,
  },
  {
    id: "login",
    icon: UserCircle,
    label: "Login Status",
    desc: "Your account info and session details",
    color: "from-purple-500 to-pink-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    component: LoginStatus,
  },
] as const;

function SettingsSection({ section, defaultOpen = false }: { section: typeof SECTIONS[number]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;
  const Component = section.component;

  return (
    <div className="glass rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-lg">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn("w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-md", section.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-800 dark:text-slate-100">{section.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{section.desc}</p>
          </div>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn("px-5 pb-5 border-t border-white/20 dark:border-white/10 pt-5", section.bg)}>
          <Component />
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen gradient-bg flex dark:text-slate-100">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white shadow-lg">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage your preferences, passwords, goals and account</p>
            </div>
          </div>
        </header>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {SECTIONS.map(s => (
            <div key={s.id} className={cn("p-3 rounded-2xl text-center", s.bg)}>
              <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br mx-auto mb-1.5 flex items-center justify-center text-white", s.color)}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((s, i) => (
            <SettingsSection key={s.id} section={s} defaultOpen={i === 0} />
          ))}
        </div>
      </main>
    </div>
  );
}
