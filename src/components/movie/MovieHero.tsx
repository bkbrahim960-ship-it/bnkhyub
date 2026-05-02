/**
 * BNKhub — Hero rotatif de la page d'accueil (auto-rotate 8s).
 * Affiche un trailer vidéo en arrière-plan avec fallback sur l'image statique.
 */
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, Info } from "lucide-react";
import { IMG, TMDBMovie, getMovieDetails } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  items: TMDBMovie[];
}

export const MovieHero = ({ items }: Props) => {
  const { lang, t } = useLanguage();
  const { kidsMode } = useSettings();
  const [index, setIndex] = useState(0);
  const [trailerKeys, setTrailerKeys] = useState<Record<number, string>>({});
  const [videoReady, setVideoReady] = useState(false);
  const pool = items.slice(0, 6);

  // Auto-rotate
  useEffect(() => {
    if (pool.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % pool.length), 10000);
    return () => clearInterval(id);
  }, [pool.length]);

  // Reset video state on slide change
  useEffect(() => {
    setVideoReady(false);
  }, [index]);

  // Fetch trailer for current movie
  useEffect(() => {
    if (pool.length === 0) return;
    const movie = pool[index];
    if (!movie || trailerKeys[movie.id]) return;

    getMovieDetails(movie.id, tmdbLang(lang))
      .then((details) => {
        const trailer = details.videos?.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        ) || details.videos?.results.find((v) => v.site === "YouTube");
        
        if (trailer) {
          setTrailerKeys((prev) => ({ ...prev, [movie.id]: trailer.key }));
        }
      })
      .catch(() => {});
  }, [index, pool, lang]);

  // Delayed video reveal
  useEffect(() => {
    const movie = pool[index];
    if (!movie || !trailerKeys[movie.id]) return;

    const timer = setTimeout(() => {
      setVideoReady(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [index, trailerKeys, pool]);

  if (pool.length === 0) {
    return <div className="h-[92vh] bg-surface-secondary shimmer-gold" />;
  }

  const movie = pool[index];
  const currentTrailerKey = trailerKeys[movie.id];

  return (
    <section className="relative h-[80vh] md:h-[92vh] min-h-[500px] md:min-h-[560px] w-full overflow-hidden">
      {/* Static Backdrops — always present as fallback */}
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
                className="w-full h-full object-cover object-top scale-105"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
          </div>
        );
      })}

      {/* Video Trailer Background — fades in over the static image */}
      {currentTrailerKey && (
        <div
          className={`absolute inset-0 z-[1] transition-opacity duration-1000 ease-in-out ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Shield to prevent interaction and hide YouTube UI */}
          <div className="absolute inset-0 z-[10] pointer-events-none" />
          
          <iframe
            key={`trailer-${movie.id}-${index}`}
            src={`https://www.youtube.com/embed/${currentTrailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentTrailerKey}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&vq=hd1080&playsinline=1&disablekb=1&fs=0`}
            title="Trailer"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[300%] h-full md:w-[180%] lg:w-[120%] pointer-events-none z-[5]"
            allow="autoplay; encrypted-media"
            style={{ border: 0 }}
          />
        </div>
      )}

      {/* Grain + gradients */}
      <div className="absolute inset-0 z-[2] grain" />
      <div className={`absolute inset-0 z-[2] bg-gradient-to-t ${kidsMode ? 'from-background via-background/40' : 'from-surface-primary via-surface-primary/60'} to-transparent`} />
      <div className={`absolute inset-0 z-[2] bg-gradient-to-r ${kidsMode ? 'from-background/80 via-background/20' : 'from-surface-primary/95 via-surface-primary/40'} to-transparent`} />
      {/* Extra bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] z-[2] bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full container flex items-end md:items-center pb-12 md:pb-0">
        <div
          key={movie.id}
          className="max-w-2xl animate-fade-slide-up"
        >
          <span className="inline-block px-3 py-1 mb-3 md:mb-4 text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-full border border-accent-subtle text-accent bg-accent/5 backdrop-blur">
            ★ {movie.vote_average.toFixed(1)}  ·  {movie.release_date?.slice(0, 4)}
          </span>

          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-3 md:mb-5">
            <span className="text-gradient-accent">{movie.title}</span>
          </h1>

          <p className="text-foreground text-sm md:text-lg leading-relaxed max-w-xl mb-5 md:mb-8 line-clamp-2 md:line-clamp-3 font-medium">
            {movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 md:gap-2.5 bg-gradient-accent text-accent-foreground font-semibold px-5 md:px-7 py-3 md:py-3.5 rounded-full shadow-accent hover:scale-[1.04] active:scale-[0.98] transition-transform duration-300 ease-luxe animate-pulse-glow text-sm md:text-base"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-accent-foreground" />
              {t("hero_watch")}
            </Link>
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-full border border-border bg-surface-elevated/60 backdrop-blur hover:bg-surface-elevated hover:border-accent-subtle transition-colors text-sm md:text-base"
            >
              <Info className="w-4 h-4 md:w-5 md:h-5" />
              {t("hero_info")}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 md:bottom-8 end-4 md:end-8 z-10 flex gap-2">
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
