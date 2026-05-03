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
  onToggleSettings?: () => void;
  onToggleSubtitles?: () => void;
  onToggleQuality?: () => void;
  isLoading?: boolean;
}

export const PlayerSourceSelector = ({ 
  sources, 
  onSelect, 
  onToggleSettings, 
  onToggleSubtitles, 
  onToggleQuality, 
  isLoading 
}: Props) => {
  const { lang } = useLanguage();
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
      <div className="flex items-center justify-between gap-4 p-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
        
        {/* Left: Server Selection */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent group cursor-default">
            <Server className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isAr ? "السيرفر" : "SERVER"}</span>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group min-w-[160px]">
                <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{currentSource?.name}</span>
                <ChevronDown className="w-4 h-4 text-white/20 group-hover:text-white transition-all duration-300" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-black/90 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl">
              <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {sources.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => onSelect(idx)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      s.selected 
                        ? "bg-accent text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                        : "hover:bg-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.selected ? 'bg-black' : 'bg-accent'}`} />
                      {s.name}
                    </div>
                    {s.selected && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right: Unified Controls (Quality, Subtitles) */}
        <div className="flex items-center gap-2 pr-1">
          {/* Quality Selector */}
          <button 
            onClick={onToggleQuality}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-black text-white/70 hover:text-white group"
          >
            <Layers className="w-4 h-4 text-accent/80 group-hover:text-accent" />
            <span className="uppercase tracking-widest">{currentSource?.quality || "Auto"}</span>
          </button>

          {/* Subtitles Selector */}
          <button 
            onClick={onToggleSubtitles}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-black text-white/70 hover:text-white group"
          >
            <Subtitles className="w-4 h-4 text-white/40 group-hover:text-white" />
            <span className="uppercase tracking-widest">{isAr ? "العربية" : "Arabic"}</span>
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </button>

          {/* Settings Button */}
          <button 
            onClick={onToggleSettings}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <Settings className="w-5 h-5 text-white/40 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
          </button>
        </div>
      </div>
      
      {/* Mini Tip */}
      <div className="mt-3 flex items-center gap-2 px-4 py-1 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
        <ShieldCheck className="w-3 h-3 text-accent/40" />
        {isAr ? "جميع السيرفرات تدعم الترجمة العربية تلقائياً" : "All servers support Arabic subtitles automatically"}
      </div>
    </div>
  );
};
