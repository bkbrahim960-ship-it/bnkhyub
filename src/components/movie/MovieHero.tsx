/**
 * BNKhub — Hero rotatif de la page d'accueil (auto-rotate 8s).
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

  useEffect(() => {
    if (pool.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % pool.length), 8000);
    return () => clearInterval(id);
  }, [pool.length]);

  if (pool.length === 0) {
    return <div className="h-[92vh] bg-surface-secondary shimmer-gold" />;
  }

  const movie = pool[index];
  const backdrop = IMG.backdrop(movie.backdrop_path, "original");
  const year = movie.release_date?.slice(0, 4);

  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden">
      {/* Backdrops empilés pour transition fondu */}
      {pool.map((m, i) => {
        const img = IMG.backdrop(m.backdrop_path, "original");
        return (
          <div
            key={m.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-luxe ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            {img && (
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover scale-105"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
          </div>
        );
      })}

      {/* Grain + gradients */}
      <div className="absolute inset-0 grain" />
      <div className={`absolute inset-0 bg-gradient-to-t ${kidsMode ? 'from-white via-white/40' : 'from-surface-primary via-surface-primary/60'} to-transparent`} />
      <div className={`absolute inset-0 bg-gradient-to-r ${kidsMode ? 'from-white/80 via-white/20' : 'from-surface-primary/95 via-surface-primary/40'} to-transparent`} />

      {/* Contenu */}
      <div className="relative z-10 h-full container flex items-end md:items-center pb-16 md:pb-0">
        <div
          key={movie.id}
          className="max-w-2xl animate-fade-slide-up"
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs uppercase tracking-[0.2em] rounded-full border border-accent-subtle text-accent bg-accent/5 backdrop-blur">
            ★ {movie.vote_average.toFixed(1)}  ·  {year}
          </span>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-5">
            <span className="text-gradient-accent">{movie.title}</span>
          </h1>

          <p className="text-foreground/85 text-base md:text-lg leading-relaxed max-w-xl mb-8 line-clamp-3">
            {movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2.5 bg-gradient-accent text-accent-foreground font-semibold px-7 py-3.5 rounded-full shadow-accent hover:scale-[1.04] active:scale-[0.98] transition-transform duration-300 ease-luxe animate-pulse-glow"
            >
              <Play className="w-5 h-5 fill-accent-foreground" />
              {t("hero_watch")}
            </Link>
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-surface-elevated/60 backdrop-blur hover:bg-surface-elevated hover:border-accent-subtle transition-colors"
            >
              <Info className="w-5 h-5" />
              {t("hero_info")}
            </Link>
          </div>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="absolute bottom-8 end-8 z-10 flex gap-2">
        {pool.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Diapo ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === index ? "w-10 bg-accent" : "w-4 bg-foreground/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
