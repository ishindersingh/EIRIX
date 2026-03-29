import { useData } from "../../context/DataContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTheme } from "../../context/ThemeContext";

export default function BurnoutGraph() {
  const { history, stats, loadingStats } = useData();
  const { darkMode } = useTheme();

  const tickColor = darkMode ? "#94a3b8" : "#64748b";
  const gridColor = darkMode ? "#1e293b" : "#e2e8f0";
  const tooltipBg = darkMode ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)";

  return (
    <div className="space-y-6">
      {/* Area chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="burnoutGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", backgroundColor: tooltipBg, color: darkMode ? "#f1f5f9" : "#0f172a" }}
              formatter={(v: number) => [`${v}`, "Burnout Score"]}
            />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "High Risk", fill: "#ef4444", fontSize: 11 }} />
            <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Moderate", fill: "#f59e0b", fontSize: 11 }} />
            <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="url(#burnoutGrad)" dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Dataset stats from backend */}
      {!loadingStats && stats && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Dataset Benchmarks — {stats.total.toLocaleString()} students
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Avg Sleep",      value: `${stats.averages.sleep}h`,       color: "blue"    },
              { label: "Avg Study",      value: `${stats.averages.study}h`,       color: "indigo"  },
              { label: "Avg Screen",     value: `${stats.averages.screen}h`,      color: "slate"   },
              { label: "Avg Anxiety",    value: `${stats.averages.anxiety}/10`,   color: "amber"   },
              { label: "Avg CGPA",       value: stats.averages.cgpa.toString(),   color: "emerald" },
              { label: "Avg Attendance", value: `${stats.averages.attendance}%`,  color: "purple"  },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-950/30 text-center`}>
                <p className={`text-lg font-extrabold text-${color}-600`}>{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Distribution bar */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk Distribution in Dataset</p>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.distribution.low / stats.total) * 100}%` }} title="Low" />
              <div className="bg-amber-500 transition-all"   style={{ width: `${(stats.distribution.moderate / stats.total) * 100}%` }} title="Moderate" />
              <div className="bg-red-500 transition-all"     style={{ width: `${(stats.distribution.high / stats.total) * 100}%` }} title="High" />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>🟢 Low {Math.round((stats.distribution.low / stats.total) * 100)}%</span>
              <span>🟡 Moderate {Math.round((stats.distribution.moderate / stats.total) * 100)}%</span>
              <span>🔴 High {Math.round((stats.distribution.high / stats.total) * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
