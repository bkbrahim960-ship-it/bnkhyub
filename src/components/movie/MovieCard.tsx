/**
 * BNKhub — MovieCard (carte film/série cliquable).
 */
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { IMG } from "@/services/tmdb";
import { useState, useEffect } from "react";
import { useAmbient } from "@/context/AmbientContext";

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
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
             <div className="flex items-center gap-2 mb-1">
                <img 
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" 
                  alt="TMDB" 
                  className="w-6 h-auto opacity-80"
                />
                {typeof rating === "number" && rating > 0 && (
                  <span className="text-xs font-bold text-accent">{rating.toFixed(1)}</span>
                )}
             </div>
             <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider line-clamp-1">{type === 'movie' ? 'Film' : 'Série'}</p>
          </div>
        </div>

        {/* Rating Badge (Always visible on mobile/desktop top left) */}
        {typeof rating === "number" && rating > 0 && (
          <div className="absolute top-2 start-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold border border-white/10 group-hover:border-accent/40 transition-colors">
            <Star className="w-2.5 h-2.5 text-accent fill-accent" />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
        
        {/* Type Badge (Top Right) */}
        <div className="absolute top-2 end-2 bg-accent/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-accent border border-accent/20">
          {type === 'movie' ? 'HD' : 'TV'}
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
