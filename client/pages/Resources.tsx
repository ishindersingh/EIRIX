import { BookOpen } from "lucide-react";
import AppSidebar from "../components/AppSidebar";
import ResourcesPage from "../features/resources/ResourcesPage";

export default function Resources() {
  return (
    <div className="min-h-screen gradient-bg flex dark:text-slate-100">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Resources</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tools and tips to manage stress, study, screen time & sleep</p>
            </div>
          </div>
        </header>
        <ResourcesPage />
      </main>
    </div>
  );
}
