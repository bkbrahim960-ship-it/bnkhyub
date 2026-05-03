import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { VideoPlayer, VideoPlayerRef } from "@/components/player/VideoPlayer";
import { SubtitleFinder } from "@/components/player/SubtitleFinder";
import { MovieRow } from "@/components/movie/MovieRow";
import { FavoriteButton } from "@/components/movie/FavoriteButton";
import { ShareButtons } from "@/components/movie/ShareButtons";

import { TrailerModal } from "@/components/movie/TrailerModal";

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
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

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
      playerContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      <section className="relative min-h-[45vh] md:min-h-[90vh] lg:min-h-[95vh] flex items-end pb-24 md:pb-16 lg:pb-24 overflow-hidden pt-0 md:pt-20 lg:pt-24">
        <VideoBackdrop 
          backdropPath={backdrop} 
          videoKey={trailer?.key} 
          title={movie.title} 
        />
        
        </div>
      </section>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} videoKey={trailer?.key} title={movie.title} />

      {/* Video Player Section */}
      <div ref={playerContainerRef} className="scroll-mt-24">
        {playing && (
          <section className="container py-4 animate-scale-in">
            <VideoPlayer
              ref={videoPlayerRef}
              imdb_id={imdb || ""}
              tmdb_id={movie.id}
              type="movie"
              title={movie.title}
              initialSourceIndex={initialSourceIndex}
              customUrl={(movie as any).video_url}
              onPlayStart={(_i, label) => saveHistory(label)}
              onSourceChange={(_i, label) => saveHistory(label)}
            />
            
            <SubtitleFinder 
              imdbId={imdb || ""} 
              tmdbId={movie.id} 
              title={movie.title} 
              type="movie"
              onSubtitleSelect={(url) => videoPlayerRef.current?.setSubtitle(url)}
            />
          </section>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="py-20 bg-gradient-to-b from-transparent to-black/40">
          <MovieRow title={lang === "ar" ? "أفلام مشابهة" : "Vous pourriez aussi aimer"} items={recommendations} />
        </div>
      )}

      {/* DISTRIBUTION MOVED TO BOTTOM */}
      <section className="container py-20 border-t border-white/5">
        {cast.length > 0 && (
          <div>
            <h2 className="font-display text-3xl mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-accent rounded-full" />
              Distribution
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
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
                  <h4 className="font-bold text-[10px] sm:text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">{person.name}</h4>
                  <p className="text-[9px] sm:text-xs text-muted-foreground line-clamp-1">{person.character}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Movie;
