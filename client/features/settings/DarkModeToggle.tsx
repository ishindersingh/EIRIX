import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "light", icon: Sun,     label: "Light",  desc: "Clean bright interface"     },
  { id: "dark",  icon: Moon,    label: "Dark",   desc: "Easy on the eyes at night"  },
  { id: "system",icon: Monitor, label: "System", desc: "Follows your OS preference" },
] as const;

export default function DarkModeToggle() {
  const { darkMode, setDarkMode } = useTheme();
  const active = darkMode ? "dark" : "light";

  const handleSelect = (id: string) => {
    if (id === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
    } else {
      setDarkMode(id === "dark");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map(({ id, icon: Icon, label, desc }) => (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
              active === id
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 hover:border-indigo-300 dark:hover:border-indigo-700"
            )}
          >
            <Icon className={cn("w-6 h-6", active === id ? "text-indigo-600" : "text-slate-400 dark:text-slate-500")} />
            <span className={cn("text-sm font-bold", active === id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300")}>{label}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 text-center leading-tight">{desc}</span>
          </button>
        ))}
      </div>

      {/* Quick toggle */}
      <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {darkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Dark Mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{darkMode ? "Currently active" : "Currently inactive"}</p>
          </div>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={cn("w-14 h-7 flex items-center rounded-full p-1 transition-colors", darkMode ? "bg-indigo-600" : "bg-slate-300")}
        >
          <div className={cn("bg-white w-5 h-5 rounded-full shadow-md transform transition-transform", darkMode ? "translate-x-7" : "")} />
        </button>
      </div>
    </div>
  );
}
