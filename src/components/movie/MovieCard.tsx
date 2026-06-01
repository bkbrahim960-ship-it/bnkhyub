import React, { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { IMG } from "@/services/tmdb";
import { useAmbient } from "@/context/AmbientContext";
import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/context/LanguageContext";
import { FavoriteButton } from "./FavoriteButton";

interface Props {
  id: string | number;
  title: string;
  posterPath: string | null;
  year?: string;
  rating?: number;
  type?: "movie" | "tv";
  className?: string;
  customUrl?: string;
}

export const MovieCard = memo(({ id, title, posterPath, year, rating, type = "movie", className = "", customUrl }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const { setAmbientColor } = useAmbient();
  const { kidsMode } = useSettings();
  const { lang } = useLanguage();
  const poster = IMG.poster(posterPath, "w342"); 

  const handleActive = () => {
    try {
      setAmbientColor(`hsl(var(--accent) / 0.3)`);
    } catch (e) {}
  };
  const handleLeave = () => {
    try {
      setAmbientColor("transparent");
    } catch (e) {}
  };

  const playPath = `/${type === "tv" ? "series" : "movie"}/${id}`;
  const finalPath = customUrl ? `${playPath}?video_url=${encodeURIComponent(customUrl)}` : playPath;

  return (
    <Link
      to={finalPath}
      onMouseEnter={handleActive}
      onMouseLeave={handleLeave}
      onFocus={handleActive}
      onBlur={handleLeave}
      className={`relative block shrink-0 w-[120px] sm:w-[170px] md:w-[190px] lg:w-[210px] ${className}`}
    >

       <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] border border-white/10 backdrop-blur-sm">
        {!loaded && <div className="absolute inset-0 shimmer-gold" />}
        
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-sm text-muted-foreground text-[10px] p-4 text-center font-display italic">
            {title}
          </div>
        )}

        {/* Site Logo on Card */}
        <div className="absolute top-2 right-2 z-20 pointer-events-none">
          <img 
            src="/logo.png" 
            alt="BNK" 
            className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] opacity-90"
          />
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
          {/* TMDB Rating Badge (Glassmorphic) */}
          {typeof rating === "number" && rating > 0 && (
            <div className={`flex items-center gap-1.5 backdrop-blur-md ${kidsMode ? 'bg-white/90 border-sky-200 text-sky-600' : 'bg-black/60 border-white/10 text-white'} px-2 py-1 rounded-lg border shadow-2xl`}>
              <Star className={`w-2.5 h-2.5 ${kidsMode ? 'text-sky-500' : 'text-accent'} fill-current`} />
              <span className="text-[10px] font-black">{rating.toFixed(1)}</span>
            </div>
          )}
          
          {/* Format Badge */}
          <div className={`backdrop-blur-md ${kidsMode ? 'bg-sky-500 text-white' : 'bg-accent/90 text-white'} px-2 py-0.5 rounded-md text-[8px] font-black border border-white/10 shadow-lg w-fit`}>
            {type === 'movie' ? '4K UHD' : 'SÉRIE'}
          </div>
        </div>
      </div>

      {/* External Info */}
      <div className="mt-3 px-1">
        <h3 className="font-body font-bold text-[10px] sm:text-xs md:text-sm text-foreground/90 line-clamp-1 mb-1">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {year && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-muted-foreground font-bold tracking-wider">
              {year}
            </span>
          )}
          <span className={`text-[10px] font-black uppercase tracking-tighter ${kidsMode ? 'text-sky-500' : 'text-accent'}`}>
            {type === 'movie' ? 'Film' : 'Série TV'}
          </span>
        </div>
      </div>
    </Link>
  );
});
