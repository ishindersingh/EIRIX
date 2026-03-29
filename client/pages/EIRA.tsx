import { Bot } from "lucide-react";
import AppSidebar from "../components/AppSidebar";
import EIRAChatbot from "../features/chatbot/EIRAChatbot";

export default function EIRAPage() {
  return (
    <div className="min-h-screen gradient-bg flex dark:text-slate-100">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen flex flex-col">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">EIRA</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Emotional Intelligence & Relief Assistant</p>
            </div>
          </div>
        </header>
        <div className="flex-1 min-h-0">
          <EIRAChatbot />
        </div>
      </main>
    </div>
  );
}
