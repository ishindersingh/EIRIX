import { BrainCircuit, BookOpen, LayoutDashboard, LogOut, Moon, Sun, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import MentorDashboardFeature from "../features/mentor/MentorDashboard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "../components/LanguageSwitcher";

function MentorSidebar() {
  const { darkMode, setDarkMode } = useTheme();
  const { pathname } = useLocation();

  const NAV = [
    { to: "/mentor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/settings",         icon: Settings,        label: "Settings"  },
  ];

  return (
    <aside className="w-64 glass border-r border-white/20 dark:border-white/10 hidden md:flex flex-col p-6 space-y-6 shrink-0">
      <div className="flex items-center space-x-3">
        <img src="/eirix-logo.png" alt="EIRIX" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
        <span className="text-xl font-bold text-slate-900 dark:text-white">EIRIX</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800">
        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Mentor Portal</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200",
              pathname === to
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-emerald-600"
            )}>
            <Icon className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="font-semibold text-sm">Dark Mode</span>
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            className={cn("w-12 h-6 flex items-center rounded-full p-1 transition-colors", darkMode ? "bg-emerald-600" : "bg-gray-300")}>
            <div className={cn("bg-white w-4 h-4 rounded-full shadow-md transform transition-transform", darkMode ? "translate-x-6" : "")} />
          </button>
        </div>
        <div className="px-2 py-1"><LanguageSwitcher /></div>
        <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}

export default function MentorDashboardPage() {
  const mentorUser = (() => { try { return JSON.parse(localStorage.getItem("user") ?? "{}"); } catch { return {}; } })();

  return (
    <div className="min-h-screen gradient-bg flex dark:text-slate-100">
      <MentorSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {mentorUser.name ? `Welcome, ${mentorUser.name.split(" ")[0]}` : "Mentor Dashboard"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {mentorUser.designation ? `${mentorUser.designation} · ` : ""}{mentorUser.department ?? "Academic performance and burnout monitoring"}
              </p>
            </div>
          </div>
        </header>

        <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-600/5 to-teal-600/5 dark:from-emerald-600/10 dark:to-teal-600/10 pb-4">
            <CardTitle className="text-xl font-bold dark:text-white">Student Burnout Analysis</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Academic performance insights, risk classification and professional intervention recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <MentorDashboardFeature />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
