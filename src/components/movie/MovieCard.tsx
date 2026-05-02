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
      className={`group relative block shrink-0 w-[110px] sm:w-[160px] md:w-[180px] lg:w-[200px] transition-all duration-300 hover:-translate-y-2 focus:z-[100] hover:z-[50] ${className}`}
    >

      <div className="relative aspect-[2/3.2] rounded-2xl overflow-hidden bg-transparent border border-white/5 group-hover:border-accent/40 group-hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.9),0_0_40px_hsl(var(--accent)/0.4)] transition-[box-shadow,border-color,transform] duration-150 group-hover:scale-[1.05]">
        {!loaded && <div className="absolute inset-0 shimmer-gold" />}
        
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-[transform,opacity] duration-150 ease-out ${
              loaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-110`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-sm text-muted-foreground text-[10px] p-4 text-center font-display italic">
            {title}
          </div>
        )}

        {/* Glossy Reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {/* TMDB Rating Badge (Glassmorphic) */}
          {typeof rating === "number" && rating > 0 && (
            <div className={`flex items-center gap-1 backdrop-blur-xl ${kidsMode ? 'bg-white/90 border-sky-200' : 'bg-black/40 border-white/10'} px-1.5 py-0.5 rounded-full border shadow-xl transform group-hover:scale-110 transition-transform duration-150`}>
              <Star className={`w-2 h-2 ${kidsMode ? 'text-sky-500' : 'text-accent'} fill-current`} />
              <span className={`text-[9px] font-black ${kidsMode ? 'text-sky-700' : 'text-white'}`}>{rating.toFixed(1)}</span>
            </div>
          )}
          
          {/* Format Badge */}
          <div className={`backdrop-blur-md ${kidsMode ? 'bg-sky-500/80 text-white' : 'bg-black/40 text-accent'} px-1.5 py-0.5 rounded-full text-[7px] font-black border border-white/10 shadow-lg`}>
            {type === 'movie' ? '4K' : 'TV'}
          </div>
        </div>

        {/* Immersive Hover Overlay */}
        <div className={`absolute inset-0 ${kidsMode ? 'bg-gradient-to-t from-sky-500/90' : 'bg-gradient-to-t from-black via-black/40 to-transparent'} opacity-0 group-hover:opacity-100 transition-all duration-150 flex flex-col justify-end p-5`}>
          <div className="absolute top-3 right-3 transform translate-y-[-10px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-150">
             <FavoriteButton 
               tmdbId={id} 
               mediaType={type} 
               title={title} 
               posterPath={posterPath} 
               className="bg-white/10 hover:bg-accent/20 backdrop-blur-2xl border-white/10 p-2.5 rounded-full"
             />
          </div>

          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-150">
            <div className={`flex items-center gap-2 ${kidsMode ? 'text-white' : 'text-accent'} mb-1`}>
              <Play className="w-3 h-3 fill-current" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                {type === 'movie' ? (lang === 'ar' ? 'تشغيل الفيلم' : 'Lecture') : (lang === 'ar' ? 'تشغيل المسلسل' : 'Voir épisodes')}
              </span>
            </div>
            <h3 className="text-white font-display font-bold text-sm md:text-base leading-tight line-clamp-2 drop-shadow-lg">
              {title}
            </h3>
          </div>
        </div>
      </div>

      {/* External Info (Visible when not hovered) */}
      <div className="mt-2 px-1 group-hover:opacity-0 transition-opacity duration-150">
        <h3 className="font-body font-bold text-[10px] sm:text-sm text-foreground/90 line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {year && <span className="text-[8px] text-muted-foreground font-bold tracking-wider">{year}</span>}
          <span className={`text-[10px] font-black uppercase tracking-tighter ${kidsMode ? 'text-sky-500' : 'text-accent/60'}`}>
            {type === 'movie' ? 'Cinéma' : 'Série TV'}
          </span>
        </div>
      </div>
    </Link>
  );
});
