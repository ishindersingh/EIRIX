import { Clock } from "lucide-react";
import AppSidebar from "../components/AppSidebar";
import DeadlineFeature from "../features/deadline/Deadline";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DeadlinePage() {
  return (
    <div className="min-h-screen gradient-bg flex dark:text-slate-100">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Deadlines</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track tasks, priorities, and get voice reminders</p>
            </div>
          </div>
        </header>

        <Card className="glass border-transparent shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 pb-4">
            <CardTitle className="text-xl font-bold dark:text-white">Task Manager</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Add tasks with due dates, set priority, and enable voice alerts for reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <DeadlineFeature />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
