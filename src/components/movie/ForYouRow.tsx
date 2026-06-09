/**
 * BNKhub — "Pour Vous" (For You) Row.
 * Personnalise les recommandations basées sur l'historique de visionnage de l'utilisateur.
 */
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getRecentHistory } from "@/services/watchHistory";
import { getMovieRecommendations, getSeriesRecommendations, TMDBMovie } from "@/services/tmdb";
import { tmdbLang } from "@/services/i18n";

export const ForYouRow = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
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

  return (
    <section className="relative py-4">
      <div className="container mb-5">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          <h2 className="font-display text-2xl md:text-3xl">
            <span className="text-gradient-accent">
              {lang === "ar" ? "🎯 مقترح لك" : "🎯 Pour Vous"}
            </span>
          </h2>
        </div>
      </div>

      <div className="container pt-6 pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-6">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-xl shimmer-gold"
                />
              ))
            : items.slice(0, 7).map((m: any) => (
                <div key={`fy-${m.id}`}>
                  <MovieCard
                    id={m.id}
                    title={m.title ?? m.name ?? ""}
                    posterPath={m.poster_path}
                    year={(m.release_date ?? m.first_air_date ?? "").slice(0, 4)}
                    rating={m.vote_average}
                    type={m.media_type === "tv" || m.first_air_date ? "tv" : "movie"}
                    className="w-full"
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
