/**
 * BNKhub — Page d'accueil.
 * Hero rotatif + rows TMDB + nouveautés vidsrc-embed.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  getTrendingMovies,
  getNowPlaying,
  TMDBMovie,
  TMDBSeries,
} from "@/services/tmdb";

interface CustomHLS {
  id: string;
  title: string;
  url: string;
  poster: string;
  category: string;
  type?: "movie" | "tv" | "live";
}





const supabaseM3ULists = [
  { title: "البرامج التلفزيونية الرائجة", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u", type: "tv" as const },
  { title: "أفلام IMDB الشهيرة 2024-2025", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/top-movies.m3u", type: "movie" as const },
  { title: "أفلام الأكشن", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/action-movies.m3u", type: "movie" as const },
  { title: "أفلام المغامرات", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/adventure-movies.m3u", type: "movie" as const },
  { title: "أفلام الرسوم المتحركة", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/animation-movies.m3u", type: "movie" as const },
  { title: "أفلام الكوميديا", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/comedy-movies.m3u", type: "movie" as const },
  { title: "أفلام الجريمة", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/crime-movies.m3u", type: "movie" as const },
  { title: "الأفلام الوثائقية", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/documentary-movies.m3u", type: "movie" as const },
  { title: "أفلام الدراما", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/drama-movies.m3u", type: "movie" as const },
  { title: "أفلام العائلة", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/family-movies.m3u", type: "movie" as const },
  { title: "أفلام الفانتازيا", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/fantasy-movies.m3u", type: "movie" as const },
  { title: "أفلام تاريخية", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/history-movies.m3u", type: "movie" as const },
  { title: "أفلام الرعب", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/horror-movies.m3u", type: "movie" as const },
  { title: "أفلام موسيقية", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/music-movies.m3u", type: "movie" as const },
  { title: "أفلام الغموض", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/mystery-movies.m3u", type: "movie" as const },
  { title: "أفلام الرومانسية", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/romance-movies.m3u", type: "movie" as const },
  { title: "أفلام الخيال العلمي", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/science-fiction-movies.m3u", type: "movie" as const },
  { title: "أفلام تلفزيونية", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/tv-movies.m3u", type: "movie" as const },
  { title: "أفلام الإثارة", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/thriller-movies.m3u", type: "movie" as const },
  { title: "أفلام الحرب", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/war-movies.m3u", type: "movie" as const },
  { title: "أفلام الغرب الأمريكي", url: "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/western-movies.m3u", type: "movie" as const },
];

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
  const [nowPlaying, setNowPlaying] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    setLoading(true);
    Promise.all([
      getTrendingMovies(tl).catch(() => ({ results: [] })),
      getPopularMovies(tl).catch(() => ({ results: [] })),
      getTopRatedMovies(tl).catch(() => ({ results: [] })),
      getPopularSeries(tl).catch(() => ({ results: [] })),
      getNowPlaying(tl).catch(() => ({ results: [] })),
    ]).then(([tr, pop, top, tv, np]) => {
      if (canceled) return;
      
      const filterKids = (items: any[]) => {
        if (!kidsMode) return items;
        // Filter out Horror (27) and Thriller (53) and adult content
        return items.filter((m: any) => 
          !m.genre_ids?.includes(27) && 
          !m.genre_ids?.includes(53) && 
          !m.adult
        );
      };

      setTrending(filterKids(tr.results));
      setHero(filterKids(tr.results.filter((m: any) => m.backdrop_path)));
      setPopular(filterKids(pop.results));
      setTopRated(filterKids(top.results));
      setPopularTV(filterKids(tv.results));
      setNowPlaying(filterKids(np.results));
      setLoading(false);
    });
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl, kidsMode]);

  return (
    <Layout>
      <SEO 
        title="أحدث الأفلام والمسلسلات مجاناً" 
        description="شاهد وحمل أحدث الأفلام والمسلسلات بجودة عالية ومترجمة حصرياً على BNK HUB مجاناً."
      />
      <MovieHero items={hero} />

      <div className="relative -mt-20 z-10">
        <BrandRow />
        <ContinueWatchingRow />

        {/* Featured Series Row */}
        <MovieRow 
          title={lang === "ar" ? "أفضل المسلسلات العالمية" : "Global Masterpieces"} 
          type="tv"
          items={[
            { id: 1399, name: "Game of Thrones", poster_path: "/7WsyChvRStv9OidunSjdua9p3Yv.jpg", vote_average: 8.5, first_air_date: "2011" },
            { id: 71446, name: "Money Heist", poster_path: "/reEMJA1uzpG3SZ09VD9QH0Mxy6A.jpg", vote_average: 8.3, first_air_date: "2017" },
            { id: 1396, name: "Breaking Bad", poster_path: "/ztkUQvBZ97v9m6sTebpPcAtQo9L.jpg", vote_average: 8.9, first_air_date: "2008" },
            { id: 102903, name: "Outer Banks", poster_path: "/788ID9AAn866rZ9vXpL6C96Of6l.jpg", vote_average: 8.4, first_air_date: "2020" },
          ] as any} 
        />

        {/* Custom Supabase M3U Rows */}
        {supabaseM3ULists.map((list) => (
          <M3UMovieRow key={list.title} title={list.title} m3uUrl={list.url} type={list.type} />
        ))}

        <MovieRow title={t("section_latest")} items={nowPlaying} loading={loading} />
        <MovieRow title={t("section_trending")} items={trending} loading={loading} />
        <MovieRow title={t("section_popular")} items={popular} loading={loading} />
        <MovieRow title={t("section_popular_tv")} items={popularTV} type="tv" loading={loading} />
        <MovieRow title={t("section_top_rated")} items={topRated} loading={loading} />


      </div>
    </Layout>
  );
};

export default Home;
