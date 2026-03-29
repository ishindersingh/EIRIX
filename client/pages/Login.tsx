import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BrainCircuit, Mail, Lock, Loader2, ArrowLeft, Hash, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "../components/LanguageSwitcher";

const ROLE_COLORS: Record<string, string> = {
  student: "from-indigo-600 to-purple-600",
  parent:  "from-purple-600 to-pink-600",
  mentor:  "from-emerald-600 to-teal-600",
};

// Demo credentials hint per role
const DEMO_HINTS: Record<string, { label: string; value: string }[]> = {
  student: [
    { label: "Your Name",  value: "(type your name)"          },
    { label: "Roll No",    value: "CS2021001"                  },
    { label: "Email",      value: "alex@university.edu"        },
    { label: "Password",   value: "alex123"                    },
  ],
  parent: [
    { label: "Your Name",  value: "(type your name)"          },
    { label: "Email",      value: "robert@gmail.com"           },
    { label: "Password",   value: "parent123"                  },
  ],
  mentor: [
    { label: "Your Name",  value: "(type your name)"          },
    { label: "Employee ID",value: "EMP001"                     },
    { label: "Email",      value: "ramesh@university.edu"      },
    { label: "Password",   value: "mentor123"                  },
  ],
};

export default function LoginPage() {
  const { role }    = useParams<{ role: string }>();
  const navigate    = useNavigate();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [isNew,      setIsNew]      = useState(false);
  const [name,       setName]       = useState("");
  const [rollNo,     setRollNo]     = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [studentRollNo, setStudentRollNo] = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");

  const roleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  const gradient  = ROLE_COLORS[role ?? "student"] ?? ROLE_COLORS.student;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = role === "student"
        ? "/api/auth/student/login"
        : role === "parent"
        ? "/api/auth/parent/login"
        : role === "mentor"
        ? "/api/auth/mentor/login"
        : "/api/auth/login";

      const body = role === "student"
        ? { rollNo, email, password, name, role }
        : role === "mentor"
        ? { employeeId, email, password, name, role }
        : { email, password, name, studentRollNo, role };

      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed. Check your credentials.");
        return;
      }

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      const savedUser = { ...data.user, name: name.trim() || data.user.name };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(savedUser));
      localStorage.setItem("session_start", Date.now().toString());
      window.location.href = `/${role}/dashboard`;
    } catch {
      setError("Server unreachable. Make sure the dev server is running.");
    } finally {
      setLoading(false);
    }
  };

  const hints = DEMO_HINTS[role ?? ""] ?? [];

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6 dark:text-slate-100">
      <Link to="/" className="absolute top-8 left-8 flex items-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to role selection
      </Link>
      <div className="absolute top-8 right-8">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className={cn("w-14 h-14 rounded-2xl mx-auto mb-4 overflow-hidden shadow-xl")}>
            <img src="/eirix-logo.png" alt="EIRIX" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {roleTitle} Login
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Access your personalized EIRIX dashboard
          </p>
        </div>

        <Card className="glass border-transparent shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="dark:text-slate-400">Enter your credentials to continue.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">

              {/* New / Existing toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                {([false, true] as const).map(v => (
                  <button key={String(v)} type="button" onClick={() => setIsNew(v)}
                    className={cn("flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                      isNew === v ? `bg-gradient-to-r ${gradient} text-white shadow-md` : "text-slate-500 dark:text-slate-400")}>
                    {v ? "New User" : "Existing User"}
                  </button>
                ))}
              </div>

              {/* Username — always shown, used to personalize dashboard */}
              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-slate-200">Your Name</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input id="name" type="text"
                    placeholder={role === "mentor" ? "e.g. Dr. Ramesh Kumar" : role === "parent" ? "e.g. Robert Johnson" : "e.g. Alex Johnson"}
                    className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                    value={name} onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">This name will appear on your dashboard</p>
              </div>

              {/* Name — new users only */}
              {isNew && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="dark:text-slate-200">Full Name</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input id="name" type="text" placeholder="e.g. John Smith"
                      className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                      value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Roll No — student only */}
              {role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="rollNo" className="dark:text-slate-200">Roll Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      id="rollNo"
                      type="text"
                      placeholder="e.g. CS2021001"
                      className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                      value={rollNo}
                      onChange={e => setRollNo(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Employee ID — mentor only */}
              {role === "mentor" && (
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="dark:text-slate-200">Employee ID</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="e.g. EMP001"
                      className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Student Roll No — parent new users */}
              {role === "parent" && isNew && (
                <div className="space-y-2">
                  <Label htmlFor="studentRollNo" className="dark:text-slate-200">Child's Roll Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input id="studentRollNo" type="text" placeholder="e.g. CS2021001"
                      className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                      value={studentRollNo} onChange={e => setStudentRollNo(e.target.value)} />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Enter your child's roll number to link their burnout data to your dashboard</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={role === "student" ? "name@university.edu" : "parent@gmail.com"}
                    className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="dark:text-slate-200">Password</Label>
                  <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-white/50 dark:bg-white/10 border-slate-200 dark:border-slate-600 focus:border-indigo-500 rounded-xl dark:text-slate-100"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className={cn("w-full h-12 text-white font-bold rounded-xl shadow-lg transition-all duration-300 bg-gradient-to-r", gradient)}
              >
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Authenticating...</>
                  : "Sign In"
                }
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-700 mt-2 pt-5">
            {/* Demo credentials */}
            {hints.length > 0 && (
              <div className="w-full p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">Demo Credentials</p>
                <div className="space-y-1">
                  {hints.map(h => (
                    <div key={h.label} className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{h.label}:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New here?{" "}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Create an account
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
