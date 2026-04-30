import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { MovieRow } from "@/components/movie/MovieRow";
import { FavoriteButton } from "@/components/movie/FavoriteButton";
import { ShareButtons } from "@/components/movie/ShareButtons";
import { SubtitleFinder } from "@/components/player/SubtitleFinder";
import { TrailerModal } from "@/components/movie/TrailerModal";
import { ReviewSection } from "@/components/movie/ReviewSection";
import { IMG, getMovieDetails, getMovieRecommendations, TMDBMovie } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { tmdbLang } from "@/services/i18n";
import { SEO } from "@/components/SEO";
import { upsertWatchEntry } from "@/services/watchHistory";
import { KABYLE_CONTENT } from "@/services/customContent";
import { SOURCE_LABELS } from "@/services/player";
import { Play, Star, Clock, Calendar, Globe2, ArrowLeft, Youtube, Info } from "lucide-react";
import { useAmbient } from "@/context/AmbientContext";
import { RemotePairingButton } from "@/components/movie/RemotePairingButton";

const sourceIdToIndex = (srcId?: string | null): number => {
  if (!srcId) return 0;
  const i = SOURCE_LABELS.findIndex((l) => l.startsWith(srcId));
  return i >= 0 ? i : 0;
};

const Movie = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { setAmbientColor } = useAmbient();
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const resumeRequested = params.get("resume") === "1";
  const initialSourceIndex = useMemo(() => sourceIdToIndex(params.get("src")), [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setPlaying(false);
    
    const custom = KABYLE_CONTENT.find(c => c.id === id);
    const videoUrl = params.get("video_url");

    if (videoUrl) {
      setMovie({
        id: id as any,
        title: movie?.title || "HLS Stream",
        overview: "Brahim Direct HLS Stream Content.",
        poster_path: movie?.poster_path || null,
        backdrop_path: movie?.backdrop_path || null,
        vote_average: 10,
        release_date: "2024",
        genres: [{ id: 1, name: "Premium" }],
        video_url: videoUrl
      } as any);
      setLoading(false);
      if (resumeRequested) setPlaying(true);
      return;
    }

    if (custom) {
      setMovie(custom as any);
      setLoading(false);
      if (resumeRequested) setPlaying(true);
      return;
    }

    getMovieDetails(id, tmdbLang(lang))
      .then((m) => {
        setMovie(m);
        if (m.backdrop_path) setAmbientColor(`hsl(var(--accent) / 0.15)`);
        if (resumeRequested) setPlaying(true);
      })
      .finally(() => setLoading(false));
    getMovieRecommendations(id, tmdbLang(lang))
      .then((r) => setRecommendations(r.results.filter((m) => m.poster_path)))
      .catch(() => {});
  }, [id, lang]);

  if (loading || !movie) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-glow-accent animate-pulse-glow mb-6">
              <img src="/icon.png" alt="Loading..." className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  const year = movie.release_date?.slice(0, 4);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min` : null;
  const backdrop = IMG.backdrop(movie.backdrop_path, "original");
  const poster = IMG.poster(movie.poster_path, "w500");
  const imdb = (movie as any).imdb_id ?? (movie as any).external_ids?.imdb_id ?? "";
  
  const trailer = movie.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  ) || movie.videos?.results.find((v) => v.site === "YouTube");

  const saveHistory = (sourceLabel: string) => {
    if (!user) return;
    const sid = sourceLabel.split(" ")[0];
    upsertWatchEntry(user.id, {
      tmdb_id: movie.id,
      media_type: "movie",
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      source_id: sid,
    }).catch(() => {});
  };

  const startWatching = () => {
    setPlaying(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <Layout>
      <SEO 
        title={`مشاهدة فيلم ${movie.title} مترجم`}
        description={movie.overview || `شاهد فيلم ${movie.title} بجودة عالية ومترجم مجاناً على BNK HUB.`}
        image={poster}
        type="video.movie"
        keywords={`${movie.title}, فيلم ${movie.title}, مشاهدة فيلم ${movie.title}, افلام مترجمة, BNK HUB`}
      />
      {/* Cinematic Hero */}
      <section className="relative min-h-[90vh] flex items-end pb-24 overflow-hidden">
        {backdrop && (
          <div className="absolute inset-0 z-0">
            <img src={backdrop} alt="" className="w-full h-full object-cover scale-110 animate-scale-in" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
          </div>
        )}
        
        <div className="container relative z-10 grid lg:grid-cols-[300px_1fr] gap-12 items-end">
          <div className="hidden lg:block animate-fade-in">
            <img src={poster} alt={movie.title} className="w-full rounded-2xl border border-white/10 shadow-2xl shadow-accent/20" />
          </div>

          <div className="animate-fade-slide-up">
            <Link to="/" className="inline-flex items-center gap-2 text-accent/80 hover:text-accent mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              <span className="text-xs font-bold uppercase tracking-widest">{t("nav_home")}</span>
            </Link>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.slice(0, 4).map(g => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-accent">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-bold mb-4 text-white leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-xl text-accent/90 italic mb-8 font-decorative">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-8 mb-10 text-white/60 font-medium">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl">
                <img 
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" 
                  alt="TMDB" 
                  className="w-8 h-auto drop-shadow-glow-accent"
                />
                <span className="text-xl font-black text-white">{movie.vote_average.toFixed(1)}</span>
              </div>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {year}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {runtime}</span>
              {movie.original_language && (
                <span className="flex items-center gap-2 uppercase"><Globe2 className="w-4 h-4" /> {movie.original_language}</span>
              )}
            </div>

            <p className="text-lg text-white/70 max-w-3xl leading-relaxed mb-12 line-clamp-3 md:line-clamp-none">
              {movie.overview}
            </p>

            <div className="flex flex-wrap items-center gap-5">
              {!playing && (
                <button
                  onClick={startWatching}
                  className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full font-bold shadow-glow hover:scale-105 active:scale-95 transition-all text-sm md:text-base"
                >
                  <Play className="w-5 h-5 fill-current" /> {t("hero_watch")}
                </button>
              )}
              {trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full font-bold transition-all text-sm md:text-base"
                >
                  <Youtube className="w-5 h-5 text-red-500" /> {t("hero_trailer")}
                </button>
              )}
              <FavoriteButton tmdbId={movie.id} mediaType="movie" title={movie.title} posterPath={movie.poster_path} />
              <RemotePairingButton />
              <ShareButtons title={movie.title} />
            </div>
          </div>
        </div>
      </section>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} videoKey={trailer?.key} title={movie.title} />

      {/* Video Player */}
      <div ref={playerRef} className="scroll-mt-24">
        {playing && (
          <section className="container py-12 animate-scale-in">
            <VideoPlayer
              imdb_id={imdb || ""}
              tmdb_id={movie.id}
              type="movie"
              title={movie.title}
              initialSourceIndex={initialSourceIndex}
              customUrl={(movie as any).video_url}
              onPlayStart={(_i, label) => saveHistory(label)}
              onSourceChange={(_i, label) => saveHistory(label)}
            />
          </section>
        )}
      </div>

      {/* Extras & Info */}
      <section className="container py-16 grid lg:grid-cols-3 gap-12 border-t border-white/5">
        <div className="lg:col-span-2">
          <SubtitleFinder imdbId={imdb} tmdbId={movie.id} type="movie" title={movie.title} />
          
          <div className="mt-20">
            <ReviewSection tmdbId={movie.id} mediaType="movie" />
          </div>
        </div>
        
        <div className="space-y-12">
          {/* Detailed Info */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-accent" /> {lang === "ar" ? "معلومات إضافية" : "More Info"}
            </h3>
            <dl className="space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <dt className="text-white/40">{lang === "ar" ? "الميزانية" : "Budget"}</dt>
                <dd className="font-medium">{movie.budget > 0 ? `$${movie.budget.toLocaleString()}` : "N/A"}</dd>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <dt className="text-white/40">{lang === "ar" ? "الإيرادات" : "Revenue"}</dt>
                <dd className="font-medium">{movie.revenue > 0 ? `$${movie.revenue.toLocaleString()}` : "N/A"}</dd>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <dt className="text-white/40">{lang === "ar" ? "الحالة" : "Status"}</dt>
                <dd className="font-medium">{movie.status}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="py-16 bg-black/20">
          <MovieRow title={lang === "ar" ? "أفلام مشابهة" : "Similar Movies"} items={recommendations} />
        </div>
      )}
    </Layout>
  );
};

export default Movie;
