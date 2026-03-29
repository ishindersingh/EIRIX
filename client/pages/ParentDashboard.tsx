import { BrainCircuit, Users, LayoutDashboard, LogOut, Moon, Sun, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import SimpleParentDashboard from "../features/parent/SimpleParentDashboard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "../components/LanguageSwitcher";

const NAV_ITEMS = [
  { to: "/parent/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/settings",         icon: Bell,            label: "Settings"  },
];

function ParentSidebar() {
  const { darkMode, setDarkMode } = useTheme();
  const { pathname } = useLocation();

  return (
    <aside className="w-64 glass border-r border-white/20 dark:border-white/10 hidden md:flex flex-col p-6 space-y-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img src="/eirix-logo.png" alt="EIRIX" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
        <span className="text-xl font-bold text-slate-900 dark:text-white">EIRIX</span>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-800">
        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Parent Portal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200",
                active
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-purple-600"
              )}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="font-semibold text-sm">Dark Mode</span>
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            className={cn("w-12 h-6 flex items-center rounded-full p-1 transition-colors", darkMode ? "bg-purple-600" : "bg-gray-300")}>
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

export default function ParentDashboard() {
  return (
    <div className="min-h-screen gradient-bg flex dark:text-slate-100">
      <ParentSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Parent Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monitor your child's burnout and well-being</p>
            </div>
          </div>
        </header>

        <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600/5 to-pink-600/5 dark:from-purple-600/10 dark:to-pink-600/10 pb-4">
            <CardTitle className="text-xl font-bold dark:text-white">Student Burnout Report</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Real-time burnout score, risk level and AI-generated suggestions based on your child's latest assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <SimpleParentDashboard />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
