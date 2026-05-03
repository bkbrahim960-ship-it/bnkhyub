import { 
  Loader2, 
  Settings, 
  Subtitles, 
  Layers, 
  Server, 
  ChevronDown,
  Check,
  ShieldCheck,
  X
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
    <div className="w-full mt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-4 p-1.5 px-3 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/5 shadow-2xl">
        
        {/* Left: Server Selection */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent cursor-default">
            <Server className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isAr ? "السيرفر" : "SERVER"}</span>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group min-w-[140px]">
                <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{currentSource?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover:text-white transition-all duration-300" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-[#0f0f0f] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl">
              <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {sources.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => onSelect(idx)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      s.selected 
                        ? "bg-accent text-black" 
                        : "hover:bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.selected ? 'bg-black' : 'bg-accent/40'}`} />
                      {s.name}
                    </div>
                    {s.selected && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quality */}
          <button 
            onClick={onToggleQuality}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-black text-white/50 hover:text-white group"
          >
            <Layers className="w-3.5 h-3.5 text-accent/60 group-hover:text-accent" />
            <span className="uppercase tracking-widest">{currentSource?.quality || "Auto"}</span>
          </button>

          {/* Subtitles */}
          <button 
            onClick={onToggleSubtitles}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-black text-white/50 hover:text-white group"
          >
            <Subtitles className="w-3.5 h-3.5 text-white/20 group-hover:text-white" />
            <span className="uppercase tracking-widest">{isAr ? "العربية" : "Arabic"}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </button>

          {/* Settings */}
          <button 
            onClick={onToggleSettings}
            className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <Settings className="w-4 h-4 text-white/30 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
