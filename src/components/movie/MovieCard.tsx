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
      className={`group relative block shrink-0 w-[120px] sm:w-[170px] md:w-[190px] lg:w-[210px] transition-all duration-500 hover:-translate-y-3 focus:z-[100] hover:z-[50] ${className}`}
    >

      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 group-hover:border-accent/50 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_hsl(var(--accent)/0.3)] transition-all duration-500 ease-luxe">
        {!loaded && <div className="absolute inset-0 shimmer-gold" />}
        
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              loaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-110`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-sm text-muted-foreground text-[10px] p-4 text-center font-display italic">
            {title}
          </div>
        )}

        {/* Site Logo on Card */}
        <div className="absolute top-2 right-2 z-20 pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
          <img 
            src="/logo.png" 
            alt="BNK" 
            className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] opacity-90"
          />
        </div>

        {/* Glossy Reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
          {/* TMDB Rating Badge (Glassmorphic) */}
          {typeof rating === "number" && rating > 0 && (
            <div className={`flex items-center gap-1.5 backdrop-blur-md ${kidsMode ? 'bg-white/90 border-sky-200 text-sky-600' : 'bg-black/60 border-white/10 text-white'} px-2 py-1 rounded-lg border shadow-2xl transform group-hover:translate-x-1 transition-transform duration-500`}>
              <Star className={`w-2.5 h-2.5 ${kidsMode ? 'text-sky-500' : 'text-accent'} fill-current`} />
              <span className="text-[10px] font-black">{rating.toFixed(1)}</span>
            </div>
          )}
          
          {/* Format Badge */}
          <div className={`backdrop-blur-md ${kidsMode ? 'bg-sky-500 text-white' : 'bg-accent/90 text-white'} px-2 py-0.5 rounded-md text-[8px] font-black border border-white/10 shadow-lg w-fit`}>
            {type === 'movie' ? '4K UHD' : 'SÉRIE'}
          </div>
        </div>

        {/* Immersive Hover Overlay */}
        <div className={`absolute inset-0 ${kidsMode ? 'bg-gradient-to-t from-sky-600/90' : 'bg-gradient-to-t from-black via-black/20 to-transparent'} opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5`}>
          <div className="absolute top-12 right-3 transform translate-y-[-10px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
             <FavoriteButton 
               tmdbId={id} 
               mediaType={type} 
               title={title} 
               posterPath={posterPath} 
               className="bg-white/10 hover:bg-accent/40 backdrop-blur-3xl border border-white/10 p-3 rounded-full shadow-2xl"
             />
          </div>

          <div className="transform translate-y-6 group-hover:translate-y-0 transition-all duration-500">
            <div className={`flex items-center gap-2 ${kidsMode ? 'text-white' : 'text-accent'} mb-2`}>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                {type === 'movie' ? (lang === 'ar' ? 'تشغيل' : 'Lecture') : (lang === 'ar' ? 'حلقات' : 'Épisodes')}
              </span>
            </div>
            <h3 className="text-white font-display font-black text-sm md:text-lg leading-tight line-clamp-2 drop-shadow-2xl">
              {title}
            </h3>
          </div>
        </div>
      </div>

      {/* External Info (Visible when not hovered) */}
      <div className="mt-3 px-1 group-hover:opacity-0 group-hover:translate-y-2 transition-all duration-500">
        <h3 className="font-body font-bold text-xs sm:text-sm text-foreground/90 line-clamp-1 mb-1">
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
