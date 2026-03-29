import { BrainCircuit, Users, LayoutDashboard, LogOut, Moon, Sun, Bell, Bot } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import SimpleParentDashboard from "../features/parent/SimpleParentDashboard";
import VoiceAssistant from "../features/parent/VoiceAssistant";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/parent/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/parent/eira",      icon: Bot,             label: "EIRA Chat"  },
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
  const [rollNoInput,   setRollNoInput]   = useState("");
  const [verifiedRollNo,setVerifiedRollNo]= useState(() => {
    try { return JSON.parse(localStorage.getItem("user") ?? "{}").studentRollNo ?? ""; } catch { return ""; }
  });
  const [verifyError,   setVerifyError]   = useState("");
  const [verifying,     setVerifying]     = useState(false);
  const [studentInfo,   setStudentInfo]   = useState<{ name: string; course: string; year: string } | null>(null);

  const verifyRollNo = async () => {
    if (!rollNoInput.trim()) return;
    setVerifying(true);
    setVerifyError("");
    try {
      const res  = await fetch(`/api/auth/verify/${rollNoInput.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok || !data.verified) {
        setVerifyError("Invalid or Not Found — student has not logged in yet.");
        setVerifiedRollNo("");
      } else {
        setVerifiedRollNo(data.student.rollNo);
        setStudentInfo(data.student);
        // Save to localStorage
        const user = JSON.parse(localStorage.getItem("user") ?? "{}");
        user.studentRollNo = data.student.rollNo;
        user.studentName   = data.student.name;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch {
      setVerifyError("Server error. Make sure the dev server is running.");
    } finally {
      setVerifying(false);
    }
  };

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

        {/* Roll No Verification (Feature 2) */}
        <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-600/5 to-pink-600/5 dark:from-purple-600/10 dark:to-pink-600/10 pb-4">
            <CardTitle className="text-lg font-bold dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Student Verification
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Enter your child's roll number to access their burnout report. Only verified students (who have logged in) are accessible.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={rollNoInput}
                onChange={e => setRollNoInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && verifyRollNo()}
                placeholder="Enter student roll number (e.g. CS2021001)"
                className="flex-1 h-11 px-4 rounded-xl bg-white/60 dark:bg-white/10 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:border-purple-500"
              />
              <button onClick={verifyRollNo} disabled={verifying}
                className="px-5 h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors disabled:opacity-50">
                {verifying ? "Checking..." : "Verify"}
              </button>
            </div>
            {verifyError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                {verifyError}
              </div>
            )}
            {verifiedRollNo && studentInfo && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">Verified: {studentInfo.name}</p>
                <p className="text-emerald-600 dark:text-emerald-500 text-xs">{studentInfo.course} · {studentInfo.year} · Roll No: {verifiedRollNo}</p>
              </div>
            )}
            {verifiedRollNo && !studentInfo && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">Linked: {verifiedRollNo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Burnout Report */}
        <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden mb-6">
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

        {/* Voice Assistant (Feature 3) */}
        <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600/5 to-pink-600/5 dark:from-purple-600/10 dark:to-pink-600/10 pb-4">
            <CardTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              AI Voice Assistant
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Ask questions about your child's performance using your voice in English, Hindi, or Punjabi
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <VoiceAssistant studentRollNo={verifiedRollNo || "unknown"} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
