import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { IMG } from "@/services/tmdb";

interface Props {
  id: string | number;
  title: string;
  posterPath: string | null;
  type?: "movie" | "tv";
  year?: string;
  rating?: number;
  customUrl?: string;
  className?: string;
}

export const LandscapeMovieCard = ({
  id,
  title,
  posterPath,
  type = "movie",
  year,
  customUrl,
  className,
}: Props) => {
  const poster = IMG.poster(posterPath, "w500");
  const playPath = `/${type === "tv" ? "series" : "movie"}/${id}`;
  const finalPath = customUrl ? `${playPath}?video_url=${encodeURIComponent(customUrl)}` : playPath;

  return (
    <div className={`snap-start shrink-0 w-[200px] sm:w-[220px] md:w-[240px] ${className}`}>
      <Link to={finalPath} className="group relative block transition-all duration-700 hover:-translate-y-2">
        {/* Glow effect on hover */}
        <div className="absolute -inset-2 bg-accent/10 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface-card border border-white/5 group-hover:border-accent/40 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] transition-all duration-700 ease-luxe">
          {poster ? (
            <img 
              src={poster} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-card to-surface-elevated text-muted-foreground p-6 text-center font-display italic">
              {title}
            </div>
          )}
          
          {/* Site Logo */}
          <div className="absolute top-3 end-3 z-20 pointer-events-none">
            <img 
              src="/logo.png" 
              alt="BNK" 
              className="h-8 md:h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] opacity-90"
            />
          </div>
          
          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Glossy Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Top Badges */}
          <div className="absolute top-3 start-3 flex gap-2">
            <span className="backdrop-blur-xl bg-accent/20 text-accent text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-accent/30 shadow-lg">
              {year || type === "tv" ? "مسلسل" : "فيلم"}
            </span>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-[3px]">
            <div className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-[0_0_30px_hsl(var(--accent)/0.5)] scale-75 group-hover:scale-100 transition-transform duration-500 hover:scale-110 active:scale-90">
              <Play className="w-7 h-7 fill-current" />
            </div>
          </div>
          
          {/* Movie/Series Title at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 to-transparent">
            <h3 className="font-body font-bold text-sm text-white line-clamp-2 group-hover:text-accent transition-colors duration-300">
              {title}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {year || type === "tv" ? "مسلسل" : "فيلم"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};
