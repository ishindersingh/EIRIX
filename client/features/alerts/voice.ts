// ── Load voices async (browsers load them lazily) ─────────────────────────────
function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      resolve(window.speechSynthesis.getVoices());
    }, { once: true });
    // Fallback if event never fires
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

// ── Speak ──────────────────────────────────────────────────────────────────────
export async function speak(text: string, rate = 0.92, pitch = 1.05) {
  if (!("speechSynthesis" in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate   = rate;
  utter.pitch  = pitch;
  utter.volume = 1;
  utter.lang   = "en-US";

  // Wait for voices to load then pick best English voice
  const voices = await getVoicesAsync();
  const preferred =
    voices.find(v => v.name.includes("Google US English")) ||
    voices.find(v => v.lang === "en-US" && v.localService) ||
    voices.find(v => v.lang.startsWith("en-US")) ||
    voices.find(v => v.lang.startsWith("en")) ||
    voices[0];

  if (preferred) utter.voice = preferred;

  // Chrome bug: long utterances get cut off — keep synthesis alive
  const keepAlive = setInterval(() => {
    if (!window.speechSynthesis.speaking) { clearInterval(keepAlive); return; }
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 10000);

  utter.onend = () => clearInterval(keepAlive);
  utter.onerror = () => clearInterval(keepAlive);

  window.speechSynthesis.speak(utter);
}

// ── Browser Notification ───────────────────────────────────────────────────────
export async function notify(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

// ── Combined alert ─────────────────────────────────────────────────────────────
export function alertDeadline(taskTitle: string, status: "near" | "missed") {
  if (status === "missed") {
    speak(`Deadline missed! ${taskTitle} was due and has not been completed.`, 0.88, 1.0);
    notify("Deadline Missed", `${taskTitle} is overdue!`);
  } else {
    speak(`Reminder! ${taskTitle} is due within 48 hours. Please complete it soon.`, 0.92, 1.05);
    notify("Deadline Near", `${taskTitle} is due soon!`);
  }
}

// ── Periodic checker ───────────────────────────────────────────────────────────
let checkerInterval: ReturnType<typeof setInterval> | null = null;

export function startDeadlineChecker(
  getDeadlines: () => Array<{ title: string; status: string }>,
  intervalMs = 60 * 60 * 1000
) {
  if (checkerInterval) clearInterval(checkerInterval);
  checkerInterval = setInterval(() => {
    getDeadlines().forEach(d => {
      if (d.status === "near")   alertDeadline(d.title, "near");
      if (d.status === "missed") alertDeadline(d.title, "missed");
    });
  }, intervalMs);
}

export function stopDeadlineChecker() {
  if (checkerInterval) { clearInterval(checkerInterval); checkerInterval = null; }
}
