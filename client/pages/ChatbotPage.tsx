import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  Sparkles, 
  MessageSquare,
  RefreshCw,
  MoreVertical,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      text: "Hello! I'm EIRIX, your AI mental health assistant. How are you feeling today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Response based on input keywords
    setTimeout(() => {
      let responseText = "I understand how you feel. It's important to remember that these feelings are valid. Would you like to try a quick breathing exercise?";
      
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes("stress") || lowerInput.includes("overwhelmed")) {
        responseText = "I'm sorry you're feeling stressed. High academic loads can be tough. Have you tried breaking your tasks into smaller, 20-minute chunks? This can make them feel much more manageable.";
      } else if (lowerInput.includes("focus") || lowerInput.includes("concentration")) {
        responseText = "Focus issues are often linked to cognitive fatigue. I recommend the Pomodoro technique: 25 minutes of work followed by a 5-minute movement break away from your screen.";
      } else if (lowerInput.includes("tired") || lowerInput.includes("sleep")) {
        responseText = "Fatigue is a major indicator of burnout risk. Prioritizing consistent sleep cycles is the best first step. Even 15 minutes of earlier rest tonight could help!";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="glass p-4 border-b border-white/20 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Link to="/student/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">EIRIX AI</h1>
              <div className="flex items-center text-xs text-emerald-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Always here to listen
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-slate-500"><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-slate-500"><MoreVertical className="w-4 h-4" /></Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-center mb-8">
            <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30 text-xs text-slate-500 flex items-center shadow-sm">
              <Sparkles className="w-3 h-3 mr-2 text-indigo-400" />
              AI Support is available 24/7. Your data is private.
            </div>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex items-start group",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1",
                msg.role === "user" ? "bg-purple-600 ml-3" : "bg-indigo-600 mr-3"
              )}>
                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={cn(
                "max-w-[85%] md:max-w-[70%] space-y-2",
                msg.role === "user" ? "items-end text-right" : "items-start text-left"
              )}>
                <div className={cn(
                  "p-4 md:p-5 rounded-3xl shadow-lg border relative group",
                  msg.role === "user" 
                    ? "bg-purple-600 text-white border-transparent rounded-tr-none" 
                    : "glass text-slate-800 border-white/40 rounded-tl-none"
                )}>
                  <p className="text-sm md:text-base leading-relaxed">
                    {msg.text}
                  </p>
                  
                  {msg.role === "bot" && (
                    <div className="absolute -bottom-4 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white shadow-sm border border-slate-100"><ThumbsUp className="w-3 h-3 text-slate-400" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white shadow-sm border border-slate-100"><ThumbsDown className="w-3 h-3 text-slate-400" /></Button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 px-2 uppercase font-bold tracking-wider">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1 mr-3">
                <Bot className="w-5 h-5" />
              </div>
              <div className="glass p-4 rounded-3xl rounded-tl-none border-white/40 flex space-x-1 items-center">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="glass p-4 md:p-6 border-t border-white/20">
        <form 
          onSubmit={handleSend}
          className="max-w-3xl mx-auto flex items-center space-x-4"
        >
          <div className="relative flex-1">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me how you're feeling..."
              className="w-full h-14 pl-12 pr-4 bg-white/60 border-transparent focus:border-indigo-500 rounded-2xl shadow-inner text-base"
              disabled={isTyping}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all duration-300"
          >
            <Send className="w-6 h-6" />
          </Button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
          EIRIX is not a clinical replacement for professional medical therapy.
        </p>
      </div>
    </div>
  );
}
