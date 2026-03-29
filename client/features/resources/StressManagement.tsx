import { useState, useEffect, useCallback } from "react";
import { Wind, Gamepad2, RefreshCw, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Bubble Pop Mini Game ───────────────────────────────────────────────────────
interface Bubble { id: number; x: number; y: number; size: number; color: string; popped: boolean }

const COLORS = ["bg-indigo-400","bg-purple-400","bg-pink-400","bg-blue-400","bg-emerald-400","bg-amber-400"];

function BubbleGame() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);

  const spawnBubble = useCallback(() => {
    setBubbles(prev => [
      ...prev.filter(b => !b.popped).slice(-14),
      {
        id: Date.now() + Math.random(),
        x: 5 + Math.random() * 85,
        y: 5 + Math.random() * 85,
        size: 40 + Math.random() * 40,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        popped: false,
      }
    ]);
  }, []);

  useEffect(() => {
    if (!running) return;
    const spawn = setInterval(spawnBubble, 700);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setRunning(false); clearInterval(spawn); clearInterval(timer); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(spawn); clearInterval(timer); };
  }, [running, spawnBubble]);

  const pop = (id: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setScore(s => s + 1);
  };

  const reset = () => { setBubbles([]); setScore(0); setTimeLeft(30); setRunning(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Score: <span className="text-indigo-600 dark:text-indigo-400 text-lg">{score}</span></span>
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Time: <span className={cn("text-lg", timeLeft <= 10 ? "text-red-500" : "text-emerald-600")}>{timeLeft}s</span></span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setRunning(r => !r)} disabled={timeLeft === 0}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
            {running ? <><Pause className="w-4 h-4 mr-1" />Pause</> : <><Play className="w-4 h-4 mr-1" />Start</>}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="rounded-xl dark:border-slate-600 dark:text-slate-200">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-64 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800 overflow-hidden select-none">
        {!running && timeLeft === 30 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm">Press Start to pop bubbles! 🫧</p>
          </div>
        )}
        {timeLeft === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">🎉 {score} bubbles!</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Great stress relief session!</p>
          </div>
        )}
        {bubbles.filter(b => !b.popped).map(b => (
          <button
            key={b.id}
            onClick={() => pop(b.id)}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size }}
            className={cn("absolute rounded-full opacity-80 hover:opacity-100 hover:scale-110 active:scale-75 transition-all duration-150 cursor-pointer shadow-lg", b.color)}
          />
        ))}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">Pop bubbles to release stress — it actually works! 🫧</p>
    </div>
  );
}

// ── Box Breathing Exercise ─────────────────────────────────────────────────────
const PHASES = [
  { label: "Inhale",  duration: 4, color: "from-blue-400 to-indigo-500",   instruction: "Breathe in slowly through your nose" },
  { label: "Hold",    duration: 4, color: "from-indigo-500 to-purple-500", instruction: "Hold your breath gently"              },
  { label: "Exhale",  duration: 4, color: "from-purple-500 to-pink-400",   instruction: "Breathe out slowly through your mouth"},
  { label: "Hold",    duration: 4, color: "from-pink-400 to-blue-400",     instruction: "Hold before the next breath"          },
];

function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [tick, setTick] = useState(0);
  const [rounds, setRounds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        if (next >= PHASES[phase].duration) {
          setPhase(p => {
            const nextPhase = (p + 1) % 4;
            if (nextPhase === 0) setRounds(r => r + 1);
            return nextPhase;
          });
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phase]);

  const reset = () => { setRunning(false); setPhase(0); setTick(0); setRounds(0); };
  const current = PHASES[phase];
  const progress = ((tick + 1) / current.duration) * 100;
  const scale = phase === 0 ? 0.7 + (tick / current.duration) * 0.5
              : phase === 2 ? 1.2 - (tick / current.duration) * 0.5
              : phase === 0 ? 1.2 : 0.7;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6">
        {/* Breathing circle */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <div
            className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-20 transition-all duration-1000", current.color)}
            style={{ transform: `scale(${running ? scale : 0.8})` }}
          />
          <div
            className={cn("w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center text-white shadow-2xl transition-all duration-1000", current.color)}
            style={{ transform: `scale(${running ? scale : 0.8})` }}
          >
            <div className="text-center">
              <p className="text-2xl font-extrabold">{running ? current.duration - tick : "4"}</p>
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">{running ? current.label : "Ready"}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", current.color)}
              style={{ width: running ? `${progress}%` : "0%" }} />
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 text-center font-medium">
          {running ? current.instruction : "Box breathing reduces cortisol in under 2 minutes"}
        </p>

        {running && <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Round {rounds + 1} · Phase {phase + 1}/4</p>}
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={() => setRunning(r => !r)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6">
          {running ? <><Pause className="w-4 h-4 mr-2" />Pause</> : <><Play className="w-4 h-4 mr-2" />Start</>}
        </Button>
        <Button variant="outline" onClick={reset} className="rounded-xl dark:border-slate-600 dark:text-slate-200">
          <RefreshCw className="w-4 h-4 mr-2" />Reset
        </Button>
      </div>

      {/* Phase guide */}
      <div className="grid grid-cols-4 gap-2">
        {PHASES.map((p, i) => (
          <div key={i} className={cn("p-2 rounded-xl text-center text-xs font-bold transition-all", running && phase === i ? `bg-gradient-to-br ${p.color} text-white shadow-md` : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
            <p>{p.label}</p><p className="text-lg">{p.duration}s</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function StressManagement() {
  const [tab, setTab] = useState<"game" | "breathing">("game");

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {([["game","🎮 Mini Game"],["breathing","🫁 Breathing"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", tab === id ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "game"      && <BubbleGame />}
      {tab === "breathing" && <BreathingExercise />}
    </div>
  );
}
