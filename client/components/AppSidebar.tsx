import { BrainCircuit, LayoutDashboard, Bot, BookOpen, Clock, Settings, LogOut, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_ITEMS = [
  { to: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/eira",              icon: Bot,             label: "EIRA Chatbot" },
  { to: "/resources",         icon: BookOpen,        label: "Resources"    },
  { to: "/deadlines",         icon: Clock,           label: "Deadlines"    },
  { to: "/settings",          icon: Settings,        label: "Settings"     },
];

export default function AppSidebar() {
  const { darkMode, setDarkMode } = useTheme();
  const { pathname } = useLocation();

  return (
    <aside className="w-64 glass border-r border-white/20 dark:border-white/10 hidden md:flex flex-col p-6 space-y-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img src="/eirix-logo.png" alt="EIRIX" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
        <span className="text-xl font-bold text-slate-900 dark:text-white">EIRIX</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200",
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-indigo-600"
              )}
            >
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
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={cn("w-12 h-6 flex items-center rounded-full p-1 transition-colors", darkMode ? "bg-indigo-600" : "bg-gray-300")}
          >
            <div className={cn("bg-white w-4 h-4 rounded-full shadow-md transform transition-transform", darkMode ? "translate-x-6" : "")} />
          </button>
        </div>
        <div className="px-2 py-1">
          <LanguageSwitcher />
        </div>
        <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
