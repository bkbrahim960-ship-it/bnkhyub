import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SettingsCtx {
  kidsMode: boolean;
  setKidsMode: (val: boolean) => void;
  toggleKidsMode: () => void;
  kidsPin: string | null;
  setKidsPin: (pin: string | null) => void;
}

const Ctx = createContext<SettingsCtx | null>(null);
const STORAGE = "bnkhub_settings";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [kidsMode, setKidsModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(STORAGE);
    if (!saved) return false;
    try {
      const parsed = JSON.parse(saved);
      return !!parsed.kidsMode;
    } catch {
      return false;
    }
  });

  const [kidsPin, setKidsPinState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed.kidsPin || null;
    } catch {
      return null;
    }
  });

  const setKidsMode = (val: boolean) => {
    setKidsModeState(val);
    const current = JSON.parse(localStorage.getItem(STORAGE) || "{}");
    localStorage.setItem(STORAGE, JSON.stringify({ ...current, kidsMode: val }));
  };

  const setKidsPin = (pin: string | null) => {
    setKidsPinState(pin);
    const current = JSON.parse(localStorage.getItem(STORAGE) || "{}");
    localStorage.setItem(STORAGE, JSON.stringify({ ...current, kidsPin: pin }));
  };

  const toggleKidsMode = () => {
    const next = !kidsMode;
    setKidsMode(next);
  };

  useEffect(() => {
    if (kidsMode) {
      document.documentElement.setAttribute("data-kids", "true");
    } else {
      document.documentElement.removeAttribute("data-kids");
    }
  }, [kidsMode]);

  return (
    <Ctx.Provider value={{ kidsMode, setKidsMode, toggleKidsMode, kidsPin, setKidsPin }}>
      {children}
    </Ctx.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
