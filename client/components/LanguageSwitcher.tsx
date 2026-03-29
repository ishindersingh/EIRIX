import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "hi", label: "हिंदी",       flag: "🇮🇳" },
  { code: "pa", label: "ਪੰਜਾਬੀ",      flag: "🇮🇳" },
  { code: "es", label: "Español",    flag: "🇪🇸" },
  { code: "fr", label: "Français",   flag: "🇫🇷" },
  { code: "ar", label: "العربية",    flag: "🇸🇦" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

  const change = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    // RTL support for Arabic
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all text-sm font-semibold"
      >
        <Globe className="w-4 h-4 text-indigo-500" />
        <span>{current.flag} {current.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 z-50 w-44 glass rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => change(lang.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left",
                  i18n.language === lang.code
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                )}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
