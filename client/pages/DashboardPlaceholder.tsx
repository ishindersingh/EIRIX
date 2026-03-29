import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Construction, 
  LayoutDashboard, 
  Settings, 
  Users, 
  BookOpen, 
  BrainCircuit, 
  TrendingUp, 
  LogOut, 
  Bell,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";

export default function DashboardPlaceholder() {
  const { darkMode, setDarkMode } = useTheme();
  const { role } = useParams();
  const navigate = useNavigate();
  const roleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";

  const getRoleTheme = () => {
    switch (role) {
      case "parent": return "bg-purple-600 shadow-purple-200";
      case "mentor": return "bg-emerald-600 shadow-emerald-200";
      default: return "bg-indigo-600 shadow-indigo-200";
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "parent": return Users;
      case "mentor": return BookOpen;
      default: return LayoutDashboard;
    }
  };

  const Icon = getRoleIcon();

  return (
    <div className="min-h-screen gradient-bg flex dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/20 hidden md:flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", getRoleTheme())}>
            <BrainCircuit className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">EIRIX</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: "overview", icon: LayoutDashboard, label: "Overview" },
            { id: "students", icon: Users, label: role === "mentor" ? "My Students" : "Child Progress" },
            { id: "messages", icon: MessageSquare, label: "Messages" },
            { id: "analysis", icon: TrendingUp, label: "Detailed Reports" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item, i) => (
            <div
              key={item.id}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300",
                i === 0 
                  ? cn("text-white shadow-lg", getRoleTheme())
                  : "text-slate-600 hover:bg-white/50 hover:text-indigo-600 cursor-not-allowed opacity-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-semibold">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                darkMode ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                darkMode ? "translate-x-6" : ""
              }`} />
            </button>
          </div>
          <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen flex flex-col items-center justify-center text-center">
        <header className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center bg-transparent pointer-events-none">
          <div className="md:ml-64 pointer-events-auto">
             <h1 className="text-2xl font-bold text-slate-800">{roleTitle} Portal</h1>
          </div>
          <div className="pointer-events-auto flex items-center space-x-4">
             <Button variant="ghost" size="icon" className="glass h-10 w-10 border-white/50"><Bell className="w-5 h-5 text-slate-600" /></Button>
             <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-white/50"><Users className="w-5 h-5 text-slate-400" /></div>
          </div>
        </header>

        <div className="max-w-xl space-y-6 p-12 glass rounded-[3rem] border-white/40 shadow-2xl relative overflow-hidden group">
          <div className={cn("absolute -top-24 -right-24 w-64 h-64 opacity-5 rounded-full", getRoleTheme())} />
          
          <div className={cn("w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl mb-8 group-hover:scale-110 transition-transform duration-500", getRoleTheme())}>
            <Construction className="w-12 h-12" />
          </div>
          
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Coming Soon</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            The specialized <strong>{roleTitle} Dashboard</strong> is currently under development to ensure perfect monitoring and intervention tools.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-white/40 rounded-2xl border border-white/20 text-left">
              <h4 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wider">Features</h4>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>• Real-time risk alerts</li>
                <li>• Academic trend reports</li>
                <li>• Secure messaging</li>
              </ul>
            </div>
            <div className="p-4 bg-white/40 rounded-2xl border border-white/20 text-left">
               <h4 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wider">Status</h4>
               <p className="text-xs text-slate-500 leading-relaxed italic">
                 Optimizing predictive model integration for multi-user visualization...
               </p>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/")}
            className={cn("mt-8 w-full h-14 text-white font-bold rounded-2xl shadow-xl transition-all duration-300", getRoleTheme())}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
}
