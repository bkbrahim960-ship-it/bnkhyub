/**
 * BNKhub — Sélecteur de thème (6 couleurs).
 */
import { useTheme, THEMES, ThemeName } from "@/context/ThemeContext";
import { Palette } from "lucide-react";

export const ColorSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`flex items-center gap-2 ${compact ? "" : "p-2 rounded-full bg-surface-card border border-border"}`}
      role="radiogroup"
      aria-label="Thème de couleur"
    >
      {!compact && <Palette className="w-4 h-4 text-muted-foreground mx-1" />}
      {(Object.entries(THEMES) as [ThemeName, { label: string; swatch: string }][]).map(
        ([name, t]) => {
          const active = theme === name;
          return (
            <button
              key={name}
              onClick={() => setTheme(name)}
              role="radio"
              aria-checked={active}
              title={t.label}
              className={`relative w-7 h-7 rounded-full transition-all duration-300 ease-luxe ${
                active
                  ? "scale-110 ring-2 ring-offset-2 ring-offset-surface-card ring-foreground"
                  : "hover:scale-110 opacity-80 hover:opacity-100"
              }`}
              style={{ background: t.swatch }}
            >
              <span className="sr-only">{t.label}</span>
            </button>
          );
        },
      )}
    </div>
  );
};
