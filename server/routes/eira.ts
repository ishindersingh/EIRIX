import { RequestHandler } from "express";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

// ── Intent detection ───────────────────────────────────────────────────────────
const INTENTS: { keywords: string[]; handler: (msg: string) => string }[] = [
  {
    keywords: ["crisis", "suicide", "kill myself", "end my life", "don't want to live", "self harm", "hurt myself"],
    handler: () =>
      "🚨 I'm really concerned about what you just shared. Please reach out to a crisis helpline immediately:\n\n• **iCall (India):** 9152987821\n• **Vandrevala Foundation:** 1860-2662-345 (24/7)\n• **AASRA:** 9820466627\n\nYou are not alone. A trained counselor is ready to help you right now. 💙",
  },
  {
    keywords: ["stress", "stressed", "overwhelmed", "pressure", "too much", "can't handle", "breaking down"],
    handler: () =>
      "I hear you — academic stress can feel crushing. Here are some things that actually help:\n\n🧘 **Right now:** Try box breathing — inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.\n📋 **Today:** Write down every stressor, then circle only what you can control.\n⏱️ **This week:** Break big tasks into 25-min Pomodoro blocks.\n\nWhat's the biggest source of stress for you right now?",
  },
  {
    keywords: ["anxious", "anxiety", "nervous", "panic", "panic attack", "heart racing", "worried", "fear"],
    handler: () =>
      "Anxiety is your brain's alarm system going off — it's uncomfortable but not dangerous. Let's ground you:\n\n**5-4-3-2-1 Technique:**\n👁️ Name 5 things you can see\n✋ 4 things you can touch\n👂 3 things you can hear\n👃 2 things you can smell\n👅 1 thing you can taste\n\nThis interrupts the anxiety loop. Want me to walk you through a breathing exercise too?",
  },
  {
    keywords: ["sad", "depressed", "depression", "hopeless", "empty", "numb", "crying", "worthless", "lonely"],
    handler: () =>
      "I'm really glad you're talking about this. Feeling this way is more common among students than you'd think — you're not broken.\n\n💙 **Immediate:** Reach out to one person you trust today, even just a text.\n🌤️ **Daily:** 10 minutes of sunlight + movement can shift brain chemistry.\n📓 **Try:** Write 3 small things that happened today — not 'good' things, just things.\n\nIf these feelings persist for more than 2 weeks, please speak to a campus counselor. Would you like to talk more about what's going on?",
  },
  {
    keywords: ["sleep", "can't sleep", "insomnia", "tired", "exhausted", "fatigue", "no energy"],
    handler: () =>
      "Sleep deprivation is one of the top burnout accelerators. Here's what the research says works:\n\n🌙 **Tonight:** No screens 30 min before bed. Try the 4-7-8 breathing method.\n⏰ **Consistency:** Same wake time every day — even weekends — resets your circadian rhythm.\n🌡️ **Environment:** Cool room (18-20°C), dark, quiet.\n☕ **Cut caffeine** after 2 PM.\n\nHow many hours are you currently getting? I can give more specific advice.",
  },
  {
    keywords: ["focus", "concentrate", "distracted", "procrastinate", "procrastination", "can't study", "motivation"],
    handler: () =>
      "Focus issues are almost always about energy management, not willpower. Try this:\n\n⏱️ **Pomodoro:** 25 min work → 5 min break. After 4 rounds, take 20 min.\n📵 **Phone:** Put it in another room (not just face-down — out of sight).\n🎯 **Start ritual:** Same desk, same playlist, same drink — trains your brain.\n🧠 **Hardest task first** when your energy is highest (usually morning).\n\nWhat subject or task are you struggling to focus on?",
  },
  {
    keywords: ["burnout", "burned out", "burnt out", "exhausted academically", "done", "give up", "quit"],
    handler: () =>
      "Burnout is real and it's serious — it's not laziness. Signs you're burned out:\n✅ Chronic exhaustion even after rest\n✅ Cynicism about your studies\n✅ Feeling detached or ineffective\n\n**Recovery steps:**\n🛑 **Permission to rest** — guilt-free, scheduled downtime is medicine.\n🔄 **Reduce load** — talk to a professor about extensions if needed.\n🤝 **Connect** — isolation makes burnout worse.\n📊 **Track it** — use the burnout checker on your dashboard.\n\nHow long have you been feeling this way?",
  },
  {
    keywords: ["exam", "test", "assignment", "deadline", "grades", "fail", "failing", "marks"],
    handler: () =>
      "Academic pressure is real. Here's how to approach it strategically:\n\n📚 **Before exam:** Active recall > re-reading. Test yourself, don't just review.\n🗓️ **Deadlines:** Use the 'two-minute rule' — if it takes less than 2 min, do it now.\n😰 **Fear of failing:** One bad grade doesn't define your future. Seriously.\n\n**Quick study tip:** Teach the concept to an imaginary student. If you can explain it simply, you know it.\n\nWhat subject or deadline is worrying you most?",
  },
  {
    keywords: ["friend", "friends", "lonely", "isolated", "social", "relationship", "family", "conflict"],
    handler: () =>
      "Social connection is one of the strongest protective factors against burnout and depression.\n\n🤝 **If you're lonely:** Join one club or study group this week — even online.\n💬 **If there's conflict:** Use 'I feel...' statements instead of 'You always...'\n📱 **If you're isolated:** Schedule one 15-min call with someone you care about.\n\nRemember: quality over quantity. One genuine connection matters more than many shallow ones.\n\nWant to talk about what's happening with your social life?",
  },
  {
    keywords: ["breathe", "breathing", "calm down", "relax", "meditation", "mindfulness"],
    handler: () =>
      "Let's do a quick breathing exercise together right now:\n\n**Box Breathing (4-4-4-4):**\n1. 🫁 Breathe IN slowly for **4 seconds**\n2. ⏸️ HOLD for **4 seconds**\n3. 💨 Breathe OUT for **4 seconds**\n4. ⏸️ HOLD for **4 seconds**\n\nRepeat this 4 times. This activates your parasympathetic nervous system and reduces cortisol within minutes.\n\nTake your time — I'll be here when you're done. 🌿",
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "start", "help"],
    handler: () =>
      "Hi! I'm **EIRA** — your Emotional Intelligence & Relief Assistant 🤖💙\n\nI'm here to support your mental well-being as a student. I can help with:\n\n🧘 Stress & anxiety management\n😴 Sleep improvement tips\n📚 Study focus strategies\n🔥 Burnout recovery\n💬 Just talking things through\n\nWhat's on your mind today?",
  },
  {
    keywords: ["tip", "tips", "advice", "suggestion", "help me", "what should i do"],
    handler: () =>
      "Here are today's top mental health tips for students:\n\n1. 💧 **Hydrate** — even mild dehydration affects mood and focus\n2. 🚶 **Move** — 10 min walk = 2 hours of improved focus\n3. 📵 **Digital detox** — 30 min phone-free before bed\n4. 🙏 **Gratitude** — write 3 specific things you're grateful for\n5. 🤝 **Connect** — text one friend today\n6. 🎯 **One thing** — identify your single most important task\n\nWhich of these would you like to explore more?",
  },
];

