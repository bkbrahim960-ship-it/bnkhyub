/**
 * BNKhub — Sélecteur de thème (6 couleurs).
 */
import { useState, useRef, useEffect } from "react";
import { useTheme, THEMES, ThemeName } from "@/context/ThemeContext";
import { Palette, Check } from "lucide-react";

export const ColorSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`p-2.5 rounded-full transition-all duration-500 hover:scale-110 active:scale-95 border ${
          open 
            ? "bg-accent/20 border-accent text-accent shadow-glow" 
            : "bg-surface-card border-border/60 text-foreground/80 hover:text-accent hover:border-accent/40"
        }`}
        title="Changer la couleur"
      >
        <Palette className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute bottom-full mb-3 end-0 p-3 rounded-2xl bg-surface-card/90 backdrop-blur-xl border border-border shadow-card-luxe animate-fade-in z-50 min-w-[180px]">
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(THEMES) as [ThemeName, { label: string; swatch: string }][]).map(
              ([name, t]) => {
                const active = theme === name;
                return (
                  <button
                    key={name}
                    onClick={() => {
                      setTheme(name);
                      setOpen(false);
                    }}
                    className={`group relative w-10 h-10 rounded-xl transition-all duration-500 overflow-hidden ${
                      active ? "ring-2 ring-accent ring-offset-2 ring-offset-surface-card scale-105" : "hover:scale-110"
                    }`}
                    style={{ background: t.swatch }}
                    title={t.label}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    {active && (
                      <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-center text-muted-foreground font-bold opacity-60">
            {THEMES[theme].label}
          </p>
        </div>
      )}
    </div>
  );
};
