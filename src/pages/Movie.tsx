/**
 * BNKhub — Page détail Film.
 * Hero + VideoPlayer. Gère reprise depuis historique (?resume=1&src=Sx)
 * et synchronise l'historique Cloud à chaque lecture / changement de source.
 */
import { useEffect, useMemo, useState } from "react";
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
import { upsertWatchEntry } from "@/services/watchHistory";
import { SOURCE_LABELS } from "@/services/player";
import { Play, Star, Clock, Calendar, Globe2, ArrowLeft, Youtube } from "lucide-react";

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
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);

  const resumeRequested = params.get("resume") === "1";
  const initialSourceIndex = useMemo(() => sourceIdToIndex(params.get("src")), [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setPlaying(false);
    getMovieDetails(id, tmdbLang(lang))
      .then((m) => {
        setMovie(m);
        if (resumeRequested) setPlaying(true);
      })
      .finally(() => setLoading(false));
    getMovieRecommendations(id, tmdbLang(lang))
      .then((r) => setRecommendations(r.results.filter((m) => m.poster_path)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  if (loading || !movie) {
    return (
      <Layout>
        <div className="h-[60vh] shimmer-gold" />
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
    const sid = sourceLabel.split(" ")[0]; // "S1"
    upsertWatchEntry(user.id, {
      tmdb_id: movie.id,
      media_type: "movie",
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      source_id: sid,
    }).catch(() => {});
  };

  return (
    <Layout>
      <section className="relative min-h-[70vh] pt-24 pb-12 overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 grain" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-primary via-surface-primary/80 to-surface-primary/30" />

        <div className="relative container grid md:grid-cols-[280px_1fr] gap-8 items-end">
          <Link
            to="/"
            className="absolute top-0 start-6 md:start-0 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Retour
          </Link>

          {poster && (
            <img src={poster} alt={movie.title} className="w-56 md:w-[280px] rounded-2xl border border-accent-subtle shadow-glow animate-float" />
          )}

          <div className="animate-fade-slide-up">
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.slice(0, 4).map((g) => (
                <span key={g.id} className="text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-accent-subtle text-accent bg-accent/5">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-3 text-gradient-accent">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="font-decorative text-lg text-accent/80 mb-5 italic">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-6">
              {movie.vote_average > 0 && (
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {year && <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {year}</span>}
              {runtime && <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {runtime}</span>}
              {movie.original_language && (
                <span className="inline-flex items-center gap-1.5 uppercase">
                  <Globe2 className="w-4 h-4" /> {movie.original_language}
                </span>
              )}
            </div>

            <p className="text-foreground/85 max-w-3xl leading-relaxed mb-8">{movie.overview}</p>

            <div className="flex flex-wrap items-center gap-3">
              {!playing && (
                <button
                  onClick={() => setPlaying(true)}
                  className="inline-flex items-center gap-2.5 bg-gradient-accent text-accent-foreground font-semibold px-8 py-4 rounded-full shadow-accent hover:scale-[1.04] active:scale-[0.98] transition-transform duration-300 ease-luxe animate-pulse-glow"
                >
                  <Play className="w-5 h-5 fill-accent-foreground" />
                  {t("hero_watch")}
                </button>
              )}
              {trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-2.5 bg-surface-card border border-accent-subtle text-foreground font-semibold px-8 py-4 rounded-full hover:bg-accent/10 transition-all duration-300 ease-luxe"
                >
                  <Youtube className="w-5 h-5 text-red-600" />
                  {t("hero_trailer") || "Trailer"}
                </button>
              )}
              <FavoriteButton
                tmdbId={movie.id}
                mediaType="movie"
                title={movie.title}
                posterPath={movie.poster_path}
                backdropPath={movie.backdrop_path}
              />
              <ShareButtons title={movie.title} />
            </div>
          </div>
        </div>
      </section>

      <TrailerModal 
        isOpen={showTrailer} 
        onClose={() => setShowTrailer(false)} 
        videoKey={trailer?.key || null} 
        title={movie.title} 
      />

      {playing && imdb && (
        <section className="container py-8 animate-fade-in">
          <VideoPlayer
            imdb_id={imdb}
            tmdb_id={movie.id}
            type="movie"
            title={movie.title}
            initialSourceIndex={initialSourceIndex}
            onPlayStart={(_i, label) => saveHistory(label)}
            onSourceChange={(_i, label) => saveHistory(label)}
          />
        </section>
      )}

      {playing && !imdb && (
        <section className="container py-8">
          <p className="text-center text-muted-foreground">IMDb ID non disponible pour ce titre.</p>
        </section>
      )}

      {playing && (
        <section className="container pb-12">
          <SubtitleFinder 
            imdbId={imdb} 
            tmdbId={movie.id} 
            type="movie" 
            title={movie.title} 
          />
        </section>
      )}

      {recommendations.length > 0 && (
        <MovieRow title="Recommandé pour vous" items={recommendations} />
      )}
      {movie.similar?.results && movie.similar.results.length > 0 && (
        <MovieRow title="Films similaires" items={movie.similar.results} />
      )}

      <section className="container py-12">
        <ReviewSection tmdbId={movie.id} mediaType="movie" />
      </section>
    </Layout>
  );
};

export default Movie;
