import { useState, useEffect } from "react";
import { Calendar, UserCircle, Activity, BrainCircuit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import StudentNavbar from "../components/StudentNavbar";
import InputControls from "../components/InputControls";
import ResultCard from "../components/ResultCard";
import Insights from "../components/Insights";
import History from "../components/History";
import BurnoutGraph from "../features/graph/BurnoutGraph";
import { DataProvider } from "../context/DataContext";
import { predictBurnout, PredictInput, PredictResult } from "../services/burnoutLogic";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") ?? "{}"); } catch { return {}; }
}

const DEFAULT_INPUT: PredictInput = {
  sleep_hours:      7,
  study_hours:      5,
  stress_level:     5,
  assignment_load:  3,
  mood:             "Neutral",
  social_activity:  5,
  screen_time:      4,
  motivation_level: 6,
};

const TABS = [
  { id: "input",    title: "Daily Well-being Check",  desc: "Fill in your daily habits to get your AI burnout prediction."     },
  { id: "score",    title: "Burnout Score",            desc: "Your AI-generated burnout risk score based on 150,000 students."  },
  { id: "graph",    title: "Burnout Trends",           desc: "Weekly progression and dataset benchmarks."                       },
  { id: "insights", title: "AI Insights",              desc: "Personalized recommendations from your latest assessment."        },
  { id: "history",  title: "Assessment History",       desc: "Your 7-day burnout score history and trend analysis."             },
];

function today() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function StudentDashboard() {
  // Force re-read on every mount
  const [user, setUser] = useState(() => getUser());
  const displayName     = user.name?.split(" ")[0] ?? "Student";

  useEffect(() => {
    setUser(getUser());
  }, []);
  const [activeTab, setActiveTab] = useState("input");
  const [input, setInput] = useState<PredictInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof PredictInput, value: number | string) =>
    setInput(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictBurnout(input);
      setResult(res);
      setActiveTab("score");
      // Save to localStorage so Parent Dashboard can read it
      const existing = JSON.parse(localStorage.getItem("burnout_history") || "[]");
      const entry = {
        score:      res.burnout_score,
        level:      res.risk_level,
        confidence: res.confidence,
        insight:    res.insights,
        time:       new Date().toLocaleString(),
        input,
      };
      const updated = [...existing.slice(-19), entry]; // keep last 20
      localStorage.setItem("burnout_history", JSON.stringify(updated)); if (user.rollNo) { localStorage.setItem(`burnout_history_${user.rollNo}`, JSON.stringify(updated)); }
    } catch {
      setError("Prediction failed. Make sure the dev server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInput(DEFAULT_INPUT);
    setActiveTab("input");
  };

  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <DataProvider>
      <div className="min-h-screen gradient-bg flex dark:text-slate-100">
        <StudentNavbar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome back, Alex 👋</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{user.rollNo ? `${user.rollNo} � ` : ""}{user.course ?? "Track your well-being and maintain academic balance."}</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white/60 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30 shadow-sm">
                <Calendar className="w-4 h-4 text-indigo-600 mr-2" />
                <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">{today()}</span>
              </div>
              <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center border border-white/50 shadow-sm">
                <UserCircle className="w-7 h-7 text-slate-400" />
              </div>
            </div>
          </header>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { label: "Sleep",      value: `${input.sleep_hours}h`,       color: "blue"    },
              { label: "Study",      value: `${input.study_hours}h`,       color: "indigo"  },
              { label: "Stress",     value: `${input.stress_level}/10`,    color: "amber"   },
              { label: "Screen",     value: `${input.screen_time}h`,       color: "slate"   },
              { label: "Motivation", value: `${input.motivation_level}/10`,color: "purple"  },
            ].map(({ label, value, color }) => (
              <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${color}-50 dark:bg-${color}-950/40 border border-${color}-100 dark:border-${color}-800`}>
                <span className={`text-xs font-bold text-${color}-500 uppercase tracking-wide`}>{label}</span>
                <span className={`text-sm font-extrabold text-${color}-700 dark:text-${color}-300`}>{value}</span>
              </div>
            ))}
            {result && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm ${
                result.risk_level === "high" ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-800" :
                result.risk_level === "moderate" ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800" :
                "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800"
              }`}>
                <Activity className="w-4 h-4" />
                Score: {result.burnout_score} — {result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)} Risk
              </div>
            )}
          </div>

          {/* Tab content card */}
          <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-600/10 dark:to-purple-600/10 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <BrainCircuit className="w-6 h-6 text-indigo-600" />
                <CardTitle className="text-2xl font-bold dark:text-white">{currentTab.title}</CardTitle>
              </div>
              <CardDescription className="dark:text-slate-400">{currentTab.desc}</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                  ⚠️ {error}
                </div>
              )}

              {activeTab === "input" && (
                <InputControls values={input} onChange={handleChange} onSubmit={handleSubmit} loading={loading} />
              )}

              {activeTab === "score" && (
                result
                  ? <ResultCard result={result} onReset={handleReset} onViewInsights={() => setActiveTab("insights")} />
                  : <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                      <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="font-semibold">No prediction yet.</p>
                      <button onClick={() => setActiveTab("input")} className="mt-3 text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-sm">
                        → Go to Dashboard to run a check
                      </button>
                    </div>
              )}

              {activeTab === "graph" && <BurnoutGraph />}

              {activeTab === "insights" && (
                result
                  ? <Insights result={result} onNewCheck={handleReset} />
                  : <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                      <p className="font-semibold">Run a prediction first to see insights.</p>
                      <button onClick={() => setActiveTab("input")} className="mt-3 text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-sm">
                        → Go to Dashboard
                      </button>
                    </div>
              )}

              {activeTab === "history" && <History />}
            </CardContent>
          </Card>
        </main>
      </div>
    </DataProvider>
  );
}
