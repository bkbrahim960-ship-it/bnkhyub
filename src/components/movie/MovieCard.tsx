/**
 * BNKhub — MovieCard (carte film/série cliquable).
 */
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { IMG } from "@/services/tmdb";
import { useState } from "react";

interface Props {
  id: number;
  title: string;
  posterPath: string | null;
  year?: string;
  rating?: number;
  type?: "movie" | "tv";
  className?: string;
}

export const MovieCard = ({ id, title, posterPath, year, rating, type = "movie", className = "" }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const poster = IMG.poster(posterPath);

  return (
    <Link
      to={`/${type === "tv" ? "series" : "movie"}/${id}`}
      className={`group relative block shrink-0 w-[150px] sm:w-[170px] md:w-[190px] transition-all duration-500 ease-luxe hover:-translate-y-2 focus:z-50 ${className}`}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-card border border-border group-hover:border-accent-subtle group-hover:shadow-glow transition-all duration-500 ease-luxe">
        {!loaded && <div className="absolute inset-0 shimmer-gold" />}
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-luxe ${
              loaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-[1.08]`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
            {title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {typeof rating === "number" && rating > 0 && (
          <div className="absolute top-2 start-2 flex items-center gap-1 bg-black/70 backdrop-blur px-2 py-1 rounded-full text-xs border border-accent/30">
            <Star className="w-3 h-3 text-accent fill-accent" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="pt-3 px-1">
        <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {title}
        </h3>
        {year && <p className="text-xs text-muted-foreground mt-0.5">{year}</p>}
      </div>
    </Link>
  );
};
