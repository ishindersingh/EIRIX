import { RequestHandler } from "express";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface StudentMetrics {
  sleep: number;
  study: number;
  stress: number;
  screen: number;
  attendance: number;
  cgpa: number;
  mood: string;
  social: number;
  motivation: number;
  physical_activity: number;
}

export interface BurnoutSummary {
  score: number;
  level: "low" | "moderate" | "high";
  confidence: number;
  lastUpdated: string;
  change: number; // vs yesterday
}

export interface TrendPoint {
  day: string;
  score: number;
  sleep: number;
  stress: number;
}

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  time: string;
  read: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  course: string;
  year: string;
  avatar: string;
  email: string;
  phone: string;
}

// ── In-memory store ────────────────────────────────────────────────────────────
const STUDENT: StudentProfile = {
  id:     "s1",
  name:   "Alex Johnson",
  age:    20,
  course: "BTech Computer Science",
  year:   "2nd Year",
  avatar: "AJ",
  email:  "alex.johnson@university.edu",
  phone:  "+91 98765 43210",
};

const METRICS: StudentMetrics = {
  sleep:             5.2,
  study:             8.5,
  stress:            8,
  screen:            7,
  attendance:        68,
  cgpa:              7.1,
  mood:              "Low",
  social:            3,
  motivation:        4,
  physical_activity: 0.5,
};

const BURNOUT: BurnoutSummary = {
  score:       72,
  level:       "high",
  confidence:  87,
  lastUpdated: new Date(Date.now() - 2 * 3600000).toISOString(),
  change:      +7,   // went up 7 pts since yesterday
};

const TREND: TrendPoint[] = [
  { day: "Mon", score: 45, sleep: 7.0, stress: 5 },
  { day: "Tue", score: 52, sleep: 6.5, stress: 6 },
  { day: "Wed", score: 58, sleep: 6.0, stress: 7 },
  { day: "Thu", score: 65, sleep: 5.5, stress: 7 },
  { day: "Fri", score: 70, sleep: 5.2, stress: 8 },
  { day: "Sat", score: 68, sleep: 5.8, stress: 7 },
  { day: "Sun", score: 72, sleep: 5.2, stress: 8 },
];

let ALERTS: Alert[] = [
  { id: "a1", type: "critical", message: "Burnout score reached 72 — high risk zone entered",          time: "2 hours ago",  read: false },
  { id: "a2", type: "warning",  message: "Sleep below 6h for 4 consecutive days",                      time: "Yesterday",    read: false },
  { id: "a3", type: "warning",  message: "Stress level reported at 8/10 — above safe threshold",       time: "Yesterday",    read: true  },
  { id: "a4", type: "info",     message: "Attendance dropped to 68% this month",                       time: "3 days ago",   read: true  },
  { id: "a5", type: "info",     message: "Screen time averaging 7h/day this week",                     time: "4 days ago",   read: true  },
];

// ── Insight generator ──────────────────────────────────────────────────────────
function generateInsight(m: StudentMetrics, b: BurnoutSummary): string {
  if (m.sleep < 5)
    return `${STUDENT.name}'s sleep has critically dropped to ${m.sleep}h — the primary driver of the ${b.score}% burnout score. Sleep deprivation compounds stress and impairs academic performance.`;
  if (m.stress >= 8)
    return `Stress is at ${m.stress}/10 with only ${m.sleep}h of sleep. This combination is a strong predictor of academic burnout. Immediate parental support and reduced workload are recommended.`;
  if (m.attendance < 70)
    return `Attendance has fallen to ${m.attendance}% — a key early warning sign. Combined with a burnout score of ${b.score}%, ${STUDENT.name} may be disengaging from academics.`;
  if (b.level === "high")
    return `Multiple risk factors are compounding for ${STUDENT.name}. The ${b.score}% burnout score reflects patterns seen in students before academic crisis. Proactive intervention now can prevent escalation.`;
  if (b.level === "moderate")
    return `${STUDENT.name} is in the warning zone at ${b.score}%. Sleep and screen time are the key levers — small improvements this week can bring the score down significantly.`;
  return `${STUDENT.name} is maintaining a healthy balance with a ${b.score}% burnout score. Continue encouraging current habits and monitor weekly.`;
}

function generateRecommendations(m: StudentMetrics, b: BurnoutSummary): string[] {
  const recs: string[] = [];
  if (m.sleep < 6)   recs.push(`Encourage ${STUDENT.name} to sleep before 10:30 PM — even 1 extra hour makes a measurable difference`);
  if (m.stress >= 7) recs.push("Schedule a relaxed family activity this weekend to decompress");
  if (m.screen >= 6) recs.push("Suggest a 2-hour phone-free window each evening after 9 PM");
  if (m.attendance < 75) recs.push("Have a gentle conversation about attendance — avoid pressure, focus on support");
  if (m.social <= 3) recs.push("Encourage one social activity this week — isolation worsens burnout");
  if (b.level === "high") recs.push("Consider contacting the college counselor or student welfare office");
  recs.push("Send a short check-in message today — emotional connection is the strongest protective factor");
  return recs.slice(0, 5);
}

// ── Handlers ──────────────────────────────────────────────────────────────────
export const handleParentOverview: RequestHandler = (_req, res) => {
  res.json({
    student:         STUDENT,
    burnout:         BURNOUT,
    metrics:         METRICS,
    trend:           TREND,
    insight:         generateInsight(METRICS, BURNOUT),
    recommendations: generateRecommendations(METRICS, BURNOUT),
    alerts:          ALERTS,
    unreadCount:     ALERTS.filter(a => !a.read).length,
  });
};

export const handleParentTrend: RequestHandler = (_req, res) => {
  res.json({ trend: TREND });
};

export const handleParentAlerts: RequestHandler = (_req, res) => {
  res.json({ alerts: ALERTS, unreadCount: ALERTS.filter(a => !a.read).length });
};

export const handleMarkAlertRead: RequestHandler = (req, res) => {
  const { id } = req.params;
  ALERTS = ALERTS.map(a => a.id === id ? { ...a, read: true } : a);
  res.json({ success: true });
};

export const handleMarkAllRead: RequestHandler = (_req, res) => {
  ALERTS = ALERTS.map(a => ({ ...a, read: true }));
  res.json({ success: true });
};
