import { RequestHandler } from "express";

// ── Study Tips ─────────────────────────────────────────────────────────────────
const STUDY_TIPS = [
  { tip: "Use active recall — close your notes and write everything you remember", category: "Memory",      icon: "🧠" },
  { tip: "Spaced repetition: review material at 1 day, 3 days, 1 week, 1 month",  category: "Retention",   icon: "📅" },
  { tip: "Teach the concept to an imaginary student — if you can explain it, you know it", category: "Understanding", icon: "🎓" },
  { tip: "Study in 25-min Pomodoro blocks with 5-min breaks",                     category: "Focus",       icon: "⏱️" },
  { tip: "Handwrite key formulas — motor memory reinforces learning",              category: "Memory",      icon: "✍️" },
  { tip: "Study the hardest subject first when your energy is highest",            category: "Productivity",icon: "⚡" },
  { tip: "Use the Feynman Technique: simplify complex topics into plain language", category: "Understanding",icon: "💡" },
  { tip: "Create mind maps to connect concepts visually",                          category: "Organization",icon: "🗺️" },
  { tip: "Eliminate phone notifications during study blocks",                      category: "Focus",       icon: "📵" },
  { tip: "Review notes within 24 hours of a lecture to retain 80% more",          category: "Retention",   icon: "📖" },
];

// ── Screen Time Challenges ─────────────────────────────────────────────────────
const SCREEN_CHALLENGES = [
  { id: 1, title: "Phone-Free Morning",    desc: "No phone for the first 30 minutes after waking",    duration: "30 min", difficulty: "Easy",   points: 10 },
  { id: 2, title: "No Social Media",       desc: "Zero social media for the entire day",               duration: "1 day",  difficulty: "Medium", points: 30 },
  { id: 3, title: "Screen Sunset",         desc: "No screens 1 hour before bedtime for 3 days",        duration: "3 days", difficulty: "Medium", points: 40 },
  { id: 4, title: "Study Mode",            desc: "Phone in another room during every study session",   duration: "1 week", difficulty: "Hard",   points: 70 },
  { id: 5, title: "Grayscale Day",         desc: "Set your phone to grayscale for 24 hours",           duration: "1 day",  difficulty: "Easy",   points: 15 },
  { id: 6, title: "App Detox",             desc: "Delete one social media app for 7 days",             duration: "7 days", difficulty: "Hard",   points: 100},
];

// ── Sleep Tips ─────────────────────────────────────────────────────────────────
const SLEEP_TIPS = [
  { tip: "Keep the same wake time every day — even weekends",                      category: "Consistency", icon: "⏰" },
  { tip: "Keep your room cool (18–20°C) — body temperature drop triggers sleep",  category: "Environment", icon: "🌡️" },
  { tip: "No caffeine after 2 PM — it has a 6-hour half-life in your body",       category: "Nutrition",   icon: "☕" },
  { tip: "Try the 4-7-8 breathing method: inhale 4s, hold 7s, exhale 8s",        category: "Relaxation",  icon: "🫁" },
  { tip: "Dim lights 1 hour before bed — blue light suppresses melatonin",        category: "Environment", icon: "💡" },
  { tip: "Write tomorrow's to-do list before bed to offload mental load",         category: "Mental",      icon: "📝" },
  { tip: "Avoid heavy meals within 3 hours of sleep",                             category: "Nutrition",   icon: "🍽️" },
  { tip: "A consistent pre-sleep routine trains your brain to wind down",         category: "Routine",     icon: "🌙" },
];

// ── Sleep Routine ──────────────────────────────────────────────────────────────
const SLEEP_ROUTINE = [
  { time: "9:00 PM",  action: "Stop studying — switch to light reading or journaling",  icon: "📖" },
  { time: "9:30 PM",  action: "Dim all lights, put phone on Do Not Disturb",            icon: "📵" },
  { time: "9:45 PM",  action: "Warm shower or wash face — signals body to cool down",   icon: "🚿" },
  { time: "10:00 PM", action: "Write tomorrow's top 3 tasks in a notebook",             icon: "📝" },
  { time: "10:15 PM", action: "4-7-8 breathing exercise (3 rounds)",                    icon: "🫁" },
  { time: "10:30 PM", action: "Lights out — same time every night",                     icon: "🌙" },
];

// ── Stress Relief Tips ─────────────────────────────────────────────────────────
const STRESS_TIPS = [
  { tip: "Name your emotion out loud — labeling reduces its intensity by 50%",    icon: "🏷️" },
  { tip: "5-4-3-2-1 grounding: 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste", icon: "🌿" },
  { tip: "10-minute walk outside resets cortisol levels",                         icon: "🚶" },
  { tip: "Cold water on your face activates the dive reflex — instant calm",      icon: "💧" },
  { tip: "Progressive muscle relaxation: tense and release each muscle group",    icon: "💪" },
  { tip: "Journaling for 10 minutes externalizes worry and reduces anxiety",      icon: "📓" },
];

// ── Handlers ───────────────────────────────────────────────────────────────────
export const handleStudyTips: RequestHandler = (_req, res) => {
  res.json({ tips: STUDY_TIPS });
};

export const handleScreenChallenges: RequestHandler = (_req, res) => {
  res.json({ challenges: SCREEN_CHALLENGES });
};

export const handleSleepContent: RequestHandler = (_req, res) => {
  res.json({ tips: SLEEP_TIPS, routine: SLEEP_ROUTINE });
};

export const handleStressTips: RequestHandler = (_req, res) => {
  res.json({ tips: STRESS_TIPS });
};
