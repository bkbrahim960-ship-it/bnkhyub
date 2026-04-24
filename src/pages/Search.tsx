/**
 * BNKhub — Recherche avec suggestions live TMDB.
 */
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { searchMulti } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { Search as SearchIcon, Loader2 } from "lucide-react";

const Search = () => {
  const { lang, t } = useLanguage();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => {
      setLoading(true);
      searchMulti(q, tmdbLang(lang))
        .then((r) => {
          const filtered = r.results.filter(
            (item: any) => item.media_type === "movie" || item.media_type === "tv"
          );
          setResults(filtered);
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(id);
  }, [q, lang]);

  return (
    <Layout>
      <section className="pt-28 pb-12">
        <div className="container">
          <h1 className="font-display text-4xl md:text-5xl mb-8 text-gradient-accent">
            {t("nav_search")}
          </h1>

          <div className="relative max-w-2xl">
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
        </div>
      </section>

      <section className="container pb-20">
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {results.map((m) => (
              <MovieCard
                key={m.id}
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
        {!loading && q.length >= 2 && results.length === 0 && (
          <p className="text-center text-muted-foreground py-20">Aucun résultat.</p>
        )}
      </section>
    </Layout>
  );
};

export default Search;
