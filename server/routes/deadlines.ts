import { RequestHandler } from "express";

export interface Deadline {
  id: string;
  title: string;
  subject: string;
  dueDate: string;   // ISO string
  priority: "high" | "low";
  completed: boolean;
  createdAt: string;
}

// In-memory store (replace with DB later)
let deadlines: Deadline[] = [
  {
    id: "1",
    title: "Advanced Calculus Assignment",
    subject: "Mathematics",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Psychology Research Paper",
    subject: "Psychology",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Data Structures Project",
    subject: "Computer Science",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "low",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Physics Lab Report",
    subject: "Physics",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

function getStatus(dueDate: string, completed: boolean): "completed" | "missed" | "near" | "upcoming" {
  if (completed) return "completed";
  const diff = new Date(dueDate).getTime() - Date.now();
  const hours = diff / (1000 * 60 * 60);
  if (diff < 0)    return "missed";
  if (hours <= 48) return "near";
  return "upcoming";
}

function withStatus(d: Deadline) {
  return { ...d, status: getStatus(d.dueDate, d.completed) };
}

export const handleGetDeadlines: RequestHandler = (_req, res) => {
  res.json(deadlines.map(withStatus));
};

export const handleAddDeadline: RequestHandler = (req, res) => {
  const { title, subject, dueDate, priority } = req.body;
  if (!title || !dueDate) { res.status(400).json({ error: "title and dueDate required" }); return; }

  const d: Deadline = {
    id: Date.now().toString(),
    title,
    subject: subject || "General",
    dueDate,
    priority: priority === "high" ? "high" : "low",
    completed: false,
    createdAt: new Date().toISOString(),
  };
  deadlines.push(d);
  res.status(201).json(withStatus(d));
};

export const handleUpdateDeadline: RequestHandler = (req, res) => {
  const { id } = req.params;
  const idx = deadlines.findIndex(d => d.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  deadlines[idx] = { ...deadlines[idx], ...req.body, id };
  res.json(withStatus(deadlines[idx]));
};

export const handleDeleteDeadline: RequestHandler = (req, res) => {
  const { id } = req.params;
  deadlines = deadlines.filter(d => d.id !== id);
  res.json({ success: true });
};

export const handleToggleComplete: RequestHandler = (req, res) => {
  const { id } = req.params;
  const idx = deadlines.findIndex(d => d.id === id);
  if (idx === -1) { res.status(404).json({ error: "Not found" }); return; }
  deadlines[idx].completed = !deadlines[idx].completed;
  res.json(withStatus(deadlines[idx]));
};
