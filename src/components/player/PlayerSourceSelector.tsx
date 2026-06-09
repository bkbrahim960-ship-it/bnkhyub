import React, { useState } from "react";
import { 
  Server, 
  ChevronDown,
  Check,
  Loader2,
  Download,
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
  isLoading?: boolean;
  type?: "movie" | "tv";
  tmdbId?: number | string;
  hideControls?: boolean;
}

export const PlayerSourceSelector = React.memo(({ 
  sources, 
  onSelect, 
  isLoading,
  type,
  tmdbId,
  hideControls
}: Props) => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const currentSource = sources.find(s => s.selected) || sources[0];
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const downloadUrl = type && tmdbId 
    ? (type === "movie" 
      ? `https://nhdapi.com/dl/movie/${tmdbId}` 
      : `https://nhdapi.com/dl/tv/${tmdbId}`)
    : "";

  if (isLoading || hideControls) {
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
    return null;
  }

  return (
    <div className="w-full mt-6 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {/* Download Button */}
        {type && tmdbId && (
          <button
            onClick={() => setDownloadModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 rounded-[2rem] bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all group shadow-2xl"
          >
            <Download className="w-5 h-5 text-accent/40 group-hover:text-accent transition-colors" />
            <span className="text-lg font-black text-white group-hover:text-accent transition-colors">
              {isAr ? "تحميل" : "Download"}
            </span>
          </button>
        )}
        
        {/* Large Centered Server Selector */}
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-6 px-8 py-4 rounded-[2rem] bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all group min-w-[260px] shadow-2xl">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-accent/40 group-hover:text-accent transition-colors" />
                  <span className="text-lg font-black text-white group-hover:text-accent transition-colors">{currentSource?.name}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-accent group-hover:rotate-180 transition-all duration-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 bg-black/95 backdrop-blur-3xl border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-[2rem] z-[600]">
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

      {/* Download Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-[110] animate-fade-in">
          <div className="absolute inset-0 bg-black/95" onClick={() => setDownloadModalOpen(false)} />
          <div className="relative w-full h-full bg-surface-elevated border border-white/10 shadow-2xl animate-modal-in">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-display font-black text-white">
                {isAr ? "تحميل" : "Download"}
              </h3>
              <button 
                onClick={() => setDownloadModalOpen(false)} 
                className="p-3 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <iframe
              src={downloadUrl}
              title="Download"
              className="w-full h-[calc(100%-72px)] border-0"
              allow="fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
});
