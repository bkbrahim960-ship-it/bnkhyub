import { useState } from "react";
import { 
  Loader2, 
  Settings, 
  Subtitles, 
  Layers, 
  Server, 
  ChevronDown,
  Check,
  ShieldCheck
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  const currentSource = sources.find(s => s.selected) || sources[0];

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
    <div className="w-full mt-4 animate-fade-slide-up">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-card/60 backdrop-blur-xl border border-white/10 shadow-luxe">
        
        {/* Left: Server Selection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
            <Server className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{isAr ? "السيرفر" : "Server"}</span>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 transition-all group">
                <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">{currentSource?.name}</span>
                <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-accent group-hover:rotate-180 transition-all duration-300" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-surface-elevated border-border shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-2">
              <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {sources.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => onSelect(idx)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      s.selected 
                        ? "bg-accent text-accent-foreground shadow-glow-sm" 
                        : "hover:bg-white/5 text-foreground/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.selected ? 'bg-white' : 'bg-accent/40'}`} />
                      {s.name}
                    </div>
                    {s.selected && <Check className="w-4 h-4" />}
                    {s.uptime === "99" && <ShieldCheck className="w-3.5 h-3.5 text-green-400 opacity-60" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right: Unified Controls (Quality, Subtitles) */}
        <div className="flex items-center gap-2">
          {/* Quality Indicator (Unified) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/60">
            <Layers className="w-4 h-4 text-accent" />
            <span>{currentSource?.quality || "1080p"}</span>
          </div>

          {/* Subtitles Placeholder (Unified) */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 transition-all text-xs font-bold text-white/60 hover:text-accent group">
            <Subtitles className="w-4 h-4 group-hover:animate-bounce" />
            <span>{isAr ? "العربية" : "Arabic"}</span>
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-glow-sm" title="Auto-active" />
          </button>

          {/* Settings Button */}
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-accent/10 hover:border-accent/40 transition-all group">
            <Settings className="w-5 h-5 text-white/60 group-hover:text-accent group-hover:rotate-90 transition-all duration-500" />
          </button>
        </div>
      </div>
      
      {/* Mini Tip */}
      <div className="mt-3 flex items-center justify-center md:justify-start gap-2 px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
        <ShieldCheck className="w-3 h-3 text-accent" />
        {isAr ? "جميع السيرفرات تدعم الترجمة العربية تلقائياً" : "All servers support Arabic subtitles automatically"}
      </div>
    </div>
  );
};
