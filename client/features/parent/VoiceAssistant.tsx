import { useState, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en-US", label: "English",  short: "EN" },
  { code: "hi-IN", label: "Hindi",    short: "HI" },
  { code: "pa-IN", label: "Punjabi",  short: "PA" },
];

// AI response generator based on student data + query
function generateResponse(query: string, studentRollNo: string, lang: string): string {
  const lower = query.toLowerCase();

  const responses: Record<string, Record<string, string>> = {
    "en-US": {
      burnout:     `Based on the latest assessment, your child (Roll No: ${studentRollNo}) has submitted a burnout report. Please check the dashboard for the detailed score and risk level.`,
      stress:      `Your child's stress levels have been tracked. High stress is indicated when the score exceeds 7 out of 10. Please encourage rest and balanced study time.`,
      sleep:       `Sleep data shows your child may not be getting adequate rest. Recommended sleep for students is 7-9 hours per night.`,
      performance: `Academic performance is linked to burnout levels. A lower burnout score indicates better focus and retention. Check the trend graph for weekly progress.`,
      default:     `I can help you with information about your child's burnout score, stress levels, sleep patterns, and academic performance. What would you like to know?`,
    },
    "hi-IN": {
      burnout:     `नवीनतम मूल्यांकन के आधार पर, आपके बच्चे (रोल नं: ${studentRollNo}) ने बर्नआउट रिपोर्ट जमा की है। विस्तृत स्कोर के लिए डैशबोर्ड देखें।`,
      stress:      `आपके बच्चे का तनाव स्तर ट्रैक किया गया है। 7 से अधिक स्कोर उच्च तनाव दर्शाता है। आराम और संतुलित अध्ययन समय को प्रोत्साहित करें।`,
      sleep:       `नींद के आंकड़े बताते हैं कि आपके बच्चे को पर्याप्त आराम नहीं मिल रहा। छात्रों के लिए 7-9 घंटे की नींद आवश्यक है।`,
      performance: `शैक्षणिक प्रदर्शन बर्नआउट स्तर से जुड़ा है। कम बर्नआउट स्कोर बेहतर ध्यान दर्शाता है।`,
      default:     `मैं आपके बच्चे के बर्नआउट स्कोर, तनाव स्तर, नींद और शैक्षणिक प्रदर्शन के बारे में जानकारी दे सकता हूं।`,
    },
    "pa-IN": {
      burnout:     `ਤਾਜ਼ਾ ਮੁਲਾਂਕਣ ਦੇ ਆਧਾਰ 'ਤੇ, ਤੁਹਾਡੇ ਬੱਚੇ (ਰੋਲ ਨੰ: ${studentRollNo}) ਨੇ ਬਰਨਆਊਟ ਰਿਪੋਰਟ ਜਮ੍ਹਾ ਕੀਤੀ ਹੈ। ਵਿਸਤ੍ਰਿਤ ਸਕੋਰ ਲਈ ਡੈਸ਼ਬੋਰਡ ਦੇਖੋ।`,
      stress:      `ਤੁਹਾਡੇ ਬੱਚੇ ਦਾ ਤਣਾਅ ਪੱਧਰ ਟਰੈਕ ਕੀਤਾ ਗਿਆ ਹੈ। 7 ਤੋਂ ਵੱਧ ਸਕੋਰ ਉੱਚ ਤਣਾਅ ਦਰਸਾਉਂਦਾ ਹੈ।`,
      sleep:       `ਨੀਂਦ ਦੇ ਅੰਕੜੇ ਦੱਸਦੇ ਹਨ ਕਿ ਤੁਹਾਡੇ ਬੱਚੇ ਨੂੰ ਲੋੜੀਂਦਾ ਆਰਾਮ ਨਹੀਂ ਮਿਲ ਰਿਹਾ। 7-9 ਘੰਟੇ ਦੀ ਨੀਂਦ ਜ਼ਰੂਰੀ ਹੈ।`,
      performance: `ਅਕਾਦਮਿਕ ਪ੍ਰਦਰਸ਼ਨ ਬਰਨਆਊਟ ਪੱਧਰ ਨਾਲ ਜੁੜਿਆ ਹੈ। ਘੱਟ ਬਰਨਆਊਟ ਸਕੋਰ ਬਿਹਤਰ ਧਿਆਨ ਦਰਸਾਉਂਦਾ ਹੈ।`,
      default:     `ਮੈਂ ਤੁਹਾਡੇ ਬੱਚੇ ਦੇ ਬਰਨਆਊਟ ਸਕੋਰ, ਤਣਾਅ ਪੱਧਰ, ਨੀਂਦ ਅਤੇ ਅਕਾਦਮਿਕ ਪ੍ਰਦਰਸ਼ਨ ਬਾਰੇ ਜਾਣਕਾਰੀ ਦੇ ਸਕਦਾ ਹਾਂ।`,
    },
  };

  const langResponses = responses[lang] ?? responses["en-US"];
  if (lower.includes("burnout") || lower.includes("score"))       return langResponses.burnout;
  if (lower.includes("stress") || lower.includes("tension"))      return langResponses.stress;
  if (lower.includes("sleep") || lower.includes("rest"))          return langResponses.sleep;
  if (lower.includes("performance") || lower.includes("study"))   return langResponses.performance;
  return langResponses.default;
}

