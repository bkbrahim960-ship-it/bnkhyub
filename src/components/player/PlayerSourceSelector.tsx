import { 
  Server, 
  ChevronDown,
  Check,
  Loader2
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

export const PlayerSourceSelector = ({ 
  sources, 
  onSelect, 
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
    <div className="w-full mt-6 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-4">
        {/* Large Centered Server Selector without background */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/5 border border-accent/10 text-accent">
            <Server className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">{isAr ? "السيرفر" : "SERVER"}</span>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-6 px-8 py-4 rounded-[2rem] bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all group min-w-[240px] shadow-2xl">
                <span className="text-lg font-black text-white group-hover:text-accent transition-colors">{currentSource?.name}</span>
                <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-accent group-hover:rotate-180 transition-all duration-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 bg-black/95 backdrop-blur-3xl border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-[2rem]">
              <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {sources.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => onSelect(idx)}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                      s.selected 
                        ? "bg-accent text-black shadow-[0_10px_20px_rgba(212,175,55,0.3)]" 
                        : "hover:bg-white/10 text-white/40 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${s.selected ? 'bg-black' : 'bg-accent/40'}`} />
                      {s.name}
                    </div>
                    {s.selected && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
