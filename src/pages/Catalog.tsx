
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { 
  getPopularMovies, 
  getPopularSeries, 
  discoverMovies, 
  discoverSeries, 
  TMDBMovie, 
  TMDBSeries 
} from "@/services/tmdb";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  mode: "movies" | "series";
}

const Catalog = ({ mode }: Props) => {
  const { lang, t } = useLanguage();
  const { kidsMode } = useSettings();
  const [searchParams] = useSearchParams();
  
  const [items, setItems] = useState<(TMDBMovie | TMDBSeries)[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const providerId = searchParams.get("provider");
  const providerName = searchParams.get("providerName");

  // Reset when mode, language or provider changes
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [mode, lang, providerId]);

  useEffect(() => {
    let active = true;
    const tl = tmdbLang(lang);
    const isMovies = mode === "movies";

    const loadData = async () => {
      setLoading(true);
      try {
        let response;
        if (kidsMode) {
          // If Kids Mode is on, prioritize Animation (16) and Family (10751) genres
          const params = {
            page: String(page),
            with_genres: "16,10751",
            sort_by: "popularity.desc",
            watch_region: "FR"
          };
          response = isMovies ? await discoverMovies(tl, params) : await discoverSeries(tl, params);
        } else if (providerId) {
          // Discover by provider
          const params = {
            page: String(page),
            with_watch_providers: providerId,
            watch_region: "FR", // Region FR is more reliable for worldwide content
            sort_by: "popularity.desc"
          };
          response = isMovies ? await discoverMovies(tl, params) : await discoverSeries(tl, params);
        } else {
          // Normal popular list
          response = isMovies ? await getPopularMovies(tl, page) : await getPopularSeries(tl, page);
        }

        if (!active) return;

        if (response && response.results) {
          const results = response.results;
          const filtered = !kidsMode 
            ? results 
            : results.filter((m: any) => {
                const genres = m.genre_ids || [];
                return !genres.includes(27) && !genres.includes(53);
              });

          setItems(prev => page === 1 ? filtered : [...prev, ...filtered]);
        }
      } catch (err) {
        console.error("Catalog Fetch Error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, [mode, page, lang, kidsMode, providerId]);

  const pageTitle = providerName ? `${providerName} Hub` : (mode === "movies" ? t("nav_movies") : t("nav_series"));

  return (
    <Layout>
      <SEO 
        title={pageTitle}
        description={`تصفح وشاهد أفضل ${pageTitle} مجاناً وبجودة عالية على BNK HUB.`}
        keywords={`${pageTitle}, مشاهدة مجانية, BNK HUB, افلام و مسلسلات`}
      />
      <section className="pt-28 pb-12 container min-h-screen">
        <div className="flex items-center gap-4 mb-8">
           <div className="h-10 w-1.5 bg-accent rounded-full shadow-glow" />
           <h1 className="font-display text-4xl md:text-5xl text-gradient-accent">
            {pageTitle}
          </h1>
        </div>

        {items.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-xl mb-4">{t("no_results") || "Aucun résultat trouvé"}</p>
            <button 
              onClick={() => window.location.href = window.location.pathname}
              className="text-accent hover:underline"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-6 pt-10 pb-20">
            {items.map((m: any, idx) => (
              <div key={`${m.id}-${idx}`} className="animate-fade-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <MovieCard
                  id={m.id}
                  title={m.title ?? m.name}
                  posterPath={m.poster_path}
                  year={(m.release_date ?? m.first_air_date ?? "").slice(0, 4)}
                  rating={m.vote_average}
                  type={mode === "movies" ? "movie" : "tv"}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-glow-accent animate-pulse-glow mb-4">
                <img src="/icon.png" alt="Loading..." className="w-full h-full object-cover" />
              </div>
              <div className="absolute -inset-3 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-10 py-4 bg-surface-card border border-accent/20 rounded-full hover:bg-accent hover:text-accent-foreground transition-all duration-300 font-bold shadow-glow-sm"
            >
              {lang === "ar" ? "تحميل المزيد" : "Charger plus"}
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Catalog;
