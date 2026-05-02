
import { useEffect, useState, useCallback, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { searchMulti, getMovieGenres, discoverMovies, discoverSeries, IMG } from "@/services/tmdb";
import { searchCustomContent } from "@/services/customContent";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { tmdbLang } from "@/services/i18n";
import { Search as SearchIcon, Loader2, SlidersHorizontal, X, Film, Tv, TrendingUp, Sparkles, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const POPULAR_GENRES = [
  { id: 28, name_ar: "أكشن", name_fr: "Action", icon: "💥" },
  { id: 35, name_ar: "كوميدي", name_fr: "Comédie", icon: "😂" },
  { id: 18, name_ar: "دراما", name_fr: "Drame", icon: "🎭" },
  { id: 27, name_ar: "رعب", name_fr: "Horreur", icon: "👻" },
  { id: 878, name_ar: "خيال علمي", name_fr: "S-F", icon: "🚀" },
  { id: 16, name_ar: "أنيميشن", name_fr: "Animation", icon: "🦄" },
];

const Search = () => {
  const { lang, t } = useLanguage();
  const { kidsMode } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const tl = tmdbLang(lang);
  const inputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");

  useEffect(() => {
    const urlQ = searchParams.get("q");
    if (urlQ !== null && urlQ !== q) {
      setQ(urlQ);
    }
  }, [searchParams]);

  useEffect(() => {
    getMovieGenres(tl)
      .then((r) => setGenres(r.genres))
      .catch(() => {});
  }, [tl]);

  const performSearch = useCallback(async () => {
    if (q.trim().length < 2 && !selectedGenre && !selectedYear && !selectedRating) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      if (q.trim().length >= 2) {
        const r = await searchMulti(q, tl);
        const customResults = searchCustomContent(q);
        
        let filtered = [
          ...customResults,
          ...r.results.filter(
            (item: any) => (item.media_type === "movie" || item.media_type === "tv") && 
            !customResults.some(cr => cr.title.toLowerCase() === (item.title || item.name || "").toLowerCase())
          )
        ];

        if (kidsMode) {
          filtered = filtered.filter((item: any) => {
            const gs = item.genre_ids || [];
            return !gs.includes(27) && !gs.includes(53) && !item.adult;
          });
        }
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
          filtered = filtered.filter((item: any) => item.vote_average >= Number(selectedRating));
        }
        setResults(filtered);
      } else {
        // Discover mode
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
          const combined = [
            ...movies.results.map((m: any) => ({ ...m, media_type: "movie" })),
            ...series.results.map((s: any) => ({ ...s, media_type: "tv" })),
          ].sort((a: any, b: any) => b.vote_average - a.vote_average);
          
          setResults(kidsMode ? combined.filter(m => !m.genre_ids?.includes(27)).slice(0, 40) : combined.slice(0, 40));
        }
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [q, tl, selectedGenre, selectedYear, selectedRating, mediaFilter, kidsMode]);

  useEffect(() => {
    const id = setTimeout(performSearch, 400);
    return () => clearTimeout(id);
  }, [q, selectedGenre, selectedYear, selectedRating, mediaFilter, performSearch]);

  const clearFilters = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setSelectedRating("");
    setMediaFilter("all");
    setQ("");
    setSearchParams({});
  };

  const hasActiveFilters = selectedGenre || selectedYear || selectedRating || mediaFilter !== "all";

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem("bnkhub_recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveToRecent = (item: any) => {
    const newItem = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      media_type: item.media_type,
      vote_average: item.vote_average,
      release_date: item.release_date || item.first_air_date
    };
    const filtered = recentSearches.filter(r => r.id !== newItem.id);
    const updated = [newItem, ...filtered].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("bnkhub_recent_searches", JSON.stringify(updated));
  };

  const firstResultBackdrop = results[0]?.backdrop_path ? IMG.backdrop(results[0].backdrop_path, "w1280") : null;

  return (
    <Layout>
      {/* Dynamic Blurred Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 opacity-20 blur-[100px]"
          style={{ backgroundImage: firstResultBackdrop ? `url(${firstResultBackdrop})` : 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="relative z-10 container pt-32 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10 animate-fade-in">
             <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center shadow-glow-accent">
                <SearchIcon className="w-6 h-6 text-accent" />
             </div>
             <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
               {lang === "ar" ? "ابحث عن المحتوى" : "Recherche"}
             </h1>
          </div>

          {/* Search Box */}
          <div className="relative mb-12 animate-fade-slide-up">
            <div className={`absolute inset-0 bg-accent/10 blur-3xl transition-opacity duration-500 ${loading ? 'opacity-100' : 'opacity-0'}`} />
            <div className="relative group">
              <input
                ref={inputRef}
                autoFocus
                value={q}
                onChange={(e) => {
                   setQ(e.target.value);
                   setSearchParams(e.target.value ? { q: e.target.value } : {});
                }}
                placeholder={lang === "ar" ? "ابحث عن أفلام، مسلسلات، ممثلين..." : "Chercher un film, une série, un acteur..."}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-16 py-6 text-xl md:text-2xl font-light text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all shadow-2xl backdrop-blur-xl"
              />
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-white/30 group-focus-within:text-accent transition-colors" />
              {q && (
                <button 
                  onClick={() => { setQ(""); setSearchParams({}); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Filters & Categories */}
          {!q && !hasActiveFilters && (
            <div className="space-y-16 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
              {/* Popular Genres */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">
                    {lang === "ar" ? "تصنيفات شائعة" : "Genres Populaires"}
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {POPULAR_GENRES.map((genre, idx) => (
                    <button
                      key={genre.id}
                      onClick={() => setSelectedGenre(String(genre.id))}
                      className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all animate-fade-slide-up text-center"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className="text-3xl block mb-3 transform group-hover:scale-125 transition-transform">{genre.icon}</span>
                      <span className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                        {lang === "ar" ? genre.name_ar : genre.name_fr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent History */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">
                        {lang === "ar" ? "عمليات البحث الأخيرة" : "Recherches Récentes"}
                      </h2>
                    </div>
                    <button 
                      onClick={() => { setRecentSearches([]); localStorage.removeItem("bnkhub_recent_searches"); }}
                      className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors"
                    >
                      {lang === "ar" ? "مسح السجل" : "Effacer"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {recentSearches.slice(0, 5).map((m) => (
                      <div key={`recent-${m.id}`} className="relative group">
                         <MovieCard
                          id={m.id}
                          title={m.title}
                          posterPath={m.poster_path}
                          year={m.release_date?.slice(0, 4)}
                          rating={m.vote_average}
                          type={m.media_type}
                          className="opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Search & Filters Controls */}
          {(q || hasActiveFilters) && (
             <div className="animate-fade-in">
               <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl border text-sm font-bold transition-all ${showFilters || hasActiveFilters ? 'bg-accent text-accent-foreground border-accent' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                    >
                      <Filter className="w-4 h-4" />
                      {t("search_filters")}
                      {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </button>
                    {hasActiveFilters && (
                       <button onClick={clearFilters} className="text-xs font-bold text-white/40 hover:text-red-400 transition-colors">
                         {t("search_clear")}
                       </button>
                    )}
                 </div>
                 <div className="text-sm text-white/30 font-medium tracking-wide uppercase">
                    {loading ? (
                       <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {lang === "ar" ? "جاري البحث..." : "Recherche..."}</span>
                    ) : (
                       <span>{results.length} {lang === "ar" ? "نتيجة" : "Résultats"}</span>
                    )}
                 </div>
               </div>

               {/* Filter Bar */}
               {showFilters && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl mb-12 animate-fade-slide-up">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Type</label>
                       <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent">
                         <option value="all">Tous</option>
                         <option value="movie">Films</option>
                         <option value="tv">Séries</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2"><Film className="w-3 h-3" /> Genre</label>
                       <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent">
                         <option value="">Tous</option>
                         {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Année</label>
                       <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent">
                         <option value="">Toutes</option>
                         {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Note</label>
                       <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent">
                         <option value="">Toutes</option>
                         {[9,8,7,6,5].map(v => <option key={v} value={v}>⭐ {v}+</option>)}
                       </select>
                    </div>
                 </div>
               )}

               {/* Grid Results */}
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-4">
                 {results.map((m, idx) => (
                    <div key={`${m.media_type}-${m.id}`} onClick={() => saveToRecent(m)} className="animate-fade-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                       <MovieCard
                        id={m.id}
                        title={m.title || m.name}
                        posterPath={m.poster_path}
                        year={(m.release_date || m.first_air_date)?.slice(0, 4)}
                        rating={m.vote_average}
                        type={m.media_type}
                        className="w-full"
                      />
                    </div>
                 ))}
               </div>

               {!loading && results.length === 0 && (
                 <div className="py-32 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                       <SearchIcon className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-xl text-white/40 font-medium">
                      {lang === "ar" ? "لم نجد أي نتائج للأسف..." : "Aucun résultat trouvé..."}
                    </p>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
