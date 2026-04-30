import { useState } from "react";
import { Loader2, Play, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

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
  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-4 md:p-6 w-full max-w-2xl text-white font-sans mx-auto mt-6 shadow-card-luxe">
      <div className="flex items-center gap-3 mb-4 border-b border-border pb-4">
        <span className="text-2xl">🎬</span>
        <h3 className="text-lg font-bold">اختر مصدرك المفضل</h3>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
          <p className="text-sm font-medium animate-pulse text-muted-foreground">جاري البحث عن أفضل مصادر البث...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-accent font-medium tracking-wide mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> تم العثور على {sources.length} مصدر متاح
          </p>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {sources.map((source, idx) => (
              <div 
                key={source.id} 
                className={`relative p-4 rounded-lg border transition-all cursor-pointer ${source.selected ? 'bg-accent/10 border-accent' : 'bg-surface-card border-border hover:border-accent-subtle'}`}
                onClick={() => onSelect(idx)}
              >
                {/* Ribbon for top source */}
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                    الأفضل
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold flex items-center gap-2 text-sm md:text-base">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📺'} {source.name}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span>جودة: <strong className="text-foreground">{source.quality}</strong></span>
                      <span>سرعة: <strong className="text-foreground">{source.speed} Mbps</strong></span>
                      <span>Uptime: <strong className="text-foreground">{source.uptime}%</strong></span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] font-medium">
                      {!source.hasAds ? (
                        <span className="text-green-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> بدون إعلانات</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> إعلانات قليلة</span>
                      )}
                      <span className="text-accent flex items-center gap-1"><Play className="w-3 h-3" /> تشغيل سريع</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${source.selected ? 'bg-accent text-accent-foreground' : 'bg-surface-elevated text-foreground hover:bg-accent hover:text-accent-foreground'}`}>
                      {source.selected ? 'جاري التشغيل' : 'شغّل'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-surface-card rounded-lg border border-border text-xs text-muted-foreground">
            <h5 className="font-bold text-foreground mb-1">📊 ملخص:</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>الأفضل للسرعة: VidLink (50 Mbps)</li>
              <li>الأفضل للجودة: HITV Direct (1080p, بدون إعلانات)</li>
              <li>الأفضل للموثوقية: HITV Direct (99% Uptime)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
