/**
 * BNKhub — Page Films / Séries (liste paginée TMDB).
 */
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { getPopularMovies, getPopularSeries, TMDBMovie, TMDBSeries } from "@/services/tmdb";

interface Props {
  mode: "movies" | "series";
}

const Catalog = ({ mode }: Props) => {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<(TMDBMovie | TMDBSeries)[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = mode === "movies" ? getPopularMovies : getPopularSeries;
    fetcher(tmdbLang(lang), page)
      .then((r) => setItems((prev) => (page === 1 ? r.results : [...prev, ...r.results])))
      .finally(() => setLoading(false));
  }, [mode, page, lang]);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [mode, lang]);

  return (
    <Layout>
      <section className="pt-28 pb-12 container">
        <h1 className="font-display text-4xl md:text-5xl mb-8 text-gradient-accent">
          {mode === "movies" ? t("nav_movies") : t("nav_series")}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {items.map((m: any) => (
            <MovieCard
              key={m.id}
              id={m.id}
              title={m.title ?? m.name}
              posterPath={m.poster_path}
              year={(m.release_date ?? m.first_air_date ?? "").slice(0, 4)}
              rating={m.vote_average}
              type={mode === "movies" ? "movie" : "tv"}
              className="w-full"
            />
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="px-8 py-3 rounded-full border border-accent-subtle text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
          >
            {loading ? t("loading") : "Charger plus"}
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default Catalog;
