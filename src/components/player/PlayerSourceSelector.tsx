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

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-3 md:p-5 w-full max-w-3xl text-white font-sans mx-auto mt-4 shadow-card-luxe">
      <div className="flex items-center gap-2 mb-3 border-b border-border pb-3">
        <span className="text-xl">🎬</span>
        <h3 className="text-base font-bold">{isAr ? "اختر مصدرك المفضل" : "Choose Your Source"}</h3>
      </div>

      {isLoading ? (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-6 h-6 text-accent animate-spin mb-2" />
          <p className="text-xs font-medium animate-pulse text-muted-foreground">
            {isAr ? "جاري البحث عن أفضل مصادر البث..." : "Searching for the best streaming sources..."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-accent font-medium tracking-wide mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 
            {isAr ? `تم العثور على ${sources.length} مصدر متاح` : `Found ${sources.length} available sources`}
          </p>
          
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {sources.map((source, idx) => (
              <div 
                key={source.id} 
                className={`relative p-3 rounded-lg border transition-all cursor-pointer ${source.selected ? 'bg-accent/10 border-accent' : 'bg-surface-card border-border hover:border-accent-subtle'}`}
                onClick={() => onSelect(idx)}
              >
                {/* Ribbon for top source */}
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                    {isAr ? "الأفضل" : "BEST"}
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold flex items-center gap-2 text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📺'} {source.name}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                      <span>{isAr ? "جودة:" : "Quality:"} <strong className="text-foreground">{source.quality}</strong></span>
                      <span>{isAr ? "سرعة:" : "Speed:"} <strong className="text-foreground">{source.speed} Mbps</strong></span>
                      <span>Uptime: <strong className="text-foreground">{source.uptime}%</strong></span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[9px] font-medium uppercase tracking-wider">
                      {!source.hasAds ? (
                        <span className="text-green-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {isAr ? "بدون إعلانات" : "AD-FREE"}</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {isAr ? "إعلانات قليلة" : "FEW ADS"}</span>
                      )}
                      <span className="text-accent flex items-center gap-1"><Play className="w-3 h-3" /> {isAr ? "تشغيل سريع" : "FAST PLAY"}</span>
                    </div>
                  </div>

                  <div>
                    <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${source.selected ? 'bg-accent text-accent-foreground' : 'bg-surface-elevated text-foreground hover:bg-accent hover:text-accent-foreground'}`}>
                      {source.selected ? (isAr ? 'جاري التشغيل' : 'PLAYING') : (isAr ? 'شغّل' : 'PLAY')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-2.5 bg-surface-card rounded-lg border border-border text-[11px] text-muted-foreground">
            <h5 className="font-bold text-foreground mb-1">📊 {isAr ? "ملخص:" : "Summary:"}</h5>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>{isAr ? "الأفضل للسرعة: VidLink (50 Mbps)" : "Best for Speed: VidLink (50 Mbps)"}</li>
              <li>{isAr ? "الأفضل للجودة: HITV Direct (1080p, بدون إعلانات)" : "Best Quality: HITV Direct (1080p, Ad-Free)"}</li>
              <li>{isAr ? "الأفضل للموثوقية: HITV Direct (99% Uptime)" : "Most Reliable: HITV Direct (99% Uptime)"}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
