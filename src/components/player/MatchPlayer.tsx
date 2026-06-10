import { useState } from "react";
import { X, Loader2, Maximize2, Minimize2 } from "lucide-react";

interface MatchPlayerProps {
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  streams: string[];
  onClose: () => void;
}

export function MatchPlayer({ homeTeam, awayTeam, homeLogo, awayLogo, streams, onClose }: MatchPlayerProps) {
  const [activeSource, setActiveSource] = useState<string | null>(streams[0] || null);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-2 md:p-6">
      <div className={`relative bg-surface-card rounded-2xl overflow-hidden border border-border flex flex-col ${fullscreen ? "w-full h-full rounded-none border-0" : "w-full max-w-5xl max-h-[90vh]"}`}>
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-surface-card/95 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {homeLogo && <img src={homeLogo} alt="" className="w-8 h-8 object-contain" />}
            <span className="font-bold text-sm md:text-base truncate">{homeTeam}</span>
            <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-accent/10">VS</span>
            <span className="font-bold text-sm md:text-base truncate">{awayTeam}</span>
            {awayLogo && <img src={awayLogo} alt="" className="w-8 h-8 object-contain" />}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 rounded-full hover:bg-accent/10 transition-colors"
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative bg-black min-h-[300px] md:min-h-[500px]">
          {activeSource ? (
            <iframe
              src={activeSource}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">لا توجد روابط بث متاحة</p>
            </div>
          )}
        </div>

        {streams.length > 1 && (
          <div className="flex flex-wrap gap-2 p-3 border-t border-border bg-surface-card/95 shrink-0 overflow-x-auto">
            {streams.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveSource(src)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeSource === src
                    ? "bg-accent text-accent-foreground"
                    : "bg-accent/5 text-muted-foreground hover:bg-accent/10"
                }`}
              >
                السيرفر {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
