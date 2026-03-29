import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, RefreshCw, Sparkles,
  ThumbsUp, ThumbsDown, Lightbulb, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import NearbyHelp from "../../components/NearbyHelp";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: string;
}

interface Suggestion {
  category: string;
  text: string;
  emoji: string;
}

const QUICK_PROMPTS = [
  "I'm feeling stressed about exams 😰",
  "I can't sleep properly 😴",
  "I'm losing motivation to study 📚",
  "I feel anxious and overwhelmed 😟",
  "Give me a breathing exercise 🫁",
  "I need mental health tips 💡",
];

function formatText(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isBot = msg.role === "bot";
  return (
    <div className={cn("flex items-start gap-3 group", isBot ? "flex-row" : "flex-row-reverse")}>
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 mt-1",
        isBot ? "bg-indigo-600" : "bg-purple-600"
      )}>
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      <div className={cn("max-w-[80%] space-y-1", isBot ? "items-start" : "items-end text-right")}>
        <div className={cn(
          "px-5 py-4 rounded-3xl shadow-md border text-sm leading-relaxed whitespace-pre-line",
          isBot
            ? "glass border-white/40 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none"
            : "bg-purple-600 text-white border-transparent rounded-tr-none"
        )}>
          {isBot ? formatText(msg.text) : msg.text}
        </div>

        <div className={cn("flex items-center gap-2 px-1", isBot ? "justify-start" : "justify-end")}>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{msg.time}</span>
          {isBot && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <ThumbsUp className="w-3 h-3 text-slate-400" />
              </button>
              <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <ThumbsDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
        <Bot className="w-5 h-5" />
      </div>
      <div className="glass px-5 py-4 rounded-3xl rounded-tl-none border border-white/40 dark:border-white/10 flex gap-1.5 items-center">
        {[0, 150, 300].map(delay => (
          <div key={delay} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  );
}

export default function EIRAChatbot() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "0",
    role: "bot",
    text: "Hi! I'm **EIRA** — your Emotional Intelligence & Relief Assistant 💙\n\nI'm here to support your mental well-being. You can talk to me about stress, anxiety, sleep, focus, or anything on your mind.\n\nWhat's going on today?",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/eira/suggestions")
      .then(r => r.json())
      .then(d => setSuggestions(d.suggestions ?? []))
      .catch(() => {})
      .finally(() => setLoadingSuggestions(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/eira/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history: messages.slice(-6) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: "I'm having trouble connecting right now. Please try again in a moment. 💙",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([{
      id: "0",
      role: "bot",
      text: "Hi again! I'm **EIRA** 💙 Fresh start — what's on your mind?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setInput("");
  };

  return (
    <div className="flex h-full gap-6">
      {/* Chat area */}
      <div className="flex-1 flex flex-col glass rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-xl">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-white/10 bg-gradient-to-r from-indigo-600/5 to-purple-600/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">EIRA</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online — Always here for you
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400"
            title="New conversation"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy notice */}
        <div className="flex justify-center py-3 px-4">
          <div className="flex items-center gap-2 bg-white/40 dark:bg-white/5 px-4 py-1.5 rounded-full border border-white/30 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            AI support available 24/7 · Your conversations are private
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-5 scroll-smooth">
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          {typing && <TypingIndicator />}
        </div>

        {/* Quick prompts */}
        <div className="px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/10">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={typing}
              className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-white/20 dark:border-white/10 flex gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tell me how you're feeling..."
            disabled={typing}
            className="flex-1 h-13 bg-white/60 dark:bg-white/10 border-transparent focus:border-indigo-500 rounded-2xl text-sm dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <Button
            type="submit"
            disabled={!input.trim() || typing}
            className="h-13 w-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 pb-3 uppercase tracking-widest font-bold">
          EIRA is not a replacement for professional mental health care
        </p>
      </div>

      {/* Suggestions sidebar */}
      <div className="w-72 shrink-0 space-y-4 hidden lg:flex flex-col">
        {/* Daily tips */}
        <div className="glass rounded-3xl border border-white/20 dark:border-white/10 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Daily Mental Health Tips</h3>
          </div>
          {loadingSuggestions ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{s.emoji}</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{s.category}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              setLoadingSuggestions(true);
              fetch("/api/eira/suggestions")
                .then(r => r.json())
                .then(d => setSuggestions(d.suggestions ?? []))
                .catch(() => {})
                .finally(() => setLoadingSuggestions(false));
            }}
            className="mt-3 w-full text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh tips
          </button>
        </div>

        {/* Nearby Help — replaces static crisis helplines */}
        <div className="glass rounded-3xl border border-red-200/50 dark:border-red-800/30 p-5 shadow-xl bg-red-50/30 dark:bg-red-950/10">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Crisis & Nearby Support</h3>
          </div>
          <NearbyHelp />
        </div>
      </div>
    </div>
  );
}
