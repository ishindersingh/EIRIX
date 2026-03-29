import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Dataset types ──────────────────────────────────────────────────────────────
interface DataRow {
  study: number;
  sleep: number;
  screen: number;
  stress: number;   // 0=Low 1=Medium 2=High
  anxiety: number;
  depression: number;
  academic_pressure: number;
  financial_stress: number;
  social_support: number;
  physical_activity: number;
  sleep_quality: number; // 0=Poor 1=Average 2=Good
  attendance: number;
  cgpa: number;
  label: number; // 0=Low 1=Moderate 2=High
}

// ── Load & parse CSV once at startup ──────────────────────────────────────────
function parseStress(s: string): number {
  if (s === "High") return 2;
  if (s === "Medium") return 1;
  return 0;
}
function parseSleepQuality(s: string): number {
  if (s === "Good") return 2;
  if (s === "Average") return 1;
  return 0;
}
function parseLabel(s: string): number {
  if (s === "High") return 2;
  if (s === "Moderate") return 1;
  return 0;
}

let dataset: DataRow[] = [];
let featureMins: number[] = [];
let featureMaxs: number[] = [];

function loadDataset() {
  const csvPath = path.resolve(
    __dirname,
    process.env.NODE_ENV === "production"
      ? "../../public/data/student.csv"
      : "../../public/data/student.csv"
  );
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter(l => l.trim() && !l.startsWith("student_id"));

  dataset = lines.map(line => {
    const c = line.split(",");
    return {
      study:             parseFloat(c[5])  || 0,
      sleep:             parseFloat(c[6])  || 0,
      screen:            parseFloat(c[7])  || 0,
      stress:            parseStress(c[8]?.trim()),
      anxiety:           parseFloat(c[9])  || 0,
      depression:        parseFloat(c[10]) || 0,
      academic_pressure: parseFloat(c[11]) || 0,
      financial_stress:  parseFloat(c[12]) || 0,
      social_support:    parseFloat(c[13]) || 0,
      physical_activity: parseFloat(c[14]) || 0,
      sleep_quality:     parseSleepQuality(c[15]?.trim()),
      attendance:        parseFloat(c[16]) || 0,
      cgpa:              parseFloat(c[17]) || 0,
      label:             parseLabel(c[19]?.trim()),
    };
  }).filter(r => !isNaN(r.study));

  // Compute min/max for normalization using loops (spread on 150k rows causes stack overflow)
  const keys: (keyof Omit<DataRow, "label">)[] = [
    "study","sleep","screen","stress","anxiety","depression",
    "academic_pressure","financial_stress","social_support",
    "physical_activity","sleep_quality","attendance","cgpa"
  ];
  featureMins = keys.map(k => {
    let min = Infinity;
    for (const r of dataset) { const v = r[k] as number; if (v < min) min = v; }
    return min;
  });
  featureMaxs = keys.map(k => {
    let max = -Infinity;
    for (const r of dataset) { const v = r[k] as number; if (v > max) max = v; }
    return max;
  });

  console.log(`[Burnout] Dataset loaded: ${dataset.length} records`);
}

loadDataset();

// ── Normalize a feature vector ─────────────────────────────────────────────────
function normalize(v: number[]): number[] {
  return v.map((x, i) => {
    const range = featureMaxs[i] - featureMins[i];
    return range === 0 ? 0 : (x - featureMins[i]) / range;
  });
}

// ── Euclidean distance ─────────────────────────────────────────────────────────
function distance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0));
}

// ── k-NN predict (k=15) ────────────────────────────────────────────────────────
function knnPredict(features: number[], k = 15): { label: number; confidence: number } {
  const norm = normalize(features);
  const distances = dataset.map(row => {
    const rowVec = normalize([
      row.study, row.sleep, row.screen, row.stress, row.anxiety,
      row.depression, row.academic_pressure, row.financial_stress,
      row.social_support, row.physical_activity, row.sleep_quality,
      row.attendance, row.cgpa
    ]);
    return { label: row.label, dist: distance(norm, rowVec) };
  });

  distances.sort((a, b) => a.dist - b.dist);
  const neighbors = distances.slice(0, k);

  const votes = [0, 0, 0];
  neighbors.forEach(n => votes[n.label]++);
  const label = votes.indexOf(Math.max(...votes));
  const confidence = Math.round((votes[label] / k) * 100);
  return { label, confidence };
}

// ── Map label → score range ────────────────────────────────────────────────────
function labelToScore(label: number, features: number[]): number {
  const [study, sleep, screen, stress, anxiety, depression,
         academic_pressure, , social_support, physical_activity] = features;

  // Fine-grained score within the label's band
  let base = label === 2 ? 75 : label === 1 ? 45 : 15;
  let delta = 0;
  delta += (stress / 2) * 8;
  delta += (anxiety / 10) * 5;
  delta += (depression / 10) * 5;
  delta += (academic_pressure / 10) * 4;
  delta -= (sleep / 12) * 6;
  delta -= (social_support / 10) * 3;
  delta -= (physical_activity / 5) * 3;
  delta += (screen / 16) * 4;

  const score = Math.round(Math.max(5, Math.min(98, base + delta)));
  return score;
}

