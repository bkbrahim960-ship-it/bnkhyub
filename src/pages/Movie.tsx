import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MovieRow } from "@/components/movie/MovieRow";
import { FavoriteButton } from "@/components/movie/FavoriteButton";
import { ShareButtons } from "@/components/movie/ShareButtons";

import { TrailerModal } from "@/components/movie/TrailerModal";

import { VideoBackdrop } from "@/components/movie/VideoBackdrop";
import { LoginPrompt } from "@/components/LoginPrompt";
import { ReviewSection } from "@/components/movie/ReviewSection";
import { IMG, getMovieDetails, getMovieRecommendations, TMDBMovie } from "@/services/tmdb";
import { getOMDbDetails, OMDbResult } from "@/services/omdb";
import { RatingsDisplay } from "@/components/ui/RatingsDisplay";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { SEO } from "@/components/SEO";
import { CUSTOM_CONTENT } from "@/services/customContent";
import { SOURCE_LABELS } from "@/services/player";
import { Play, Star, Clock, Calendar, Globe2, ArrowLeft, Youtube, Info, Download, Monitor, X, Loader2 } from "lucide-react";
import { useAmbient } from "@/context/AmbientContext";
import { RemotePairingButton } from "@/components/movie/RemotePairingButton";
import { MovieLogo } from "@/components/ui/MovieLogo";
import { useAuthPath } from "@/hooks/useAuthPath";
const sourceIdToIndex = (srcId?: string | null): number => {
  if (!srcId) return 0;
  const i = SOURCE_LABELS.findIndex((l) => l.startsWith(srcId));
  return i >= 0 ? i : 0;
};

