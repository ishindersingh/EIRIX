import { RequestHandler } from "express";

// ── Goals ──────────────────────────────────────────────────────────────────────
export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: "academic" | "health" | "personal";
  createdAt: string;
}

let goals: Goal[] = [
  { id: "1", title: "Complete assignments on time", target: 10, current: 6,  unit: "tasks",   category: "academic", createdAt: new Date().toISOString() },
  { id: "2", title: "Sleep 7+ hours daily",         target: 30, current: 18, unit: "days",    category: "health",   createdAt: new Date().toISOString() },
  { id: "3", title: "Read 1 chapter per day",       target: 20, current: 9,  unit: "chapters",category: "personal", createdAt: new Date().toISOString() },
];

export const handleGetGoals: RequestHandler    = (_req, res) => res.json(goals);
export const handleAddGoal: RequestHandler     = (req, res) => {
  const g: Goal = { ...req.body, id: Date.now().toString(), current: 0, createdAt: new Date().toISOString() };
  goals.push(g);
  res.status(201).json(g);
};
export const handleUpdateGoal: RequestHandler  = (req, res) => {
  const idx = goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  goals[idx] = { ...goals[idx], ...req.body, id: req.params.id };
  res.json(goals[idx]);
};
export const handleDeleteGoal: RequestHandler  = (req, res) => {
  goals = goals.filter(g => g.id !== req.params.id);
  res.json({ success: true });
};

// ── Important Dates ────────────────────────────────────────────────────────────
export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: "exam" | "event" | "deadline" | "holiday";
  note: string;
}

let importantDates: ImportantDate[] = [
  { id: "1", title: "Mid-Semester Exams",    date: new Date(Date.now() + 5  * 86400000).toISOString().split("T")[0], type: "exam",     note: "Covers chapters 1-6" },
  { id: "2", title: "Science Fair",          date: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0], type: "event",    note: "Submit project by 9 AM" },
  { id: "3", title: "Final Exams",           date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], type: "exam",     note: "All subjects" },
  { id: "4", title: "College Foundation Day",date: new Date(Date.now() + 20 * 86400000).toISOString().split("T")[0], type: "holiday",  note: "No classes" },
];

export const handleGetDates: RequestHandler   = (_req, res) => res.json(importantDates.sort((a, b) => a.date.localeCompare(b.date)));
export const handleAddDate: RequestHandler    = (req, res) => {
  const d: ImportantDate = { ...req.body, id: Date.now().toString() };
  importantDates.push(d);
  res.status(201).json(d);
};
export const handleDeleteDate: RequestHandler = (req, res) => {
  importantDates = importantDates.filter(d => d.id !== req.params.id);
  res.json({ success: true });
};