// ── Dataset stats endpoint ─────────────────────────────────────────────────────
export const handleStats: RequestHandler = (_req, res) => {
  const total = dataset.length;
  const low    = dataset.filter(r => r.label === 0).length;
  const moderate = dataset.filter(r => r.label === 1).length;
  const high   = dataset.filter(r => r.label === 2).length;

  const avg = (key: keyof Omit<DataRow, "label">) =>
    Math.round((dataset.reduce((s, r) => s + (r[key] as number), 0) / total) * 10) / 10;

  res.json({
    total,
    distribution: { low, moderate, high },
    averages: {
      sleep: avg("sleep"),
      study: avg("study"),
      screen: avg("screen"),
      anxiety: avg("anxiety"),
      cgpa: avg("cgpa"),
      attendance: avg("attendance"),
    }
  });
};

// ── Predict endpoint ───────────────────────────────────────────────────────────
export const handlePredict: RequestHandler = (req, res) => {
  const {
    sleep_hours,
    study_hours,
    stress_level,   // 0-10 from slider → map to 0/1/2
    assignment_load,
    mood,
    social_activity,
    screen_time,
    motivation_level,
    anxiety_score = 5,
    depression_score = 5,
    physical_activity = 1.5,
    attendance = 75,
    cgpa = 7.0,
    sleep_quality = 1,
  } = req.body;

  // Map slider stress (1-10) → Low/Medium/High
  const stressEncoded = stress_level >= 7 ? 2 : stress_level >= 4 ? 1 : 0;
  // Map mood to depression proxy
  const moodMap: Record<string, number> = {
    "Excellent": 1, "Good": 2, "Neutral": 5, "Low": 7, "Very Low": 9
  };
  const depressionProxy = moodMap[mood] ?? depression_score;
  // Map motivation (1-10) → social proxy
  const socialProxy = (social_activity + motivation_level) / 2;

  const features = [
    study_hours,
    sleep_hours,
    screen_time,
    stressEncoded,
    anxiety_score,
    depressionProxy,
    assignment_load,
    3, // financial_stress default
    socialProxy,
    physical_activity,
    sleep_quality,
    attendance,
    cgpa,
  ];

  const { label, confidence } = knnPredict(features);
  const score = labelToScore(label, features);
  const levelMap = ["low", "moderate", "high"] as const;
  const level = levelMap[label];

  setTimeout(() => {
    res.json({
      burnout_score: score,
      risk_level: level,
      confidence,
      recommendations: getRecommendations(level, score),
      insights: getInsights(level, score, sleep_hours, stress_level, mood),
    });
  }, 800);
};

// ── Real per-user history store ──────────────────────────────────────────────────────────────
interface HistoryEntry {
  rollNo:    string;
  day:       string;
  date:      string;
  score:     number;
  level:     string;
  insight:   string;
}

// Map of rollNo -> last 20 entries
const historyStore = new Map<string, HistoryEntry[]>();

export const handleSaveHistory: RequestHandler = (req, res) => {
  const { rollNo, score, level, insight } = req.body;
  const key   = rollNo || "guest";
  const prev  = historyStore.get(key) ?? [];
  const entry: HistoryEntry = {
    rollNo: key,
    day:    new Date().toLocaleDateString("en-US", { weekday: "short" }),
    date:   new Date().toISOString(),
    score,
    level,
    insight,
  };
  const updated = [...prev.slice(-19), entry];
  historyStore.set(key, updated);
  res.json({ success: true, history: updated });
};

export const handleGetHistory: RequestHandler = (req, res) => {
  const rollNo = (req.query.rollNo as string) || "guest";
  const entries = historyStore.get(rollNo) ?? [];
  res.json(entries.map(e => ({ day: e.day, score: e.score, level: e.level, date: e.date, insight: e.insight })));
};

function getRecommendations(level: string, score: number): string[] {
  if (level === "high") return [
    "Schedule an urgent 1-on-1 with your mentor",
    "Take a complete 24-hour study break immediately",
    "Prioritize 8+ hours of sleep tonight",
    "Try a 10-minute guided breathing exercise",
    "Visit the campus wellness center this week",
  ];
  if (level === "moderate") return [
    "Use the Pomodoro technique (25 min study / 5 min break)",
    "Limit non-essential screen time to under 3 hours",
    "Spend 30 minutes outdoors today",
    "Check in with a friend or family member",
    "Review and reprioritize your upcoming deadlines",
  ];
  return [
    "Keep up your excellent balance!",
    "Plan a fun social activity this weekend",
    "Maintain your current sleep schedule",
    "Consider helping a peer who may be struggling",
  ];
}

function getInsights(level: string, score: number, sleep: number, stress: number, mood: string): string {
  if (sleep < 5) return `Your sleep deficit (${sleep}h) is the primary burnout driver. Even one extra hour tonight can reduce your score significantly.`;
  if (stress >= 8) return `Extreme stress (${stress}/10) without adequate recovery is pushing your burnout score to ${score}. Immediate decompression is critical.`;
  if (mood === "Very Low" || mood === "Low") return `Your mood is a strong burnout signal. Emotional exhaustion often precedes academic burnout — prioritize self-care today.`;
  if (level === "high") return `Multiple risk factors are compounding. Your ${score}% score reflects a pattern seen in students before academic crisis. Act now.`;
  if (level === "moderate") return `You're in the warning zone at ${score}%. Small consistent changes — better sleep, fewer screens — can bring this down within a week.`;
  return `Great balance! Your ${score}% score reflects healthy habits. Keep monitoring weekly to stay ahead of burnout.`;
}
