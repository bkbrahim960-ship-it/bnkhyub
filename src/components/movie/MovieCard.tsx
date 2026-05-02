/**
 * BNKhub — MovieCard (carte film/série cliquable).
 */
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { IMG } from "@/services/tmdb";
import { useState, useEffect } from "react";
import { useAmbient } from "@/context/AmbientContext";

import { useSettings } from "@/context/SettingsContext";

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

export const MovieCard = ({ id, title, posterPath, year, rating, type = "movie", className = "", customUrl }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const { setAmbientColor } = useAmbient();
  const { kidsMode } = useSettings();
  const poster = IMG.poster(posterPath);

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
      className={`group relative block shrink-0 w-[150px] sm:w-[170px] md:w-[190px] transition-all duration-500 hover:-translate-y-2 focus:z-[100] ${className}`}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-card border border-border group-hover:border-accent-subtle group-hover:shadow-glow-accent transition-all duration-500 ease-luxe">
        {!loaded && <div className="absolute inset-0 shimmer-gold" />}
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-luxe ${
              loaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-110`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
            {title}
          </div>
        )}
        {/* Top Badges (Always Visible) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
          {/* TMDB Rating Badge */}
          {typeof rating === "number" && rating > 0 && (
            <div className={`flex items-center gap-2 ${kidsMode ? 'bg-white/90 shadow-pink-200' : 'bg-black/70'} backdrop-blur-md px-2.5 py-1.5 rounded-lg border ${kidsMode ? 'border-pink-200' : 'border-white/20'} shadow-2xl scale-110 origin-left transition-colors`}>
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" 
                alt="TMDB" 
                className="w-6 h-auto drop-shadow-md"
              />
              <span className={`text-xs font-black ${kidsMode ? 'text-pink-600' : 'text-white'} drop-shadow-md`}>{rating.toFixed(1)}</span>
            </div>
          )}
          
          {/* Type Badge */}
          <div className={`${kidsMode ? 'bg-pink-500 text-white' : 'bg-accent/20 text-accent'} backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-white/20`}>
            {type === 'movie' ? 'HD' : 'TV'}
          </div>
        </div>

        {/* Hover Overlay (Simplified) */}
        <div className={`absolute inset-0 ${kidsMode ? 'bg-gradient-to-t from-pink-500/80' : 'bg-gradient-to-t from-black/90'} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4`}>
          <p className={`text-[10px] ${kidsMode ? 'text-white' : 'text-accent'} font-bold uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500`}>
            {type === 'movie' ? 'Regarder le Film' : 'Voir la Série'}
          </p>
        </div>
      </div>

      <div className="pt-3 px-1">
        <h3 className="font-display font-semibold text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          {year && <span className="text-[10px] text-muted-foreground font-medium">{year}</span>}
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">BNKhub Premium</span>
        </div>
      </div>
    </Link>
  );
};
