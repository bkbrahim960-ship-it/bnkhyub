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
import { BrandRow } from "@/components/movie/BrandRow";
import { ContinueWatchingRow } from "@/components/movie/ContinueWatchingRow";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { tmdbLang } from "@/services/i18n";
import {
  getPopularMovies,
  getTopRatedMovies,
  getPopularSeries,
  getTopRatedSeries,
  getTrendingMovies,
  getNowPlaying,
  discoverMovies,
  discoverSeries,
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
    title_ar: "أفلام المغامرات", 
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
  const all = KABYLE_CONTENT;
  if (all.length === 0) return null;

  return (
    <section className="relative py-8">
      <div className="container mb-5">
        <h2 className="font-display text-2xl md:text-3xl">
          <span className="text-gradient-accent">Kabyle</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "ar" ? "أفلام ومسلسلات بالأمازيغية القبائلية" : "Films et séries en langue Kabyle"}
        </p>
      </div>
      <div className="container overflow-x-auto scrollbar-hide flex gap-4 md:gap-5 pb-4 snap-x snap-mandatory">
        {all.map((item) => {
          const to = item.media_type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`;
          return (
            <Link key={item.id} to={to} className="snap-start shrink-0 w-[150px] sm:w-[170px] group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-card border border-border group-hover:border-accent-subtle group-hover:shadow-glow transition-all duration-500">
                <img src={item.poster_path} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground font-bold px-3 py-1.5 rounded-full text-[10px]">
                    <Play className="w-3 h-3 fill-current" /> {lang === "ar" ? "مشاهدة" : "Regarder"}
                  </div>
                </div>
                {item.isDubbed && (
                  <span className="absolute top-2 start-2 px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[8px] font-black">DUB</span>
                )}
              </div>
              <div className="pt-2 px-1">
                <h3 className="font-medium text-xs text-foreground line-clamp-1 group-hover:text-accent transition-colors">{item.title}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-[10px] text-muted-foreground">{item.vote_average}</span>
                </div>
              </div>
            </Link>
          );
        })}
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
    if (!hasSeen) {
      navigate("/welcome");
    }
  }, [navigate]);

  const [hero, setHero] = useState<TMDBMovie[]>([]);
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
        getTrendingMovies(tl).catch(() => ({ results: [] })),
        getPopularMovies(tl).catch(() => ({ results: [] })),
        getTopRatedMovies(tl).catch(() => ({ results: [] })),
        getPopularSeries(tl).catch(() => ({ results: [] })),
        getTopRatedSeries(tl).catch(() => ({ results: [] })),
        getNowPlaying(tl).catch(() => ({ results: [] })),
      ]).then(([tr, pop, top, tv, topTV, np]) => {
        if (canceled) return;
        setTrending(tr.results);
        setHero(tr.results.filter((m: any) => m.backdrop_path));
        setPopular(pop.results);
        setTopRated(top.results);
        setPopularTV(tv.results);
        setTopRatedTV(topTV.results);
        setNowPlaying(np.results);
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

      <div className="relative -mt-20 z-10">
        <BrandRow />
        <ContinueWatchingRow />

        {kidsMode ? (
          <>
            <MovieRow title={lang === "ar" ? "🎬 أفلام كرتونية" : "🎬 Films d'Animation"} items={kidsMovies} loading={loading} />
            <MovieRow title={lang === "ar" ? "📺 مسلسلات كرتونية" : "📺 Séries d'Animation"} items={kidsSeries} type="tv" loading={loading} />
            <MovieRow title={lang === "ar" ? "👨‍👩‍👧‍👦 أفلام عائلية" : "👨‍👩‍👧‍👦 Films de Famille"} items={popular} loading={loading} />
          </>
        ) : (
          <>
            {supabaseM3ULists.map((list) => (
              <M3UMovieRow key={list.title_fr} title={lang === "ar" ? list.title_ar : list.title_fr} m3uUrl={list.url} type={list.type} />
            ))}

            <MovieRow title={t("section_latest")} items={nowPlaying} loading={loading} />
            <MovieRow title={t("section_trending")} items={trending} loading={loading} />
            <MovieRow title={t("section_popular")} items={popular} loading={loading} />
            <MovieRow title={t("section_popular_tv")} items={popularTV} type="tv" loading={loading} />
            <MovieRow title={lang === "ar" ? "⭐ أفضل المسلسلات على الإطلاق" : "⭐ Séries les mieux notées"} items={topRatedTV} type="tv" loading={loading} />
            <MovieRow title={t("section_top_rated")} items={topRated} loading={loading} />

            <KabyleCinemaRow />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home;
