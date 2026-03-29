import { useState } from "react";
import { Gamepad2, BookOpen, Monitor, Moon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StressManagement  from "./StressManagement";
import StudyManagement   from "./StudyManagement";
import ScreenManagement  from "./ScreenManagement";
import SleepManagement   from "./SleepManagement";

const SECTIONS = [
  {
    id: "stress",
    icon: Gamepad2,
    label: "Stress Management",
    emoji: "🎮",
    desc: "Mini game & breathing exercises",
    color: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  {
    id: "study",
    icon: BookOpen,
    label: "Study Management",
    emoji: "📖",
    desc: "Pomodoro timer & study tips",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "screen",
    icon: Monitor,
    label: "Screen Time",
    emoji: "📱",
    desc: "Reduce habits & challenges",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  {
    id: "sleep",
    icon: Moon,
    label: "Sleep Management",
    emoji: "😴",
    desc: "Sleep tips & routine builder",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export default function ResourcesPage() {
  const [active, setActive] = useState<SectionId>("stress");
  const current = SECTIONS.find(s => s.id === active)!;

  return (
    <div className="space-y-6">
      {/* Section selector cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all duration-200 hover:shadow-lg",
              active === s.id
                ? `bg-gradient-to-br ${s.color} text-white border-transparent shadow-lg scale-[1.02]`
                : `${s.bg} ${s.border} hover:scale-[1.01]`
            )}
          >
            <span className="text-2xl block mb-2">{s.emoji}</span>
            <p className={cn("font-bold text-sm", active === s.id ? "text-white" : "text-slate-800 dark:text-slate-100")}>{s.label}</p>
            <p className={cn("text-xs mt-0.5", active === s.id ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Active section content */}
      <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className={cn("pb-4", current.bg)}>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", current.color)}>
              <current.icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold dark:text-white">{current.emoji} {current.label}</CardTitle>
              <CardDescription className="dark:text-slate-400">{current.desc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {active === "stress" && <StressManagement />}
          {active === "study"  && <StudyManagement />}
          {active === "screen" && <ScreenManagement />}
          {active === "sleep"  && <SleepManagement />}
        </CardContent>
      </Card>
    </div>
  );
}
