import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface SettingsCtx {
  kidsMode: boolean;
  setKidsMode: (val: boolean) => void;
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

  const setKidsMode = (val: boolean) => {
    setKidsModeState(val);
    localStorage.setItem(STORAGE, JSON.stringify({ kidsMode: val }));
  };

  useEffect(() => {
    if (kidsMode) {
      document.documentElement.setAttribute("data-kids", "true");
    } else {
      document.documentElement.removeAttribute("data-kids");
    }
  }, [kidsMode]);

  return (
    <Ctx.Provider value={{ kidsMode, setKidsMode }}>
      {children}
    </Ctx.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
