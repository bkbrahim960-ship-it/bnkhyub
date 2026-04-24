/**
 * BNKhub — Contexte de langue (FR / AR / EN / ES).
 * Applique dir="rtl" automatiquement pour l'arabe.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Lang, TranslationKey } from "@/services/i18n";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<LangCtx | null>(null);
const STORAGE = "bnkhub_lang";

export const LANGUAGES: Record<Lang, { label: string; flag: string; dir: "ltr" | "rtl" }> = {
  fr: { label: "Français", flag: "🇫🇷", dir: "ltr" },
  ar: { label: "العربية",  flag: "🇸🇦", dir: "rtl" },
  en: { label: "English",  flag: "🇬🇧", dir: "ltr" },
  es: { label: "Español",  flag: "🇪🇸", dir: "ltr" },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";
    const saved = localStorage.getItem(STORAGE) as Lang | null;
    return saved && saved in LANGUAGES ? saved : "fr";
  });

  const dir = LANGUAGES[lang].dir;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem(STORAGE, lang);
  }, [lang, dir]);

  const t = (key: TranslationKey): string => translations[lang][key] ?? translations.fr[key] ?? key;

  return (
    <Ctx.Provider value={{ lang, setLang: setLangState, t, dir }}>
      {children}
    </Ctx.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
