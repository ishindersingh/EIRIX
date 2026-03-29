import { useNavigate } from "react-router-dom";
import { UserCircle, Users, BookOpen, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "../components/LanguageSwitcher";

const roles = [
  {
    id: "student",
    title: "Student",
    description: "Track your burnout, get AI tips, and stay balanced.",
    icon: UserCircle,
    color: "bg-blue-500",
    gradient: "from-blue-500 to-indigo-600",
    path: "/login/student"
  },
  {
    id: "parent",
    title: "Parent",
    description: "Monitor your child's well-being and communicate with mentors.",
    icon: Users,
    color: "bg-purple-500",
    gradient: "from-purple-500 to-pink-600",
    path: "/login/parent"
  },
  {
    id: "mentor",
    title: "Mentor",
    description: "Guide students at risk and analyze stress patterns.",
    icon: BookOpen,
    color: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-600",
    path: "/login/mentor"
  }
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm mb-4">
            <img src="/eirix-logo.png" alt="EIRIX" className="w-10 h-10 rounded-xl object-cover mr-2" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              EIRIX
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            EIRIX - AI Burnout Detection
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Harnessing behavioral AI to prevent student burnout before it starts.
            Who are you?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="group relative glass p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left border-transparent hover:border-white/40 overflow-hidden"
            >
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 group-hover:opacity-20 transition-opacity rounded-full bg-gradient-to-br",
                role.gradient
              )} />
              
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white bg-gradient-to-br",
                role.gradient
              )}>
                <role.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{role.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {role.description}
              </p>
              
              <div className="mt-6 flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
                Get Started
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-400 mt-12">
          Secure. Confidential. AI-Powered Mental Health Support.
        </p>
        <div className="flex justify-center mt-4">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
