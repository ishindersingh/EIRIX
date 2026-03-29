import { Moon, BookOpen, AlertTriangle, Smile, Activity, Heart, Monitor, BrainCircuit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PredictInput } from "../services/burnoutLogic";

interface Props {
  values: PredictInput;
  onChange: (key: keyof PredictInput, value: number | string) => void;
  onSubmit: () => void;
  loading: boolean;
}

const sliders = [
  { key: "sleep_hours",     icon: Moon,        color: "blue",    label: "Sleep Hours",      min: 0,  max: 12, step: 0.5, unit: "hrs" },
  { key: "study_hours",     icon: BookOpen,    color: "indigo",  label: "Study Hours",      min: 0,  max: 15, step: 1,   unit: "hrs" },
  { key: "stress_level",    icon: AlertTriangle, color: "amber", label: "Stress Level",     min: 1,  max: 10, step: 1,   unit: "/10" },
  { key: "assignment_load", icon: Activity,    color: "emerald", label: "Assignment Load",  min: 1,  max: 10, step: 1,   unit: "/10" },
  { key: "social_activity", icon: Heart,       color: "red",     label: "Social Activity",  min: 1,  max: 10, step: 1,   unit: "/10" },
  { key: "screen_time",     icon: Monitor,     color: "slate",   label: "Screen Time",      min: 0,  max: 16, step: 1,   unit: "hrs" },
  { key: "motivation_level",icon: BrainCircuit,color: "purple",  label: "Motivation Level", min: 1,  max: 10, step: 1,   unit: "/10" },
] as const;

const colorMap: Record<string, string> = {
  blue:    "bg-blue-100 text-blue-600",
  indigo:  "bg-indigo-100 text-indigo-600",
  amber:   "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
  red:     "bg-red-100 text-red-600",
  slate:   "bg-slate-100 text-slate-600",
  purple:  "bg-purple-100 text-purple-600",
};

export default function InputControls({ values, onChange, onSubmit, loading }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sliders.map(({ key, icon: Icon, color, label, min, max, step, unit }) => (
          <div key={key} className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center font-bold text-slate-700 dark:text-slate-200">
                <Icon className={`w-4 h-4 mr-2 text-${color}-500`} />
                {label}
              </Label>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorMap[color]}`}>
                {values[key as keyof PredictInput]}{unit}
              </span>
            </div>
            <Slider
              value={[values[key as keyof PredictInput] as number]}
              min={min} max={max} step={step}
              onValueChange={(v) => onChange(key as keyof PredictInput, v[0])}
              className="py-1"
            />
          </div>
        ))}

        {/* Mood */}
        <div className="space-y-3">
          <Label className="flex items-center font-bold text-slate-700 dark:text-slate-200">
            <Smile className="w-4 h-4 mr-2 text-pink-500" />
            Current Mood
          </Label>
          <Select value={values.mood} onValueChange={(v) => onChange("mood", v)}>
            <SelectTrigger className="h-12 bg-white/50 dark:bg-white/10 rounded-xl border-slate-200 dark:border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Excellent">😄 Excellent — Feeling Great</SelectItem>
              <SelectItem value="Good">🙂 Good — Positive Vibes</SelectItem>
              <SelectItem value="Neutral">😐 Neutral — Just Okay</SelectItem>
              <SelectItem value="Low">😔 Low — Feeling Down</SelectItem>
              <SelectItem value="Very Low">😞 Very Low — Struggling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading}
        className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-2xl shadow-xl transition-all duration-300"
      >
        {loading ? (
          <><BrainCircuit className="mr-3 h-6 w-6 animate-spin" /> Analyzing with k-NN on 150k records...</>
        ) : (
          "🧠 Generate Burnout Risk Prediction"
        )}
      </Button>
    </div>
  );
}