const Movie = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { lang, t } = useLanguage();
  const { setAmbientColor, setAmbientImage } = useAmbient();
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [omdbData, setOmdbData] = useState<OMDbResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(sourceIdToIndex(params.get("src")));
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const navigate = useNavigate();
  const authPath = useAuthPath();
  const resumeRequested = params.get("resume") === "1";
  const playRequested = params.get("play") === "1";

  const fetchDownloads = async () => {
    if (!movie) return;
    setDownloadModal(true);
    setDownloading(true);
    setDownloads([]);
    setDownloadError("");
    try {
      const res = await fetch(`https://missourimonster-vyla.hf.space/api/downloads/movie/${movie.id}`);
      if (!res.ok) { setDownloadError("فشل الاتصال بالخادم"); setDownloading(false); return; }
      const data = JSON.parse(await res.text());
      setDownloads(data.downloads || []);
      if (!data.downloads || data.downloads.length === 0) setDownloadError("");
    } catch { setDownloadError("تعذر جلب روابط التحميل"); }
    setDownloading(false);
  };

  const downloadUrl = movie ? `https://missourimonster-vyla.hf.space/api/downloads/movie/${movie.id}` : "";

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const videoUrl = params.get("video_url");
    const custom = CUSTOM_CONTENT.find(c => c.id === id);

    if (custom) {
      setMovie({
        ...custom,
        title: custom.title,
        poster_path: custom.thumbnail,
        backdrop_path: custom.thumbnail,
        overview: custom.description,
        vote_average: custom.rating,
        release_date: custom.year,
        genres: custom.category ? [{ id: 1, name: custom.category }] : [],
        video_url: videoUrl || custom.videoUrl,
      } as any);
      setLoading(false);
      return;
    }

    if (videoUrl) {
      setMovie({
        id: id as any,
        title: "HLS Stream",
        overview: "Brahim Direct HLS Stream Content.",
        poster_path: null,
        backdrop_path: null,
        vote_average: 10,
        release_date: "2024",
        genres: [{ id: 1, name: "Premium" }],
        video_url: videoUrl
      } as any);
      setLoading(false);
      return;
    }

    getMovieDetails(id, tmdbLang(lang))
      .then((m) => {
        setMovie(m);
        if (m.backdrop_path) {
          setAmbientImage(IMG.backdrop(m.backdrop_path, "w780"));
        }
        // Fetch OMDb data
        if (m.imdb_id) {
          getOMDbDetails(m.imdb_id).then(setOmdbData);
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang, resumeRequested, setAmbientImage]);

  useEffect(() => {
    if (!id) return;
    getMovieRecommendations(id, tmdbLang(lang))
      .then((r) => setRecommendations(r.results.filter((m) => m.poster_path)))
      .catch((err) => console.error("Movie recommendations fetch error:", err));
  }, [id, lang]);

  // Clean up ambient on unmount
  useEffect(() => {
    return () => setAmbientImage(null);
  }, [setAmbientImage]);

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

  const year = movie.release_date?.slice(0, 4) || (movie as any).year || "";
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min` : null;
  const imdb = movie.imdb_id || (movie as any).external_ids?.imdb_id || "";
  const backdrop = movie.backdrop_path ? IMG.backdrop(movie.backdrop_path, "original") : ((movie as any).thumbnail || "");
  const poster = movie.poster_path ? IMG.poster(movie.poster_path, "w500") : ((movie as any).thumbnail || "");
  const rating = movie.vote_average || (movie as any).rating || 0;
  const overview = movie.overview || (movie as any).description || "";
  
  const trailer = movie.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  ) || movie.videos?.results.find((v) => v.site === "YouTube");

  const goToPlayer = () => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("src", `S${sourceIndex + 1}`);
    navigate(`/player/movie/${id}?${sp.toString()}`);
  };

  const confirmWatch = () => {
    setShowLoginPrompt(false);
    goToPlayer();
  };

  const director = movie?.credits?.crew?.find(c => c.job === 'Director')?.name;
  const cast = movie?.credits?.cast?.slice(0, 10) || [];

  const movieSchema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "image": poster,
    "description": movie.overview,
    "dateCreated": movie.release_date,
    "director": director ? {
      "@type": "Person",
      "name": director
    } : undefined,
    "actor": cast.map((actor: any) => ({
      "@type": "Person",
      "name": actor.name
    }))
  };

  return (
    <Layout>
      <ErrorBoundary>
      <SEO 
        title={`Regarder ${movie.title} en 4K`}
        description={movie.overview || `Regardez ${movie.title} en haute qualité gratuitement sur BNKhub.`}
        image={poster}
        type="video.movie"
        keywords={`${movie.title}, regarder ${movie.title}, film gratuit, BNKhub`}
        schema={movieSchema}
      />
      
      {showLoginPrompt && (
        <LoginPrompt
          title={lang === "ar" ? "سجل لتجربة أفضل!" : "Connectez-vous pour une meilleure expérience!"}
          description={lang === "ar" ? "سجل حسابك مجاناً لتتمكن من حفظ تقدمك في المشاهدة، واستئناف الأفلام من حيث توقفت، وإضافة ما يعجبك إلى مفضلتك." : "Créez un compte gratuit pour sauvegarder votre progression de visionnage, reprendre les films là où vous vous êtes arrêté et enregistrer vos favoris."}
          onLogin={() => navigate(authPath)}
          onWatch={confirmWatch}
        />
      )}
      {/* Cinematic Hero with Video Background */}
      <section className="relative min-h-[45vh] md:min-h-[90vh] lg:min-h-[95vh] flex items-end pb-24 md:pb-16 lg:pb-24 overflow-hidden">
        <VideoBackdrop 
          backdropPath={backdrop} 
          videoKey={trailer?.key} 
          title={movie.title} 
        />
      </section>

      {/* NEW ORGANIZED INFO BLOCK */}
      <section className="container -mt-32 relative z-20 pb-12">
        {/* Poster + Logo row */}
        <div className="flex items-end gap-4 md:gap-8 mb-6">
          {/* Poster - always left aligned */}
          <div className="shrink-0">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-accent/20 w-28 sm:w-36 md:w-48 lg:w-64">
               <img src={poster} alt={movie.title} className="w-full" />
            </div>
          </div>

          {/* Logo beside poster */}
          <div className="flex-1 min-w-0 pb-2">
            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3 mb-2 sm:mb-4 lg:mb-6">
              {(movie.genres || []).slice(0, 3).map((g: any) => (
                <span key={g.id} className="px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 lg:py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[7px] sm:text-[9px] lg:text-xs font-bold uppercase tracking-widest text-accent">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Movie Title Logo - small on mobile */}
            <div className="mb-2 sm:mb-4 lg:mb-8">
              <MovieLogo 
                id={movie.id} 
                type="movie" 
                title={movie.title} 
                className="h-8 sm:h-12 md:h-20 lg:h-32 max-w-full" 
              />
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 text-white/70 text-xs sm:text-sm lg:text-base mb-3 lg:mb-6">
              <span>{year}</span>
              <span>{runtime}</span>
            </div>
            
            {/* Ratings Display */}
            <RatingsDisplay
              tmdbRating={movie.vote_average}
              tmdbVoteCount={movie.vote_count}
              imdbRating={omdbData?.imdbRating}
              rottenTomatoes={omdbData?.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value}
              metacritic={omdbData?.Ratings?.find(r => r.Source === "Metacritic")?.Value}
            />
          </div>
        </div>

        {/* Overview */}
        <p className="text-white/60 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-6 lg:mb-8 line-clamp-3">
          {overview}
        </p>

        {/* Source Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {["S1", "S2", "S3"].map((label, i) => (
            <button
              key={label}
              onClick={() => setSourceIndex(i)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                sourceIndex === i
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-elevated/50 border border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
          {imdb && (
            <button
              onClick={fetchDownloads}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-surface-elevated/50 border border-border text-muted-foreground hover:border-accent/50 hover:text-accent transition-all"
              title="تحميل"
            >
              <Download className="w-3.5 h-3.5" />
              تحميل
            </button>
          )}
        </div>

        {/* Primary Action Button (Watch) */}
        <button
          type="button"
          data-tv-nav="primary"
          tabIndex={0}
          onClick={goToPlayer}
          className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-2xl font-bold shadow-glow hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm md:text-base lg:text-lg mb-6 w-full sm:w-auto focus:outline-none focus-visible:ring-4 focus-visible:ring-accent"
        >
          <Play className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 fill-current" /> {t("hero_watch")}
        </button>

        {/* Secondary Icon Buttons (Modern & Clean) */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {trailer && (
            <button
              onClick={() => setShowTrailer(true)}
              className="flex items-center justify-center w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-full bg-white/5 hover:bg-accent/20 text-white hover:text-accent hover:scale-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title={t("hero_trailer")}
            >
              <Youtube className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7" />
            </button>
          )}

          <div className="flex items-center justify-center w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-full bg-white/5 hover:bg-accent/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <FavoriteButton tmdbId={movie.id} mediaType="movie" title={movie.title} posterPath={movie.poster_path} />
          </div>

          <div className="flex items-center justify-center w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-full bg-white/5 hover:bg-accent/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <RemotePairingButton />
          </div>

          <div className="flex items-center justify-center w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-full bg-white/5 hover:bg-accent/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <ShareButtons title={movie.title} />
          </div>
        </div>
      </section>


      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} videoKey={trailer?.key} title={movie.title} />

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="py-20 bg-gradient-to-b from-transparent to-black/40">
          <MovieRow title={lang === "ar" ? "أفلام مشابهة" : "Vous pourriez aussi aimer"} items={recommendations} />
        </div>
      )}

      {/* Reviews */}
      <ReviewSection tmdbId={movie.id} mediaType="movie" />

      {/* DISTRIBUTION MOVED TO BOTTOM */}
      <section className="container py-20 border-t border-white/5">
        {cast.length > 0 && (
          <div>
            <h2 className="font-display text-3xl mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-accent rounded-full" />
              Distribution
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
              {(cast || []).map((person: any) => (
                <Link key={person.id} to={`/person/${person.id}`} className="group">
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 bg-surface-card border border-border group-hover:border-accent/40 transition-all">
                    {person.profile_path ? (
                      <img 
                        src={IMG.profile(person.profile_path)} 
                        alt={person.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent/5">
                        <span className="text-accent/40 text-2xl font-black">{person.name?.[0] || "?"}</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-[10px] sm:text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">{person.name}</h4>
                  <p className="text-[9px] sm:text-xs text-muted-foreground line-clamp-1">{person.character}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      </ErrorBoundary>

      {downloadModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setDownloadModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-sm font-bold">روابط التحميل</h3>
                <button onClick={() => setDownloadModal(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {downloading && (
                  <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ البحث عن روابط التحميل…
                  </div>
                )}
                {!downloading && downloadError && (
                  <div className="text-center py-4 text-muted-foreground text-sm">{downloadError}</div>
                )}
                {!downloading && !downloadError && downloads.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">لا توجد روابط تحميل متاحة لهذا المحتوى</div>
                )}
                {!downloading && downloads.map((dl: any, i: number) => (
                  <a key={i} href={dl.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/50 border border-border hover:border-accent/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{dl.quality || dl.type || "مصدر"}</div>
                      <div className="text-[11px] text-muted-foreground">{dl.size} · {dl.type}</div>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                  </a>
                ))}
                {!downloading && (
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] text-muted-foreground hover:text-accent transition-colors border border-dashed border-border hover:border-accent/50"
                  >
                    <Download className="w-3 h-3" />
                    فتح صفحة التحميل مباشرة
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Movie;
