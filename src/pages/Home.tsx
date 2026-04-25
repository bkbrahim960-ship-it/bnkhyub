/**
 * BNKhub — Page d'accueil.
 * Hero rotatif + rows TMDB + nouveautés vidsrc-embed.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MovieHero } from "@/components/movie/MovieHero";
import { MovieRow } from "@/components/movie/MovieRow";
import { BrandRow } from "@/components/movie/BrandRow";
import { ContinueWatchingRow } from "@/components/movie/ContinueWatchingRow";
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
      <MovieHero items={hero} />

      <div className="relative -mt-20 z-10">
        <BrandRow />
        <ContinueWatchingRow />
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
