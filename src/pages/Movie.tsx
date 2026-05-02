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
import { VideoBackdrop } from "@/components/movie/VideoBackdrop";
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
  const { setAmbientColor, setAmbientImage } = useAmbient();
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
        if (m.backdrop_path) {
          setAmbientImage(IMG.backdrop(m.backdrop_path, "w780"));
        }
        if (resumeRequested) setPlaying(true);
      })
      .finally(() => setLoading(false));
    getMovieRecommendations(id, tmdbLang(lang))
      .then((r) => setRecommendations(r.results.filter((m) => m.poster_path)))
      .catch(() => {});
  }, [id, lang, setAmbientImage]);

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

  const year = movie.release_date?.slice(0, 4);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min` : null;
  const imdb = movie.imdb_id || (movie as any).external_ids?.imdb_id || "";
  const backdrop = IMG.backdrop(movie.backdrop_path, "original");
  const poster = IMG.poster(movie.poster_path, "w500");
  
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

  const director = movie.credits?.crew.find(c => c.job === 'Director')?.name;
  const cast = movie.credits?.cast.slice(0, 10) || [];

  return (
    <Layout>
      <SEO 
        title={`Regarder ${movie.title} en 4K`}
        description={movie.overview || `Regardez ${movie.title} en haute qualité gratuitement sur BNKhub.`}
        image={poster}
        type="video.movie"
        keywords={`${movie.title}, regarder ${movie.title}, film gratuit, BNKhub`}
      />
      {/* Cinematic Hero with Video Background */}
      <section className="relative min-h-[75vh] md:min-h-[90vh] lg:min-h-[95vh] flex items-end pb-8 md:pb-16 lg:pb-24 overflow-hidden -mt-16 md:-mt-20 lg:-mt-24 pt-16 md:pt-20 lg:pt-24">
        <VideoBackdrop 
          backdropPath={backdrop} 
          videoKey={trailer?.key} 
          title={movie.title} 
        />
        
        <div className="container relative z-10 grid lg:grid-cols-[300px_1fr] gap-6 md:gap-12 items-end">
          <div className="hidden lg:block animate-fade-in group">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-accent/20">
               <img src={poster} alt={movie.title} className="w-full transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="animate-fade-slide-up">
            <Link to="/" className="inline-flex items-center gap-2 text-accent/80 hover:text-accent mb-3 md:mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              <span className="text-xs font-bold uppercase tracking-widest">{t("nav_home")}</span>
            </Link>

            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-6">
              {movie.genres?.slice(0, 4).map(g => (
                <span key={g.id} className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-accent">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold mb-2 md:mb-4 text-white leading-tight">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-sm md:text-xl text-accent/90 italic mb-4 md:mb-8 font-decorative">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-4 md:mb-10 text-white/70 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl bg-white/5 border border-white/10">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-accent fill-accent" />
                <span className="text-base md:text-xl font-black text-white">{movie.vote_average.toFixed(1)}</span>
              </div>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" /> {year}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" /> {runtime}</span>
              {movie.original_language && (
                <span className="hidden sm:flex items-center gap-1.5 uppercase"><Globe2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" /> {movie.original_language}</span>
              )}
            </div>

            <p className="text-sm md:text-lg text-white/60 max-w-3xl leading-relaxed mb-6 md:mb-12 line-clamp-2 md:line-clamp-3 lg:line-clamp-none">
              {movie.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-5">
              {!playing && (
                <button
                  onClick={startWatching}
                  className="inline-flex items-center gap-2 md:gap-3 bg-accent text-accent-foreground px-6 md:px-10 py-3 md:py-4 rounded-full font-bold shadow-glow hover:scale-105 active:scale-95 transition-all text-sm"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> {t("hero_watch")}
                </button>
              )}
              {trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-2 md:gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 md:px-10 py-3 md:py-4 rounded-full font-bold transition-all text-sm"
                >
                  <Youtube className="w-4 h-4 md:w-5 md:h-5 text-red-500" /> {t("hero_trailer")}
                </button>
              )}
              <FavoriteButton tmdbId={movie.id} mediaType="movie" title={movie.title} posterPath={movie.poster_path} className="px-4 md:px-6 py-3 md:py-4" />
              <div className="hidden sm:flex gap-3">
                <RemotePairingButton />
                <ShareButtons title={movie.title} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} videoKey={trailer?.key} title={movie.title} />

      {/* Video Player Section */}
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

      {/* DETAILED INFO SECTION */}
      <section className="container py-20">
        <div className="grid lg:grid-cols-[1fr_350px] gap-16">
          <div className="space-y-16">
            {/* Cast */}
            {cast.length > 0 && (
              <div>
                <h2 className="font-display text-3xl mb-8 flex items-center gap-3">
                  <span className="w-8 h-1 bg-accent rounded-full" />
                  Distribution
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {cast.map(person => (
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
                            <span className="text-accent/40 text-2xl font-black">{person.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">{person.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{person.character}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Subtitles (from SubtitleFinder) */}
            <SubtitleFinder imdbId={imdb} tmdbId={movie.id} type="movie" title={movie.title} />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
             <div className="p-8 rounded-3xl bg-surface-card/40 backdrop-blur-md border border-border/50">
               <h3 className="text-[11px] uppercase tracking-[0.2em] text-accent font-black mb-6 opacity-60">Détails de production</h3>
               
               <div className="space-y-6">
                 {director && (
                   <div>
                     <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">Réalisateur</p>
                     <p className="text-lg font-bold">{director}</p>
                   </div>
                 )}
                 
                 {(movie as any).status && (
                   <div>
                     <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">Statut</p>
                     <p className="text-lg font-bold">{(movie as any).status}</p>
                   </div>
                 )}

                 {(movie as any).budget > 0 && (
                   <div>
                     <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">Budget</p>
                     <p className="text-lg font-bold text-green-400">
                       ${((movie as any).budget / 1000000).toFixed(1)}M
                     </p>
                   </div>
                 )}

                 {(movie as any).revenue > 0 && (
                   <div>
                     <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">Recettes</p>
                     <p className="text-lg font-bold text-blue-400">
                       ${((movie as any).revenue / 1000000).toFixed(1)}M
                     </p>
                   </div>
                 )}

                 {movie.original_title && movie.original_title !== movie.title && (
                   <div>
                     <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest font-bold">Titre original</p>
                     <p className="text-lg font-bold italic opacity-80">{movie.original_title}</p>
                   </div>
                 )}
               </div>
             </div>

             {/* Reviews */}
             <ReviewSection tmdbId={movie.id} mediaType="movie" />
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="py-20 bg-gradient-to-b from-transparent to-black/40">
          <MovieRow title={lang === "ar" ? "أفلام مشابهة" : "Vous pourriez aussi aimer"} items={recommendations} />
        </div>
      )}
    </Layout>
  );
};

export default Movie;
