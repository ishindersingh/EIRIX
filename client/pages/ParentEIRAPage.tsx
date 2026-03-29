import { BrainCircuit, Users, LayoutDashboard, LogOut, Moon, Sun, Bell, Bot } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useState, useRef, useEffect } from "react";
import { Send, RefreshCw, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ── Parent-specific quick prompts ──────────────────────────────────────────────
const QUICK_PROMPTS = [
  "My child seems stressed lately, what should I do?",
  "How can I talk to my child about burnout?",
  "My child's burnout score is high, help me",
  "How much study time is healthy for students?",
  "My child is not sleeping well, any tips?",
  "How do I support without adding pressure?",
];

// ── Parent-specific AI responses ───────────────────────────────────────────────
function getParentResponse(msg: string): string {
  const lower = msg.toLowerCase();

  if (lower.includes("stress") || lower.includes("stressed"))
    return "When your child seems stressed, the most powerful thing you can do is **listen without judgment**. Avoid immediately offering solutions — first ask 'How are you feeling?' and let them talk.\n\nPractical steps:\n• Create a calm evening routine at home\n• Reduce pressure around grades temporarily\n• Ensure they have at least 1 hour of unstructured time daily\n• A short walk together can open conversations naturally";

  if (lower.includes("burnout score") || lower.includes("score is high") || lower.includes("high risk"))
    return "A high burnout score means your child is experiencing multiple stress factors simultaneously. This is serious but very manageable with the right support.\n\n**Immediate actions:**\n• Have a calm, non-judgmental conversation tonight\n• Contact their class teacher or college counselor this week\n• Temporarily reduce extracurricular commitments\n• Ensure 8+ hours of sleep and proper meals\n\nRemember — your emotional support is the #1 protective factor against burnout.";

  if (lower.includes("talk") || lower.includes("communicate") || lower.includes("conversation"))
    return "Talking to your child about burnout requires the right approach:\n\n**Do:**\n• Choose a relaxed moment (not right after school)\n• Start with 'I've noticed you seem tired lately...'\n• Ask open questions: 'What's been the hardest part?'\n• Validate their feelings before offering advice\n\n**Avoid:**\n• Comparing to other students\n• Minimizing ('Everyone goes through this')\n• Jumping to solutions before they feel heard\n\nEven a 10-minute genuine conversation can significantly reduce their stress levels.";

  if (lower.includes("sleep") || lower.includes("sleeping"))
    return "Sleep is the single most important factor in preventing student burnout. Here's how to help:\n\n**Create a sleep-friendly environment:**\n• Consistent bedtime — even weekends\n• No screens 1 hour before bed (family rule helps)\n• Keep the bedroom cool and dark\n• No heavy meals after 8 PM\n\n**If they resist:** Frame it as performance improvement — 'You'll study better and remember more with proper sleep' tends to resonate more than health arguments with teenagers.";

  if (lower.includes("study") || lower.includes("study time") || lower.includes("how much"))
    return "Research-backed healthy study guidelines for students:\n\n• **School hours (6-8h):** No additional study needed\n• **College students:** 2-4 hours of focused study per day is optimal\n• **Exam periods:** Up to 6 hours with proper breaks\n\n**The Pomodoro method works well:** 25 minutes study + 5 minute break. After 4 rounds, take a 20-minute break.\n\nMore than 8 hours of daily study is counterproductive — retention drops significantly and burnout risk triples.";

  if (lower.includes("pressure") || lower.includes("without pressure") || lower.includes("support"))
    return "Supporting without adding pressure is an art. Here's what works:\n\n**Say this:**\n• 'I'm proud of your effort, not just results'\n• 'What do you need from me right now?'\n• 'It's okay to take a break'\n\n**Avoid this:**\n• 'Your friend scored higher'\n• 'You need to study more'\n• 'I'm disappointed'\n\n**Create safety:** When children know home is a safe space from academic pressure, they perform better — not worse. Unconditional support builds resilience.";

  if (lower.includes("counselor") || lower.includes("professional") || lower.includes("help"))
    return "Seeking professional help is a sign of strength, not weakness. Here's when to consider it:\n\n**Consult a counselor if:**\n• Burnout score stays above 70 for 2+ weeks\n• Child withdraws from friends and family\n• Sleep or appetite changes significantly\n• They express hopelessness about the future\n\n**Resources:**\n• College counseling cell (most institutions have one)\n• iCall: 9152987821\n• Vandrevala Foundation: 1860-2662-345 (24/7)\n\nEarly intervention prevents escalation.";

  return "Thank you for reaching out. As a parent, your awareness and concern already makes a huge difference in your child's well-being.\n\nI'm here to help you navigate student burnout from a parent's perspective. You can ask me about:\n• How to talk to your child about stress\n• Understanding their burnout score\n• Creating a supportive home environment\n• When to seek professional help\n\nWhat specific situation would you like guidance on?";
}

// ── Chat Message ───────────────────────────────────────────────────────────────
interface Message { id: string; role: "bot" | "user"; text: string; time: string }

function formatText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

function ParentSidebar() {
  const { darkMode, setDarkMode } = useTheme();
  const { pathname } = useLocation();

  const NAV = [
    { to: "/parent/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/parent/eira",      icon: Bot,             label: "EIRA Chat"  },
    { to: "/settings",         icon: Bell,            label: "Settings"  },
  ];

  return (
    <aside className="w-64 glass border-r border-white/20 dark:border-white/10 hidden md:flex flex-col p-6 space-y-6 shrink-0">
      <div className="flex items-center space-x-3">
        <img src="/eirix-logo.png" alt="EIRIX" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
        <span className="text-xl font-bold text-slate-900 dark:text-white">EIRIX</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-800">
        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Parent Portal</span>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={cn("w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200",
              pathname === to
                ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 hover:text-purple-600"
            )}>
            <Icon className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{label}</span>
          </Link>
        ))}
      </nav>
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

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ParentEIRAPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "0", role: "bot",
    text: "Hello! I'm **EIRA**, your parenting support assistant 💜\n\nI'm here to help you understand your child's burnout, guide you on how to support them, and answer any questions about student well-being.\n\nWhat's on your mind today?",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input,  setInput]  = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Try backend first, fallback to local logic
    try {
      const res  = await fetch("/api/eira/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text.trim() }) });
      const data = await res.json();
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: "bot", text: data.reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: "bot", text: getParentResponse(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      }, 1000);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex dark:text-slate-100">
      <ParentSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen flex flex-col">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">EIRA — Parent Support</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">AI guidance for supporting your child's well-being</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Chat */}
          <div className="flex-1 flex flex-col glass rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-white/10 bg-gradient-to-r from-purple-600/5 to-pink-600/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">EIRA</p>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Parent Support Mode
                  </div>
                </div>
              </div>
              <button onClick={() => { setMessages([{ id: "0", role: "bot", text: "Fresh start! What would you like to discuss about your child's well-being?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]); }}
                className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-slate-500">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Privacy */}
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-2 bg-white/40 dark:bg-white/5 px-4 py-1.5 rounded-full text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Confidential parenting support — available 24/7
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scroll-smooth">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex items-start gap-3 group", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 mt-1", msg.role === "user" ? "bg-purple-600" : "bg-gradient-to-br from-purple-500 to-pink-600")}>
                    {msg.role === "user" ? <Users className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={cn("max-w-[80%] space-y-1", msg.role === "user" ? "items-end text-right" : "items-start")}>
                    <div className={cn("px-5 py-4 rounded-3xl shadow-md border text-sm leading-relaxed whitespace-pre-line",
                      msg.role === "user"
                        ? "bg-purple-600 text-white border-transparent rounded-tr-none"
                        : "glass border-white/40 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none"
                    )}>
                      {msg.role === "bot" ? formatText(msg.text) : msg.text}
                    </div>
                    <div className={cn("flex items-center gap-2 px-1", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{msg.time}</span>
                      {msg.role === "bot" && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ThumbsUp className="w-3 h-3 text-slate-400" /></button>
                          <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><ThumbsDown className="w-3 h-3 text-slate-400" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="glass px-5 py-4 rounded-3xl rounded-tl-none border border-white/40 dark:border-white/10 flex gap-1.5 items-center">
                    {[0,150,300].map(d => <div key={d} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            <div className="px-6 py-3 flex gap-2 overflow-x-auto border-t border-white/10">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => send(p)} disabled={typing}
                  className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-50">
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); send(input); }} className="px-6 py-4 border-t border-white/20 dark:border-white/10 flex gap-3">
              <Input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} disabled={typing}
                placeholder="Ask about your child's well-being..."
                className="flex-1 bg-white/60 dark:bg-white/10 border-transparent focus:border-purple-500 rounded-2xl text-sm dark:text-slate-100 dark:placeholder:text-slate-500" />
              <Button type="submit" disabled={!input.trim() || typing}
                className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shrink-0">
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 pb-3 uppercase tracking-widest font-bold">
              EIRA is not a replacement for professional mental health care
            </p>
          </div>

          {/* Tips sidebar */}
          <div className="w-64 shrink-0 hidden lg:flex flex-col gap-4">
            <div className="glass rounded-3xl border border-white/20 dark:border-white/10 p-5 shadow-xl">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-sm">Parent Support Tips</h3>
              <div className="space-y-3">
                {[
                  { emoji: "💜", tip: "Listen first, advise second — your child needs to feel heard" },
                  { emoji: "🏠", tip: "Make home a pressure-free zone, especially during exams" },
                  { emoji: "🍽️", tip: "Shared meals create natural opportunities for conversation" },
                  { emoji: "📵", tip: "Model healthy screen habits — children mirror parents" },
                  { emoji: "🌙", tip: "Protect their sleep — it's more important than extra study" },
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
                    <span className="text-lg shrink-0">{t.emoji}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Crisis */}
            <div className="glass rounded-3xl border border-red-200/50 dark:border-red-800/30 p-5 shadow-xl bg-red-50/30 dark:bg-red-950/10">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">Crisis Helplines</h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: "iCall",        number: "9152987821"    },
                  { name: "Vandrevala",   number: "1860-2662-345" },
                  { name: "AASRA",        number: "9820466627"    },
                ].map(({ name, number }) => (
                  <div key={name} className="flex justify-between p-2 bg-white/50 dark:bg-white/5 rounded-xl">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{name}</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
