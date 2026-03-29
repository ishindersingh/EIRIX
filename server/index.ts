import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handlePredict, handleStats } from "./routes/burnout";
import { handleEiraChat, handleEiraSuggestions } from "./routes/eira";
import { handleStudyTips, handleScreenChallenges, handleSleepContent, handleStressTips } from "./routes/resources";
import { handleGetDeadlines, handleAddDeadline, handleUpdateDeadline, handleDeleteDeadline, handleToggleComplete } from "./routes/deadlines";
import { handleGetGoals, handleAddGoal, handleUpdateGoal, handleDeleteGoal, handleGetDates, handleAddDate, handleDeleteDate } from "./routes/settings";
import { handleParentOverview, handleParentTrend, handleParentAlerts, handleMarkAlertRead, handleMarkAllRead } from "./routes/parent";
import { handleStudentLogin, handleParentLogin, handleMentorLogin, handleStudentLookup, handleGetStudents, handleMentorStudents, handleGetVerifiedStudents, handleCheckVerified } from "./routes/auth";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "ping" });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/student/login",       handleStudentLogin);
  app.post("/api/auth/parent/login",        handleParentLogin);
  app.post("/api/auth/mentor/login",        handleMentorLogin);
  app.get("/api/auth/student/:rollNo",      handleStudentLookup);
  app.get("/api/auth/students",             handleGetStudents);
  app.get("/api/auth/verified-students",    handleGetVerifiedStudents);
  app.get("/api/auth/verify/:rollNo",       handleCheckVerified);
  app.get("/api/auth/mentor/:employeeId/students", handleMentorStudents);

  // Legacy login (keep for compatibility)
  app.post("/api/auth/login", (req, res) => {
    const { email, role } = req.body;
    res.json({ token: "demo-token", user: { id: 1, email, role } });
  });

  // Parent dashboard routes
  app.get("/api/parent/overview",           handleParentOverview);
  app.get("/api/parent/trend",              handleParentTrend);
  app.get("/api/parent/alerts",             handleParentAlerts);
  app.patch("/api/parent/alerts/:id/read",  handleMarkAlertRead);
  app.patch("/api/parent/alerts/read-all",  handleMarkAllRead);

  // Settings routes
  app.get("/api/settings/goals",        handleGetGoals);
  app.post("/api/settings/goals",       handleAddGoal);
  app.put("/api/settings/goals/:id",    handleUpdateGoal);
  app.delete("/api/settings/goals/:id", handleDeleteGoal);
  app.get("/api/settings/dates",        handleGetDates);
  app.post("/api/settings/dates",       handleAddDate);
  app.delete("/api/settings/dates/:id", handleDeleteDate);

  // Deadline routes
  app.get("/api/deadlines",              handleGetDeadlines);
  app.post("/api/deadlines",             handleAddDeadline);
  app.put("/api/deadlines/:id",          handleUpdateDeadline);
  app.delete("/api/deadlines/:id",       handleDeleteDeadline);
  app.patch("/api/deadlines/:id/toggle", handleToggleComplete);

  // Resources routes
  app.get("/api/resources/study-tips", handleStudyTips);
  app.get("/api/resources/screen-challenges", handleScreenChallenges);
  app.get("/api/resources/sleep", handleSleepContent);
  app.get("/api/resources/stress-tips", handleStressTips);

  // Nearby help proxy (avoids CORS on Overpass API)
  app.get("/api/nearby", async (req, res) => {
    const { lat, lon, radius = "5000" } = req.query as Record<string, string>;
    if (!lat || !lon) { res.status(400).json({ error: "lat and lon required" }); return; }
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="clinic"](around:${radius},${lat},${lon});
        node["amenity"="doctors"](around:${radius},${lat},${lon});
        node["amenity"="pharmacy"](around:${radius},${lat},${lon});
        node["office"="ngo"](around:${radius},${lat},${lon});
        node["social_facility"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="clinic"](around:${radius},${lat},${lon});
      );
      out center 20;
    `;
    try {
      const r = await fetch("https://overpass-api.de/api/interpreter", {
        method:  "POST",
        body:    `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const data = await r.json();
      res.json(data);
    } catch (e) {
      res.status(502).json({ error: "Overpass API unreachable" });
    }
  });

  // EIRA chatbot routes
  app.post("/api/eira/chat", handleEiraChat);
  app.get("/api/eira/suggestions", handleEiraSuggestions);

  // Burnout routes
  app.post("/api/burnout/predict", handlePredict);
  app.get("/api/burnout/stats", handleStats);

  return app;
}
