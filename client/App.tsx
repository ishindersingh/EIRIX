import "./global.css";
import { useEffect } from "react";

import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import ChatbotPage from "./pages/ChatbotPage";
import EIRAPage from "./pages/EIRA";
import Resources from "./pages/Resources";
import DeadlinePage from "./pages/DeadlinePage";
import SettingsPage from "./pages/Settings";
import ParentDashboard from "./pages/ParentDashboard";
import MentorDashboardPage from "./pages/MentorDashboardPage";
import DashboardPlaceholder from "./pages/DashboardPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Clear stale user data older than 24 hours
  useEffect(() => {
    const sessionStart = localStorage.getItem("session_start");
    if (sessionStart && Date.now() - Number(sessionStart) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("session_start");
    }
  }, []);

  return (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/eira" element={<EIRAPage />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/deadlines" element={<DeadlinePage />} />
          <Route path="/settings"        element={<SettingsPage />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/mentor/dashboard" element={<MentorDashboardPage />} />
          <Route path="/:role/dashboard" element={<DashboardPlaceholder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
  );
};

export default App;
