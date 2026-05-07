/**
 * BNKhub — Contexte de thème (6 thèmes).
 * Applique data-theme sur <html> et persiste dans localStorage.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "purple";

export const THEMES: Record<ThemeName, { label: string; swatch: string }> = {
  purple: { label: "Violet Royal",  swatch: "#7B1FA2" },
};

interface ThemeCtx {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const STORAGE = "bnkhub_theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "purple";
    const saved = localStorage.getItem(STORAGE) as ThemeName | null;
    return saved && saved in THEMES ? saved : "purple";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE, theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => {
    // Flash blanc signature lors du switch
    const flash = document.createElement("div");
    flash.className = "theme-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 450);
    setThemeState(t);
  };

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

/** Retourne la couleur accent en hex (pour sources tierces type VidLUX) */
export const getAccentHex = (): string => {
  const style = getComputedStyle(document.documentElement);
  const h = style.getPropertyValue("--accent-h").trim();
  const s = style.getPropertyValue("--accent-s").trim();
  const l = style.getPropertyValue("--accent-l").trim();
  return hslToHex(parseFloat(h), parseFloat(s), parseFloat(l));
};

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
