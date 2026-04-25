/**
 * BNKhub — Recherche avancée avec filtres (genre, année, note).
 */
import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { searchMulti, getMovieGenres, discoverMovies, discoverSeries } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { tmdbLang } from "@/services/i18n";
import { Search as SearchIcon, Loader2, SlidersHorizontal, X } from "lucide-react";

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const Search = () => {
  const { lang, t } = useLanguage();
  const { kidsMode } = useSettings();
  const tl = tmdbLang(lang);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");

  // Load genres
  useEffect(() => {
    getMovieGenres(tl)
      .then((r) => setGenres(r.genres))
      .catch(() => {});
  }, [tl]);

  // Search with debounce
  useEffect(() => {
    if (q.trim().length < 2 && !selectedGenre && !selectedYear && !selectedRating) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => {
      performSearch();
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, lang, selectedGenre, selectedYear, selectedRating, mediaFilter]);

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      if (q.trim().length >= 2) {
        // Text search
        const r = await searchMulti(q, tl);
        let filtered = r.results.filter(
          (item: any) => item.media_type === "movie" || item.media_type === "tv"
        );
        if (mediaFilter !== "all") {
          filtered = filtered.filter((item: any) => item.media_type === mediaFilter);
        }
        if (selectedGenre) {
          filtered = filtered.filter((item: any) =>
            item.genre_ids?.includes(Number(selectedGenre))
          );
        }
        if (selectedYear) {
          filtered = filtered.filter((item: any) => {
            const date = item.release_date || item.first_air_date || "";
            return date.startsWith(selectedYear);
          });
        }
        if (selectedRating) {
          const minRating = Number(selectedRating);
          filtered = filtered.filter((item: any) => item.vote_average >= minRating);
        }
        setResults(filtered);
      } else if (selectedGenre || selectedYear || selectedRating) {
        // Discover mode (no text, just filters)
        const params: Record<string, string> = {};
        if (selectedGenre) params.with_genres = selectedGenre;
        if (selectedYear) {
          params["primary_release_year"] = selectedYear;
          params["first_air_date_year"] = selectedYear;
        }
        if (selectedRating) params["vote_average.gte"] = selectedRating;
        params.sort_by = "popularity.desc";

        if (mediaFilter === "tv") {
          const r = await discoverSeries(tl, params);
          setResults(r.results.map((s: any) => ({ ...s, media_type: "tv" })));
        } else if (mediaFilter === "movie") {
          const r = await discoverMovies(tl, params);
          setResults(r.results.map((m: any) => ({ ...m, media_type: "movie" })));
        } else {
          const [movies, series] = await Promise.all([
            discoverMovies(tl, params).catch(() => ({ results: [] })),
            discoverSeries(tl, params).catch(() => ({ results: [] })),
          ]);
            ...movies.results.map((m: any) => ({ ...m, media_type: "movie" })),
            ...series.results.map((s: any) => ({ ...s, media_type: "tv" })),
          ].sort((a: any, b: any) => b.vote_average - a.vote_average);
          
          if (kidsMode) {
            const kidsFiltered = combined.filter((m: any) => !m.genre_ids?.includes(27) && !m.genre_ids?.includes(53));
            setResults(kidsFiltered.slice(0, 40));
          } else {
            setResults(combined.slice(0, 40));
          }
        }
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [q, tl, selectedGenre, selectedYear, selectedRating, mediaFilter, kidsMode]);

  const clearFilters = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setSelectedRating("");
    setMediaFilter("all");
  };

  const hasActiveFilters = selectedGenre || selectedYear || selectedRating || mediaFilter !== "all";

  return (
    <Layout>
      <section className="pt-28 pb-8">
        <div className="container">
          <h1 className="font-display text-4xl md:text-5xl mb-8 text-gradient-accent">
            {t("nav_search")}
          </h1>

          {/* Search Input */}
          <div className="relative max-w-2xl mb-6">
            <SearchIcon className="absolute top-1/2 start-5 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full bg-surface-card border border-border rounded-full pe-6 ps-14 py-4 text-lg focus:border-accent focus:shadow-accent focus:outline-none transition-all duration-300"
            />
            {loading && (
              <Loader2 className="absolute top-1/2 end-5 -translate-y-1/2 w-5 h-5 text-accent animate-spin" />
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
                showFilters || hasActiveFilters
                  ? "bg-accent/15 border-accent-subtle text-accent"
                  : "bg-surface-card border-border text-muted-foreground hover:border-accent-subtle"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("search_filters")}
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs text-muted-foreground hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" /> {t("search_clear")}
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-surface-card border border-border rounded-2xl p-6 mb-8 animate-fade-slide-up">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Media Type */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">{t("search_type")}</label>
                  <select
                    value={mediaFilter}
                    onChange={(e) => setMediaFilter(e.target.value as any)}
                    className="w-full bg-surface-primary border border-border rounded-lg px-3 py-2.5 text-sm focus:border-accent-subtle focus:outline-none"
                  >
                    <option value="all">Tous</option>
                    <option value="movie">Films</option>
                    <option value="tv">Séries</option>
                  </select>
                </div>

                {/* Genre */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">{t("search_genre")}</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-surface-primary border border-border rounded-lg px-3 py-2.5 text-sm focus:border-accent-subtle focus:outline-none"
                  >
                    <option value="">Tous les genres</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">{t("search_year")}</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-surface-primary border border-border rounded-lg px-3 py-2.5 text-sm focus:border-accent-subtle focus:outline-none"
                  >
                    <option value="">Toutes</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">{t("search_rating")}</label>
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    className="w-full bg-surface-primary border border-border rounded-lg px-3 py-2.5 text-sm focus:border-accent-subtle focus:outline-none"
                  >
                    <option value="">Toutes</option>
                    <option value="9">⭐ 9+</option>
                    <option value="8">⭐ 8+</option>
                    <option value="7">⭐ 7+</option>
                    <option value="6">⭐ 6+</option>
                    <option value="5">⭐ 5+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="container pb-20">
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {results.map((m) => (
              <MovieCard
                key={`${m.media_type}-${m.id}`}
                id={m.id}
                title={m.title || m.name}
                posterPath={m.poster_path}
                year={(m.release_date || m.first_air_date)?.slice(0, 4)}
                rating={m.vote_average}
                type={m.media_type}
                className="w-full"
              />
            ))}
          </div>
        )}
        {!loading && (q.length >= 2 || hasActiveFilters) && results.length === 0 && (
          <p className="text-center text-muted-foreground py-20">Aucun résultat trouvé.</p>
        )}
      </section>
    </Layout>
  );
};

export default Search;