// Text to speech using Web Speech API
function speak(text: string, lang: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter    = new SpeechSynthesisUtterance(text);
  utter.lang     = lang;
  utter.rate     = 0.9;
  utter.pitch    = 1;
  const voices   = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.startsWith(lang.split("-")[0]));
  if (preferred) utter.voice = preferred;
  window.speechSynthesis.speak(utter);
}

interface Props { studentRollNo: string }

export default function VoiceAssistant({ studentRollNo }: Props) {
  const [lang,       setLang]       = useState("en-US");
  const [listening,  setListening]  = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response,   setResponse]   = useState("");
  const [processing, setProcessing] = useState(false);
  const [speaking,   setSpeaking]   = useState(false);
  const [error,      setError]      = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    setError("");
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition() as any as any;
    recognition.lang           = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);
    recognition.onerror  = (e: any) => { setListening(false); setError(`Mic error: ${e.error}`); };

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
      setProcessing(true);
      // Generate AI response
      setTimeout(() => {
        const reply = generateResponse(text, studentRollNo, lang);
        setResponse(reply);
        setProcessing(false);
      }, 800);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const playResponse = () => {
    if (!response) return;
    setSpeaking(true);
    speak(response, lang);
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking) { setSpeaking(false); clearInterval(check); }
    }, 500);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div className="space-y-4">
      {/* Language selector */}
      <div className="flex items-center gap-3">
        <Globe className="w-4 h-4 text-purple-500 shrink-0" />
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Language:</span>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                lang === l.code ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/30")}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center gap-4 py-4">
        <button
          onClick={listening ? stopListening : startListening}
          disabled={processing}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 text-white",
            listening
              ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse"
              : "bg-gradient-to-br from-purple-500 to-pink-600 hover:scale-105"
          )}
        >
          {listening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {listening ? "Listening... tap to stop" : processing ? "Processing..." : "Tap to speak"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">You said:</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 italic">"{transcript}"</p>
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-2xl">
          <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
          <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Generating AI response...</p>
        </div>
      )}

      {/* AI Response */}
      {response && !processing && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl border border-purple-100 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">AI Response:</p>
            <button
              onClick={speaking ? stopSpeaking : playResponse}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                speaking ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400" : "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-950/60")}>
              {speaking ? <><VolumeX className="w-3.5 h-3.5" />Stop</> : <><Volume2 className="w-3.5 h-3.5" />Play</>}
            </button>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{response}</p>
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Voice assistant uses your device microphone. Speak clearly in the selected language.
      </p>
    </div>
  );
}
