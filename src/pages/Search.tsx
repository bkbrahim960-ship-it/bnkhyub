
import { useEffect, useState, useCallback, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { searchMulti, getMovieGenres, discoverMovies, discoverSeries, IMG } from "@/services/tmdb";
import { searchCustomContent } from "@/services/customContent";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { tmdbLang } from "@/services/i18n";
import { 
  Search as SearchIcon, 
  Loader2, 
  X, 
  Film, 
  Tv, 
  TrendingUp, 
  Sparkles, 
  Filter, 
  Flame, 
  Laugh, 
  Ghost, 
  Rocket, 
  Theater, 
  Gamepad2,
  Calendar,
  Star,
  Globe2,
  ArrowRight
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const POPULAR_GENRES = [
  { id: 28, name_ar: "أكشن", name_fr: "Action", Icon: Flame, color: "from-orange-500/20" },
  { id: 35, name_ar: "كوميدي", name_fr: "Comédie", Icon: Laugh, color: "from-yellow-500/20" },
  { id: 18, name_ar: "دراما", name_fr: "Drame", Icon: Theater, color: "from-blue-500/20" },
  { id: 27, name_ar: "رعب", name_fr: "Horreur", Icon: Ghost, color: "from-purple-500/20" },
  { id: 878, name_ar: "خيال علمي", name_fr: "S-F", Icon: Rocket, color: "from-cyan-500/20" },
  { id: 16, name_ar: "أنيميشن", name_fr: "Animation", Icon: Gamepad2, color: "from-pink-500/20" },
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
            !customResults.some(cr => cr.id === item.id)
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
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-110 opacity-30 blur-[120px]"
          style={{ backgroundImage: firstResultBackdrop ? `url(${firstResultBackdrop})` : 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="relative z-10 container pt-32 pb-20 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header Title */}
          <div className="flex items-center gap-4 mb-10 animate-fade-in">
             <div className="h-10 w-1.5 bg-accent rounded-full shadow-glow" />
             <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
               {lang === "ar" ? "ابحث عن المحتوى" : "Explorer le Catalogue"}
             </h1>
          </div>

          {/* Premium Search Box */}
          <div className="relative mb-16 animate-fade-slide-up">
            <div className={`absolute -inset-1 bg-gradient-accent blur-xl transition-opacity duration-700 rounded-[2.5rem] ${loading ? 'opacity-30' : 'opacity-0'}`} />
            <div className="relative group">
              <input
                ref={inputRef}
                autoFocus
                value={q}
                onChange={(e) => {
                   setQ(e.target.value);
                   setSearchParams(e.target.value ? { q: e.target.value } : {});
                }}
                placeholder={lang === "ar" ? "ابحث عن أفلام، مسلسلات، ممثلين..." : "Rechercher un film, une série, un acteur..."}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-16 py-7 text-xl md:text-2xl font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:bg-white/[0.08] focus:shadow-glow-accent/10 transition-all shadow-2xl backdrop-blur-2xl"
              />
              <SearchIcon className="absolute left-7 top-1/2 -translate-y-1/2 w-7 h-7 text-white/30 group-focus-within:text-accent transition-colors" />
              {q && (
                <button 
                  onClick={() => { setQ(""); setSearchParams({}); }}
                  className="absolute right-7 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Landing State: Genres & Recent */}
          {!q && !hasActiveFilters && (
            <div className="space-y-20 animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
              
              {/* Popular Genres (BrandRow style) */}
              <div>
                <div className="flex items-center gap-3 mb-8 px-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">
                    {lang === "ar" ? "تصنيفات شائعة" : "Genres Populaires"}
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                  {POPULAR_GENRES.map((genre, idx) => {
                    const GenreIcon = genre.Icon;
                    return (
                      <button
                        key={genre.id}
                        onClick={() => setSelectedGenre(String(genre.id))}
                        className="group relative flex flex-col items-center justify-center aspect-[16/10] p-6 rounded-2xl bg-surface-card/40 backdrop-blur-xl border border-border/50 hover:border-accent/60 transition-all duration-500 hover:scale-[1.05] hover:shadow-glow active:scale-95 overflow-hidden animate-fade-slide-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <GenreIcon className="w-8 h-8 mb-3 text-white group-hover:text-accent group-hover:scale-125 transition-all duration-500" />
                        <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                          {lang === "ar" ? genre.name_ar : genre.name_fr}
                        </span>
                        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent History */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">
                        {lang === "ar" ? "عمليات البحث الأخيرة" : "Consultés Récemment"}
                      </h2>
                    </div>
                    <button 
                      onClick={() => { setRecentSearches([]); localStorage.removeItem("bnkhub_recent_searches"); }}
                      className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors"
                    >
                      {lang === "ar" ? "مسح السجل" : "Vider le cache"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                    {recentSearches.slice(0, 5).map((m) => (
                      <div key={`recent-${m.id}`} className="group relative">
                         <MovieCard
                          id={m.id}
                          title={m.title}
                          posterPath={m.poster_path}
                          year={m.release_date?.slice(0, 4)}
                          rating={m.vote_average}
                          type={m.media_type}
                          className="opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Search & Filter Controls */}
          {(q || hasActiveFilters) && (
             <div className="animate-fade-in">
               <div className="flex flex-wrap items-center justify-between gap-6 mb-10 px-2">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl border text-sm font-bold transition-all ${showFilters || hasActiveFilters ? 'bg-accent text-accent-foreground border-accent shadow-glow' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                    >
                      <Filter className="w-4 h-4" />
                      {t("search_filters")}
                      {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </button>
                    {hasActiveFilters && (
                       <button onClick={clearFilters} className="text-xs font-bold text-white/40 hover:text-red-400 transition-colors flex items-center gap-2">
                         <X className="w-3 h-3" /> {t("search_clear")}
                       </button>
                    )}
                 </div>
                 <div className="flex items-center gap-3 text-xs font-black tracking-[0.2em] uppercase text-white/30">
                    {loading ? (
                       <span className="flex items-center gap-2 text-accent"><Loader2 className="w-4 h-4 animate-spin" /> {lang === "ar" ? "جاري البحث..." : "Synchronisation..."}</span>
                    ) : (
                       <span className="flex items-center gap-2 tracking-tighter"><Sparkles className="w-4 h-4 text-accent" /> {results.length} {lang === "ar" ? "نتيجة" : "Résultats trouvés"}</span>
                    )}
                 </div>
               </div>

               {/* Advanced Filter Panel (Glassmorphic) */}
               {showFilters && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl mb-16 animate-fade-slide-up shadow-2xl">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2"><Tv className="w-3.5 h-3.5 text-accent" /> Format</label>
                       <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value as any)} className="w-full bg-surface-primary/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent appearance-none transition-all">
                         <option value="all">Tous types</option>
                         <option value="movie">Films</option>
                         <option value="tv">Séries</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2"><Film className="w-3.5 h-3.5 text-accent" /> Genre</label>
                       <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="w-full bg-surface-primary/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent appearance-none transition-all">
                         <option value="">Tous les genres</option>
                         {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-accent" /> Époque</label>
                       <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full bg-surface-primary/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent appearance-none transition-all">
                         <option value="">Toutes les années</option>
                         {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-2"><Star className="w-3.5 h-3.5 text-accent" /> Qualité</label>
                       <select value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)} className="w-full bg-surface-primary/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent appearance-none transition-all">
                         <option value="">Toutes les notes</option>
                         {[9,8,7,6,5].map(v => <option key={v} value={v}>Chef-d'œuvre (⭐ {v}+)</option>)}
                       </select>
                    </div>
                 </div>
               )}

               {/* Results Grid with Staggered Fade */}
               <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-8">
                 {results.map((m, idx) => (
                    <div key={`${m.media_type}-${m.id}`} onClick={() => saveToRecent(m)} className="animate-fade-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
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
                 <div className="py-40 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
                       <SearchIcon className="w-10 h-10 text-white/10" />
                    </div>
                    <p className="text-2xl text-white/20 font-medium mb-2">
                      {lang === "ar" ? "لم نجد أي نتائج للأسف..." : "Désolé, nous n'avons rien trouvé."}
                    </p>
                    <p className="text-sm text-white/10 tracking-widest uppercase">
                      {lang === "ar" ? "جرب كلمات بحث أخرى" : "Essayez d'autres mots-clés ou filtres."}
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
