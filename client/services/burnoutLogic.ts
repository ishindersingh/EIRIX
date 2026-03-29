export interface PredictInput {
  sleep_hours: number;
  study_hours: number;
  stress_level: number;
  assignment_load: number;
  mood: string;
  social_activity: number;
  screen_time: number;
  motivation_level: number;
}

export interface PredictResult {
  burnout_score: number;
  risk_level: "low" | "moderate" | "high";
  confidence: number;
  recommendations: string[];
  insights: string;
}

export interface HistoryEntry {
  day: string;
  score: number;
}

export interface DatasetStats {
  total: number;
  distribution: { low: number; moderate: number; high: number };
  averages: {
    sleep: number;
    study: number;
    screen: number;
    anxiety: number;
    cgpa: number;
    attendance: number;
  };
}

export async function predictBurnout(input: PredictInput): Promise<PredictResult> {
  const res = await fetch("/api/burnout/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const res = await fetch("/api/burnout/history");
  if (!res.ok) throw new Error("History fetch failed");
  return res.json();
}

export async function fetchStats(): Promise<DatasetStats> {
  const res = await fetch("/api/burnout/stats");
  if (!res.ok) throw new Error("Stats fetch failed");
  return res.json();
}
