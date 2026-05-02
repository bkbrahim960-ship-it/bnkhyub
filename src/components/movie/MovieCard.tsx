/**
 * BNKhub — MovieCard (carte film/série cliquable).
 */
import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { IMG } from "@/services/tmdb";
import { useState } from "react";
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

export const MovieCard = ({ id, title, posterPath, year, rating, type = "movie", className = "", customUrl }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const { setAmbientColor } = useAmbient();
  const { kidsMode } = useSettings();
  const { lang } = useLanguage();
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
            <div className={`flex items-center gap-2 ${kidsMode ? 'bg-white/95 shadow-sm' : 'bg-black/70'} backdrop-blur-md px-2.5 py-1.5 rounded-lg border ${kidsMode ? 'border-sky-100' : 'border-white/20'} scale-110 origin-left transition-colors`}>
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" 
                alt="TMDB" 
                className="w-6 h-auto drop-shadow-md"
              />
              <span className={`text-xs font-black ${kidsMode ? 'text-sky-600' : 'text-white'} drop-shadow-md`}>{rating.toFixed(1)}</span>
            </div>
          )}
          
          {/* Type Badge */}
          <div className={`${kidsMode ? 'bg-sky-500 text-white' : 'bg-accent/20 text-accent'} backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-white/20`}>
            {type === 'movie' ? 'HD' : 'TV'}
          </div>
        </div>

        {/* Hover Overlay (Simplified) */}
        <div className={`absolute inset-0 ${kidsMode ? 'bg-gradient-to-t from-sky-500/80' : 'bg-gradient-to-t from-black/90'} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4`}>
          <div className="absolute top-2 right-2 transform translate-y-[-10px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
             <FavoriteButton 
               tmdbId={id} 
               mediaType={type} 
               title={title} 
               posterPath={posterPath} 
               className="bg-black/40 backdrop-blur-md border-white/20 p-2.5"
             />
          </div>

          <p className={`text-[10px] ${kidsMode ? 'text-white' : 'text-accent'} font-bold uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500`}>
            {type === 'movie' ? (lang === 'ar' ? 'مشاهدة الفيلم' : 'Regarder le Film') : (lang === 'ar' ? 'مشاهدة المسلسل' : 'Voir la Série')}
          </p>
          <h3 className="text-white font-bold text-sm line-clamp-1 mt-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">
            {title}
          </h3>
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
