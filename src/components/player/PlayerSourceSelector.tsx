import { useState } from "react";
import { Loader2, Play, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Source {
  id: number;
  name: string;
  quality: string;
  speed: string | number;
  uptime: string | number;
  hasAds: boolean;
  selected: boolean;
}

interface Props {
  sources: Source[];
  onSelect: (index: number) => void;
  isLoading?: boolean;
}

export const PlayerSourceSelector = ({ sources, onSelect, isLoading }: Props) => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  if (isLoading) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin mb-2" />
        <p className="text-xs font-medium animate-pulse text-muted-foreground">
          {isAr ? "جاري جلب السيرفرات..." : "Loading servers..."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
        {sources.map((source, idx) => (
          <button
            key={source.id}
            onClick={() => onSelect(idx)}
            className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all duration-300 min-w-[100px] md:min-w-[120px] shadow-sm ${
              source.selected 
                ? "bg-accent text-accent-foreground border-accent shadow-glow-accent scale-105" 
                : "bg-surface-card border-border text-foreground hover:border-accent hover:text-accent hover:scale-105"
            }`}
          >
            {source.name}
          </button>
        ))}
      </div>
    </div>
  );
};