const FALLBACK_RESPONSES = [
  "I hear you. Can you tell me a bit more about what you're experiencing? The more you share, the better I can support you.",
  "That sounds really challenging. You're doing the right thing by talking about it. What's been the hardest part?",
  "Thank you for sharing that with me. How long have you been feeling this way?",
  "I want to make sure I understand. Are you talking about academic pressure, emotional stress, or something else?",
  "You're not alone in feeling this way — many students go through similar experiences. What would feel most helpful right now?",
];

let fallbackIndex = 0;

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.keywords.some(kw => lower.includes(kw))) {
      return intent.handler(message);
    }
  }
  const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
  fallbackIndex++;
  return response;
}

// ── Mental health suggestions (sidebar) ───────────────────────────────────────
const DAILY_SUGGESTIONS = [
  { category: "Breathing",  text: "Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s",        emoji: "🫁" },
  { category: "Movement",   text: "A 10-minute walk outside can reset your focus completely",    emoji: "🚶" },
  { category: "Sleep",      text: "Consistent wake time (even weekends) is the #1 sleep hack",  emoji: "😴" },
  { category: "Study",      text: "Active recall beats re-reading by 3x for retention",         emoji: "📚" },
  { category: "Social",     text: "Text one friend today — connection is burnout's antidote",   emoji: "💬" },
  { category: "Mindset",    text: "Name your emotion out loud — it reduces its intensity by 50%",emoji: "🧠" },
  { category: "Nutrition",  text: "Omega-3s (walnuts, fish) directly improve mood and focus",   emoji: "🥗" },
  { category: "Digital",    text: "Phone-free first 30 min after waking sets a calmer day",     emoji: "📵" },
];

// ── Handlers ───────────────────────────────────────────────────────────────────
export const handleEiraChat: RequestHandler = (req, res) => {
  const { message, history = [] } = req.body as { message: string; history: ChatMessage[] };

  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const reply = detectIntent(message.trim());

  // Simulate realistic typing delay based on response length
  const delay = Math.min(500 + reply.length * 8, 2500);

  setTimeout(() => {
    res.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  }, delay);
};

export const handleEiraSuggestions: RequestHandler = (_req, res) => {
  // Return 3 random suggestions
  const shuffled = [...DAILY_SUGGESTIONS].sort(() => Math.random() - 0.5);
  res.json({ suggestions: shuffled.slice(0, 3) });
};
