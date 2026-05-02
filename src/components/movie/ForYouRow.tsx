/**
 * BNKhub — "Pour Vous" (For You) Row.
 * Personnalise les recommandations basées sur l'historique de visionnage de l'utilisateur.
 */
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getRecentHistory } from "@/services/watchHistory";
import { getMovieRecommendations, getSeriesRecommendations, TMDBMovie } from "@/services/tmdb";
import { tmdbLang } from "@/services/i18n";

export const ForYouRow = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let canceled = false;
    setLoading(true);

    getRecentHistory(user.id, 10)
      .then(async (history) => {
        if (canceled || history.length === 0) {
          setLoading(false);
          return;
        }

        // Get recommendations based on watched items
        const promises = history.slice(0, 5).map((entry) =>
          entry.media_type === "tv"
            ? getSeriesRecommendations(entry.tmdb_id, tmdbLang(lang)).catch(() => ({ results: [] }))
            : getMovieRecommendations(entry.tmdb_id, tmdbLang(lang)).catch(() => ({ results: [] }))
        );

        const results = await Promise.all(promises);
        if (canceled) return;

        // Flatten, deduplicate, and shuffle
        const watchedIds = new Set(history.map((h) => h.tmdb_id));
        const allRecs = results.flatMap((r) => r.results);
        const seen = new Set<number>();
        const unique = allRecs.filter((m: any) => {
          if (!m.poster_path || seen.has(m.id) || watchedIds.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });

        // Shuffle for variety
        for (let i = unique.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [unique[i], unique[j]] = [unique[j], unique[i]];
        }

        setItems(unique.slice(0, 20) as TMDBMovie[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => {
      canceled = true;
    };
  }, [user, lang]);

  if (!user || (!loading && items.length === 0)) return null;

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="relative py-4 group/row">
      <div className="container flex items-end justify-between mb-5">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          <h2 className="font-display text-2xl md:text-3xl">
            <span className="text-gradient-accent">
              {lang === "ar" ? "🎯 مُقترح لك" : "🎯 Pour Vous"}
            </span>
          </h2>
        </div>
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
              <div key={`fy-${m.id}`} className="snap-start">
                <MovieCard
                  id={m.id}
                  title={m.title ?? m.name ?? ""}
                  posterPath={m.poster_path}
                  year={(m.release_date ?? m.first_air_date ?? "").slice(0, 4)}
                  rating={m.vote_average}
                  type={m.media_type === "tv" || m.first_air_date ? "tv" : "movie"}
                />
              </div>
            ))}
      </div>
    </section>
  );
};
