/**
 * BNKhub — Arabic & Korean Content Rows.
 * Uses TMDB Discover API with with_original_language filter.
 */
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { discoverMovies, discoverSeries, TMDBMovie, TMDBSeries } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";

interface ContentRowProps {
  title: string;
  originalLanguage: string;
  type?: "movie" | "tv";
  genres?: string;
  icon?: string;
}

export const DiscoverRow = ({ title, originalLanguage, type = "movie", genres, icon }: ContentRowProps) => {
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<(TMDBMovie | TMDBSeries)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const params: Record<string, string> = {
      with_original_language: originalLanguage,
      sort_by: "popularity.desc",
    };
    if (genres) params.with_genres = genres;

    const fetcher = type === "tv" ? discoverSeries : discoverMovies;
    fetcher(tmdbLang(lang), params)
      .then((data) => {
        if (mounted) {
          setItems(data.results.filter((m: any) => m.poster_path));
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [lang, originalLanguage, type, genres]);

  if (!loading && items.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="relative py-4 group/row">
      <div className="container flex items-end justify-between mb-5">
        <h2 className="font-display text-2xl md:text-3xl">
          <span className="text-gradient-accent">{icon ? `${icon} ` : ""}{title}</span>
        </h2>
        <div className="hidden md:flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scroll(-1)}
            className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur border border-border hover:border-accent-subtle grid place-items-center"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur border border-border hover:border-accent-subtle grid place-items-center"
            aria-label="Suivant"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="container overflow-x-auto scrollbar-hide flex gap-4 md:gap-5 pt-6 pb-4 snap-x snap-mandatory"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[150px] sm:w-[170px] md:w-[190px] aspect-[2/3] rounded-xl shimmer-gold"
              />
            ))
          : items.map((m: any) => (
              <div key={`${type}-${m.id}`} className="snap-start">
                <MovieCard
                  id={m.id}
                  title={m.title ?? m.name ?? ""}
                  posterPath={m.poster_path}
                  year={(m.release_date ?? m.first_air_date ?? "").slice(0, 4)}
                  rating={m.vote_average}
                  type={type}
                />
              </div>
            ))}
      </div>
    </section>
  );
};
