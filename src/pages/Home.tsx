/**
 * BNKhub — Page d'accueil.
 * Hero rotatif + rows TMDB + nouveautés vidsrc-embed.
 */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MovieHero } from "@/components/movie/MovieHero";
import { MovieRow } from "@/components/movie/MovieRow";
import { M3UMovieRow } from "@/components/movie/M3UMovieRow";
import { MovieCard } from "@/components/movie/MovieCard";
import { BrandRow } from "@/components/movie/BrandRow";
import { ContinueWatchingRow } from "@/components/movie/ContinueWatchingRow";
import { ForYouRow } from "@/components/movie/ForYouRow";
import { DiscoverRow } from "@/components/movie/DiscoverRow";
import { mergeTMDBPages } from "@/components/movie/SideWingColumn";
import { ROW_HEADER, ROW_TRACK } from "@/components/movie/rowLayout";
import { VidAPILatestRow } from "@/components/movie/VidAPILatestRow";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { tmdbLang } from "@/services/i18n";
import { AdBanner } from "@/components/ui/AdBanner";
import {
  getPopularMovies,
  getTopRatedMovies,
  getPopularSeries,
  getTopRatedSeries,
  getTrendingMovies,
  getNowPlaying,
  discoverMovies,
  discoverSeries,
  getMovieDetails,
  getSeriesDetails,
  TMDBMovie,
  TMDBSeries,
} from "@/services/tmdb";
import { KABYLE_CONTENT } from "@/services/customContent";
import { IMG } from "@/services/tmdb";
import { Play, Star } from "lucide-react";

interface CustomHLS {
  id: string;
  title: string;
  url: string;
  poster: string;
  category: string;
  type?: "movie" | "tv" | "live";
}

const supabaseM3ULists = [
  { 
    title_fr: "Séries TV Tendances", 
    title_ar: "البرامج التلفزيونية الرائجة", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u", 
    type: "tv" as const 
  },
  { 
    title_fr: "Films Populaires 2024-2025", 
    title_ar: "أفلام IMDB الشهيرة 2024-2025", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/top-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Films d'Action", 
    title_ar: "أفلام الأكشن", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/action-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Films d'Aventure", 
    title_ar: "أفلام المغامرة", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/adventure-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Films d'Animation", 
    title_ar: "أفلام الرسوم المتحركة", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/animation-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Comédies", 
    title_ar: "أفلام الكوميديا", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/comedy-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Films de Crime", 
    title_ar: "أفلام الجريمة", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/crime-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Documentaires", 
    title_ar: "الأفلام الوثائقية", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/documentary-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Drames", 
    title_ar: "أفلام الدراما", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/drama-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Films de Famille", 
    title_ar: "أفلام العائلة", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/family-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Fantaisie", 
    title_ar: "أفلام الفانتازيا", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/fantasy-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Histoire", 
    title_ar: "أفلام تاريخية", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/history-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Films d'Horreur", 
    title_ar: "أفلام الرعب", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/horror-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Musique", 
    title_ar: "أفلام موسيقية", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/music-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Mystère", 
    title_ar: "أفلام الغموض", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/mystery-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Romance", 
    title_ar: "أفلام الرومانسية", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/romance-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Science-Fiction", 
    title_ar: "أفلام الخيال العلمي", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/science-fiction-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Téléfilms", 
    title_ar: "أفلام تلفزيونية", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/tv-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Thrillers", 
    title_ar: "أفلام الإثارة", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/thriller-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Guerre", 
    title_ar: "أفلام الحرب", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/war-movies.m3u", 
    type: "movie" as const 
  },
  { 
    title_fr: "Western", 
    title_ar: "أفلام الغرب الأمريكي", 
    url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/western-movies.m3u", 
    type: "movie" as const 
  },
];

