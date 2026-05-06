/**
 * BNKhub — Hero rotatif de la page d'accueil (auto-rotate 8s).
 * Affiche uniquement des images statiques (Video Background removed as requested).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Info } from "lucide-react";
import { IMG, TMDBMovie } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  items: TMDBMovie[];
}

export const MovieHero = ({ items }: Props) => {
  const { t } = useLanguage();
  const { kidsMode } = useSettings();
  const [index, setIndex] = useState(0);
  const pool = items.slice(0, 6);

  // Auto-rotate
  useEffect(() => {
    if (pool.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % pool.length), 8000);
    return () => clearInterval(id);
  }, [pool.length]);

  if (pool.length === 0) {
    return <div className="h-[65vh] md:h-[92vh] bg-surface-secondary shimmer-gold" />;
  }

  const movie = pool[index];

  return (
    <section className="relative h-[65vh] md:h-[92vh] min-h-[400px] md:min-h-[560px] w-full overflow-hidden group">
      {/* Static Backdrops */}
      {pool.map((m, i) => {
        const img = IMG.backdrop(m.backdrop_path, "w1280");
        return (
          <div
            key={m.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-luxe ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {img && (
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover object-top"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            )}
          </div>
        );
      })}

      {/* Overlays */}
      <div className="absolute inset-0 z-[2] grain opacity-20" />
      <div className={`absolute inset-0 z-[2] bg-gradient-to-t ${kidsMode ? 'from-background via-background/40' : 'from-surface-primary via-surface-primary/50'} to-transparent`} />
      
      {/* Content — Positioned low and clear on mobile (pb-32) */}
      <div className="absolute inset-x-0 bottom-0 z-20 container pb-24 md:pb-32 lg:pb-40">
        <div key={movie.id} className="max-w-2xl md:max-w-4xl animate-fade-slide-up">
          <span className="inline-block px-3 py-1 mb-3 text-[10px] md:text-sm uppercase tracking-[0.2em] rounded-full border border-accent-subtle text-accent bg-accent/5 backdrop-blur">
            ★ {movie.vote_average.toFixed(1)}  ·  {movie.release_date?.slice(0, 4)}
          </span>

          <h1 className="font-display text-3xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-4 md:mb-8">
            <span className="text-gradient-accent">{movie.title}</span>
          </h1>

          <p className="text-foreground/90 text-sm md:text-xl leading-relaxed max-w-2xl mb-6 md:mb-12 line-clamp-2 md:line-clamp-none font-medium">
            {movie.overview}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-3 bg-gradient-accent text-accent-foreground font-bold px-7 md:px-10 py-3.5 md:py-5 rounded-full shadow-accent hover:scale-[1.05] active:scale-[0.98] transition-all duration-300 text-sm md:text-lg"
            >
              <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              {t("hero_watch")}
            </Link>
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-5 rounded-full border border-border bg-surface-elevated/60 backdrop-blur hover:bg-surface-elevated transition-all text-sm md:text-lg"
            >
              <Info className="w-5 h-5 md:w-6 md:h-6" />
              {t("hero_info")}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 end-4 z-10 flex gap-2">
        {pool.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === index ? "w-8 bg-accent" : "w-3 bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
