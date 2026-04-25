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

interface CustomHLS {
  id: string;
  title: string;
  url: string;
  poster: string;
  category: string;
  type?: "movie" | "tv" | "live";
}

const customHLSData = [
  {
    id: "hls-becoming-you",
    title: "Becoming You (4K/Dolby Vision)",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8",
    poster: "https://m.media-amazon.com/images/M/MV5BMTE0MGM4ODctMzRiZS00ZmM5LTg3YTMtYzg5YzY3YjM2MDllXkEyXkFqcGdeQXVyMTI1NDEyNTM5._V1_.jpg",
    category: "Premium 4K",
  },
  {
    id: "hls-skate",
    title: "Skate Phantom Flex",
    url: "https://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8",
    poster: "https://i.ytimg.com/vi/6zFv8IOn0io/maxresdefault.jpg",
    category: "Premium 4K",
  },
  {
    id: "hls-historic-planet",
    title: "Historic Planet 3D (Apple Vision Pro)",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/historic_planet_content_2023-10-26-3d-video/main.m3u8",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    category: "Premium 3D",
  },
  {
    id: "hls-sintel",
    title: "Sintel",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sintel_poster.jpg/800px-Sintel_poster.jpg",
    category: "Animation",
  },
  {
    id: "hls-bbb",
    title: "Big Buck Bunny",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    poster: "https://peach.blender.org/wp-content/uploads/bbb-splash.png",
    category: "Animation",
  },
  {
    id: "hls-tears",
    title: "Tears of Steel",
    url: "https://content.jwplatform.com/manifests/vM7nH0Kl.m3u8",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Tears_of_Steel_poster.jpg/800px-Tears_of_Steel_poster.jpg",
    category: "Sci-Fi",
  },
  {
    id: "hls-dai",
    title: "DAI Discontinuity",
    url: "https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8",
    poster: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1000&auto=format&fit=crop",
    category: "Test Stream",
  },
  {
    id: "hls-bip-bop",
    title: "Bip-Bop",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8",
    poster: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    category: "Test Stream",
  },
  {
    id: "hls-tears-live",
    title: "Tears of Steel (LIVE)",
    url: "https://cph-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Tears_of_Steel_poster.jpg/800px-Tears_of_Steel_poster.jpg",
    category: "Live TV",
    type: "live"
  },
  {
    id: "hls-sky-news",
    title: "Sky News (LIVE)",
    url: "https://skynewsau-live.akamaized.net/hls/live/2002689/skynewsau-extra1/master.m3u8",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Sky_News_2015_logo.svg/1200px-Sky_News_2015_logo.svg.png",
    category: "Live TV",
    type: "live"
  }
];

const portraitHLSData = [
  { id: "p1", url: "https://flipfit-cdn.akamaized.net/flip_hls/661f570aab9d840019942b80-473e0b/video_h1.m3u8", title: "Flipfit Video 1" },
  { id: "p2", url: "https://flipfit-cdn.akamaized.net/flip_hls/662aae7a42cd740019b91dec-3e114f/video_h1.m3u8", title: "Flipfit Video 2" },
  { id: "p3", url: "https://flipfit-cdn.akamaized.net/flip_hls/663e5a1542cd740019b97dfa-ccf0e6/video_h1.m3u8", title: "Flipfit Video 3" },
  { id: "p4", url: "https://flipfit-cdn.akamaized.net/flip_hls/663d1244f22a010019f3ec12-f3c958/video_h1.m3u8", title: "Flipfit Video 4" },
  { id: "p5", url: "https://flipfit-cdn.akamaized.net/flip_hls/664ce52bd6fcda001911a88c-8f1c4d/video_h1.m3u8", title: "Flipfit Video 5" },
  { id: "p6", url: "https://flipfit-cdn.akamaized.net/flip_hls/664d87dfe8e47500199ee49e-dbd56b/video_h1.m3u8", title: "Flipfit Video 6" },
  { id: "p7", url: "https://flipfit-cdn.akamaized.net/flip_hls/6656423247ffe600199e8363-15125d/video_h1.m3u8", title: "Flipfit Video 7" },
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
      <MovieHero items={hero} />

      <div className="relative -mt-20 z-10">
        <BrandRow />
        <ContinueWatchingRow />
        
        {/* Custom Premium HLS Row */}
        <MovieRow 
          title={lang === "ar" ? "محتوى خارق الدقة (4K)" : "Ultra HD Premium Content"} 
          items={customHLSData.map(d => ({
            id: d.id as any,
            title: d.title,
            poster_path: d.poster,
            vote_average: 10,
            release_date: "2024",
            video_url: d.url // Custom prop
          }))} 
        />

        <MovieRow title={t("section_latest")} items={nowPlaying} loading={loading} />
        <MovieRow title={t("section_trending")} items={trending} loading={loading} />
        <MovieRow title={t("section_popular")} items={popular} loading={loading} />
        <MovieRow title={t("section_popular_tv")} items={popularTV} type="tv" loading={loading} />
        <MovieRow title={t("section_top_rated")} items={topRated} loading={loading} />

        {/* Portrait Shorts Row */}
        <MovieRow 
          title={lang === "ar" ? "فيديوهات قصيرة (طولية)" : "Portrait Shorts"} 
          items={portraitHLSData.map(d => ({
            id: d.id as any,
            title: d.title,
            poster_path: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
            vote_average: 9,
            release_date: "2024",
            video_url: d.url
          }))} 
        />
      </div>
    </Layout>
  );
};

export default Home;