/** Kabyle cinema section */
const KabyleCinemaRow = () => {
  const { lang } = useLanguage();
  const allMovies = KABYLE_CONTENT;
  
  if (allMovies.length === 0) return null;

  return (
    <section className="relative py-8">
      <div className={ROW_HEADER}>
        <h2 className="font-display text-2xl md:text-3xl">
          <span className="text-gradient-accent">Kabyle</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "أفلام ومسلسلات بالأمازيغية القبائلية" : "Films et séries en langue Kabyle"}
        </p>
      </div>
      
      {/* Kabyle Movies */}
      <div className="mb-8">
        <h3 className={`${ROW_HEADER} text-lg font-display text-muted-foreground mb-0 py-0`}>
          {lang === "ar" ? "🎬 الأفلام" : "🎬 Films"}
        </h3>
        <div className={`${ROW_TRACK} pt-2`}>
          {allMovies.map((item) => (
            <div key={item.id} className="snap-start">
              <MovieCard
                id={item.id}
                title={item.title}
                posterPath={item.thumbnail}
                year={item.year || "Kabyle"}
                rating={item.rating}
                type="movie"
                customUrl={item.videoUrl}
              />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { kidsMode } = useSettings();
  const tl = tmdbLang(lang);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenLanding");
    if (hasSeen) return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      localStorage.setItem("hasSeenLanding", "true");
    } else {
      navigate("/landing");
    }
  }, [navigate]);

  const [hero, setHero] = useState<any[]>([]);
  const [popular, setPopular] = useState<TMDBMovie[]>([]);
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [topRated, setTopRated] = useState<TMDBMovie[]>([]);
  const [popularTV, setPopularTV] = useState<TMDBSeries[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<TMDBSeries[]>([]);
  const [nowPlaying, setNowPlaying] = useState<TMDBMovie[]>([]);
  const [kidsMovies, setKidsMovies] = useState<TMDBMovie[]>([]);
  const [kidsSeries, setKidsSeries] = useState<TMDBSeries[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    setLoading(true);

    const heroIds = [
      { id: 126732, type: "tv" }, // FROM
      { id: 1028679, type: "tv" }, // NEMESIS
      { id: 94997, type: "tv" }, // House of the Dragon
      { id: 201667, type: "tv" }, // Berlin
      { id: 71446, type: "tv" } // Money Heist
    ];

    if (kidsMode) {
      // Kids mode: animation (16) + family (10751)
      Promise.all([
        discoverMovies(tl, { with_genres: "16", sort_by: "popularity.desc" }).catch(() => ({ results: [] })),
        discoverSeries(tl, { with_genres: "16", sort_by: "popularity.desc" }).catch(() => ({ results: [] })),
        discoverMovies(tl, { with_genres: "10751", sort_by: "popularity.desc" }).catch(() => ({ results: [] })),
      ]).then(([animMovies, animSeries, familyMovies]) => {
        if (canceled) return;
        const safe = (items: any[]) => items.filter((m: any) => !m.adult);
        setKidsMovies(safe(animMovies.results));
        setKidsSeries(safe(animSeries.results));
        setHero(safe(animMovies.results.filter((m: any) => m.backdrop_path)).slice(0, 5));
        setPopular(safe(familyMovies.results));
        setTrending([]);
        setTopRated([]);
        setPopularTV([]);
        setTopRatedTV([]);
        setNowPlaying([]);
        setLoading(false);
      });
    } else {
      Promise.all([
        getTrendingMovies(tl, 1).catch(() => ({ results: [] })),
        getTrendingMovies(tl, 2).catch(() => ({ results: [] })),
        getPopularMovies(tl, 1).catch(() => ({ results: [] })),
        getPopularMovies(tl, 2).catch(() => ({ results: [] })),
        getPopularMovies(tl, 3).catch(() => ({ results: [] })),
        getTopRatedMovies(tl, 1).catch(() => ({ results: [] })),
        getTopRatedMovies(tl, 2).catch(() => ({ results: [] })),
        getPopularSeries(tl, 1).catch(() => ({ results: [] })),
        getPopularSeries(tl, 2).catch(() => ({ results: [] })),
        getPopularSeries(tl, 3).catch(() => ({ results: [] })),
        getTopRatedSeries(tl, 1).catch(() => ({ results: [] })),
        getTopRatedSeries(tl, 2).catch(() => ({ results: [] })),
        getNowPlaying(tl, 1).catch(() => ({ results: [] })),
        getNowPlaying(tl, 2).catch(() => ({ results: [] })),
        ...heroIds.map(item => 
          item.type === "tv" 
            ? getSeriesDetails(item.id, tl).catch(() => null) 
            : getMovieDetails(item.id, tl).catch(() => null)
        )
      ]).then(([tr1, tr2, pop1, pop2, pop3, top1, top2, tv1, tv2, tv3, topTV1, topTV2, np1, np2, ...heroResults]) => {
        if (canceled) return;
        setTrending(mergeTMDBPages(tr1, tr2));
        
        const validHeroPicks = heroResults.filter((item): item is any => item !== null && item.backdrop_path);
        const validTrending = tr1.results.filter((item: any) => item && item.backdrop_path).slice(0, 10);
        
        const combinedHero = [...validHeroPicks];
        validTrending.forEach(tItem => {
          if (!combinedHero.find(h => h.id === tItem.id)) {
            combinedHero.push(tItem);
          }
        });
        
        setHero(combinedHero);
        setPopular(mergeTMDBPages(pop1, pop2));
        setTopRated(mergeTMDBPages(top1, top2));
        setPopularTV(mergeTMDBPages(tv1, tv2));
        setTopRatedTV(mergeTMDBPages(topTV1, topTV2));
        setNowPlaying(mergeTMDBPages(np1, np2));
        setKidsMovies([]);
        setKidsSeries([]);

        setLoading(false);
      });
    }

    return () => { canceled = true; };
  }, [tl, kidsMode]);

  return (
    <Layout>
      <SEO 
        title={lang === "ar" ? "أحدث الأفلام والمسلسلات مجاناً" : "Derniers Films & Séries gratuits"} 
        description={lang === "ar" ? "شاهد وحمل أحدث الأفلام والمسلسلات بجودة عالية ومترجمة حصرياً على BNK HUB مجاناً." : "Regardez et téléchargez les derniers films et séries en HD exclusivement sur BNK HUB."}
      />
      <MovieHero items={hero} />

      <div className="relative z-30">
        <div className="min-w-0">
        <ContinueWatchingRow />
        
        <ForYouRow />
        <DiscoverRow 
          title={lang === "ar" ? "المنصات العلمية" : "Plateformes Scientifiques"} 
          genres="99" 
          type="movie" 
          icon="🔬" 
        />

        {kidsMode ? (
          <>
            <MovieRow title={lang === "ar" ? "🎬 أفلام كرتونية" : "🎬 Films d'Animation"} items={kidsMovies} loading={loading} />
            <MovieRow title={lang === "ar" ? "📺 مسلسلات كرتونية" : "📺 Séries d'Animation"} items={kidsSeries} type="tv" loading={loading} />
            <MovieRow title={lang === "ar" ? "👨‍👩‍👧‍👦 أفلام عائلية" : "👨‍👩‍👧‍👦 Films de Famille"} items={popular} loading={loading} />
          </>
        ) : (
          <>
            <MovieRow title={t("section_latest")} items={nowPlaying} loading={loading} />
            <MovieRow title={t("section_trending")} items={trending} loading={loading} />
            
            {/* Netflix Style Genre Sections */}
            <DiscoverRow title={lang === "ar" ? "🔥 أفلام الأكشن والمغامرة" : "🔥 Action & Aventure"} genres="28,12" type="movie" icon="💥" />
            <DiscoverRow title={lang === "ar" ? "💡 أفلام الخيال العلمي" : "💡 Science-Fiction"} genres="878" type="movie" icon="🚀" />
            
            <MovieRow title={t("section_popular")} items={popular} loading={loading} />
            <div className="md:hidden">
              <AdBanner />
            </div>
            
            {/* M3U Custom Rows (Premium Content) */}
            {supabaseM3ULists.slice(0, 3).map((list) => (
              <M3UMovieRow key={list.title_fr} title={lang === "ar" ? list.title_ar : list.title_fr} m3uUrl={list.url} type={list.type} />
            ))}

            <MovieRow title={t("section_popular_tv")} items={popularTV} type="tv" loading={loading} />
            
            <DiscoverRow title={lang === "ar" ? "🎬 أفلام الرعب والإثارة" : "🎬 Horreur & Thriller"} genres="27,53" type="movie" icon="👻" />
            
            <MovieRow title={lang === "ar" ? "⭐ أفضل المسلسلات على الإطلاق" : "⭐ Séries les mieux notées"} items={topRatedTV} type="tv" loading={loading} />
            
            {/* International Content Rows */}
            <div className="bg-surface-elevated/30 py-8 my-8 border-y border-white/5 backdrop-blur-sm">
              <DiscoverRow title={lang === "ar" ? "🇰🇷 الدراما الكورية" : "🇰🇷 K-Drama"} originalLanguage="ko" type="tv" genres="18" icon="✨" />
              <DiscoverRow title={lang === "ar" ? "🇰🇷 السينما الكورية" : "🇰🇷 Cinéma Coréen"} originalLanguage="ko" type="movie" icon="🎬" />
            </div>

            <MovieRow title={t("section_top_rated")} items={topRated} loading={loading} />

            {/* Specialized Content */}
            <DiscoverRow title={lang === "ar" ? "🇸🇦 أقوى الأفلام العربية" : "🇸🇦 Films Arabes"} originalLanguage="ar" type="movie" icon="🌟" />
            <DiscoverRow title={lang === "ar" ? "🇸🇦 المسلسلات العربية" : "🇸🇦 Séries Arabes"} originalLanguage="ar" type="tv" icon="📺" />

            <KabyleCinemaRow />
            
            {/* Dynamic Genre Footer Rows */}
            <DiscoverRow title={lang === "ar" ? "😂 الكوميديا" : "😂 Comédie"} genres="35" type="movie" icon="🎭" />
            <DiscoverRow title={lang === "ar" ? "📜 الوثائقيات" : "📜 Documentaires"} genres="99" type="movie" icon="🌍" />
          </>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
