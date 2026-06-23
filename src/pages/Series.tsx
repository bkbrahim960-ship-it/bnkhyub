import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

import { IMG, getSeriesDetails, getSeasonDetails, getSeriesRecommendations, TMDBSeries, TMDBSeason } from "@/services/tmdb";
import { getOMDbDetails, OMDbResult } from "@/services/omdb";
import { RatingsDisplay } from "@/components/ui/RatingsDisplay";
import { FavoriteButton } from "@/components/movie/FavoriteButton";
import { ShareButtons } from "@/components/movie/ShareButtons";
import { MovieRow } from "@/components/movie/MovieRow";

import { TrailerModal } from "@/components/movie/TrailerModal";

import { VideoBackdrop } from "@/components/movie/VideoBackdrop";
import { LoginPrompt } from "@/components/LoginPrompt";
import { ReviewSection } from "@/components/movie/ReviewSection";
import { EpisodeModal } from "@/components/movie/EpisodeModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { tmdbLang } from "@/services/i18n";
import { SEO } from "@/components/SEO";
import { getSeriesHistory, WatchHistoryEntry } from "@/services/watchHistory";
import { SOURCE_LABELS } from "@/services/player";
import { Play, Star, Calendar, ArrowLeft, Youtube, ChevronRight, Clock, Info, Check } from "lucide-react";
import { useAmbient } from "@/context/AmbientContext";
import { RemotePairingButton } from "@/components/movie/RemotePairingButton";
import { MovieLogo } from "@/components/ui/MovieLogo";
import { useIsDesktopOrTV } from "@/hooks/useIsDesktopOrTV";

const sourceIdToIndex = (srcId?: string | null): number => {
  if (!srcId) return 0;
  const i = SOURCE_LABELS.findIndex((l) => l.startsWith(srcId));
  return i >= 0 ? i : 0;
};

const Series = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { setAmbientColor, setAmbientImage } = useAmbient();
  const [series, setSeries] = useState<TMDBSeries | null>(null);
  const [omdbData, setOmdbData] = useState<OMDbResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState<TMDBSeason | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(0);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [seriesHistory, setSeriesHistory] = useState<WatchHistoryEntry[]>([]);
  const navigate = useNavigate();
  const isDesktopOrTV = useIsDesktopOrTV();
  const resumeRequested = params.get("resume") === "1";
  const playRequested = params.get("play") === "1";
  const resumeSeason = Number(params.get("s")) || null;
  const resumeEpisode = Number(params.get("e")) || null;
  const initialSourceIndex = useMemo(() => sourceIdToIndex(params.get("src")), [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    getSeriesDetails(id, tmdbLang(lang))
      .then((s) => {
        setSeries(s);
        if (s.backdrop_path) {
          setAmbientImage(IMG.backdrop(s.backdrop_path, "w780"));
        }
        
        if (resumeRequested && resumeSeason && resumeEpisode) {
          setSeason(resumeSeason);
          setEpisode(resumeEpisode);
        } else {
          const firstReal = s.seasons?.find((se) => se.season_number > 0);
          setSeason(firstReal?.season_number ?? 1);
          setEpisode(1);
        }
        // Fetch OMDb data
        if (s.external_ids?.imdb_id) {
          getOMDbDetails(s.external_ids.imdb_id, s.name, s.first_air_date?.slice(0, 4)).then(setOmdbData);
        }
      })
      .finally(() => setLoading(false));
  }, [id, lang, setAmbientImage]);

  // Clean up ambient on unmount
  useEffect(() => {
    return () => setAmbientImage(null);
  }, [setAmbientImage]);

  useEffect(() => {
    if (!id) return;
    getSeriesRecommendations(id, tmdbLang(lang))
      .then((r) => setRecommendations(r.results.filter((s: any) => s.poster_path)))
      .catch((err) => console.error("Series recommendations fetch error:", err));
  }, [id, lang]);

  useEffect(() => {
    if (user && series) {
      getSeriesHistory(user.id, series.id).then(setSeriesHistory).catch((err) => console.error("Series history fetch error:", err));
    }
  }, [user, series]);

  useEffect(() => {
    if (!series || !season) return;
    
    setSeasonLoading(true);
    getSeasonDetails(series.id, season, tmdbLang(lang))
      .then(setSeasonData)
      .finally(() => setSeasonLoading(false));
  }, [series, season, lang]);

  if (loading || !series) {
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

  const year = series.first_air_date?.slice(0, 4);
  const backdrop = IMG.backdrop(series.backdrop_path, "original");
  const poster = IMG.poster(series.poster_path, "w500");
  const imdb = series.external_ids?.imdb_id ?? "";
  const seasons = series.seasons?.filter((s) => s.season_number > 0) ?? [];
  
  const trailer = series.videos?.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  ) || series.videos?.results.find((v) => v.site === "YouTube");

  const goToEpisode = (epNum: number) => {
    navigate(`/player/tv/${id}?s=${season}&e=${epNum}${window.location.search}`);
  };

  const handleEpisodeClick = (epNum: number) => {
    setSelectedEpisode(epNum);
    setShowEpisodeModal(true);
  };

  const confirmWatch = () => {
    setShowLoginPrompt(false);
    setShowEpisodeModal(false);
    if (selectedEpisode) {
      goToEpisode(selectedEpisode);
    }
  };

  const startWatchingEpisode = () => {
    confirmWatch();
  };

  const cast = (series as any).credits?.cast.slice(0, 10) || [];
  const creator = (series as any).created_by?.[0]?.name || (series as any).credits?.crew.find((c: any) => c.job === 'Executive Producer')?.name;

  return (
    <Layout>
      <SEO 
        title={`Regarder ${series.name} en Streaming`}
        description={series.overview || `Regardez toutes les saisons de ${series.name} en haute qualité sur BNKhub.`}
        image={poster}
        type="video.tv_show"
        keywords={`${series.name}, regarder ${series.name}, serie gratuite, BNKhub`}
      />

      {/* Login prompt removed - users can watch without registration */}

      {showEpisodeModal && seasonData && selectedEpisode > 0 && (
        <EpisodeModal
          isOpen={showEpisodeModal}
          onClose={() => setShowEpisodeModal(false)}
          onPlay={startWatchingEpisode}
          onTrailer={trailer ? () => setShowTrailer(true) : undefined}
          episode={seasonData.episodes.find(e => e.episode_number === selectedEpisode) || seasonData.episodes[0]}
          seriesTitle={series.name}
          seasonNumber={season}
          backdropFallback={backdrop}
        />
      )}

      {/* Cinematic Hero with Video Background */}
      <section className="relative min-h-[45vh] md:min-h-[85vh] lg:min-h-[90vh] flex items-end pb-24 md:pb-14 lg:pb-20 overflow-hidden">
        <VideoBackdrop 
          backdropPath={backdrop} 
          videoKey={trailer?.key} 
          title={series.name} 
        />
      </section>

      {/* NEW ORGANIZED INFO BLOCK */}
      <section className="container -mt-32 relative z-20 pb-12">
        {/* Poster + Logo row */}
        <div className="flex items-end gap-4 md:gap-8 mb-6">
          {/* Poster - always left aligned */}
          <div className="animate-fade-in shrink-0">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-accent/20 w-28 sm:w-36 md:w-48 lg:w-64">
               <img src={poster} alt={series.name} className="w-full" />
            </div>
          </div>

          {/* Logo beside poster */}
          <div className="animate-fade-slide-up flex-1 min-w-0 pb-2">
            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3 mb-2 sm:mb-4 lg:mb-6">
              {series.genres?.slice(0, 3).map(g => (
                <span key={g.id} className="px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 lg:py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[7px] sm:text-[9px] lg:text-xs font-bold uppercase tracking-widest text-accent">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Series Title Logo - small on mobile */}
            <div className="mb-2 sm:mb-4 lg:mb-8">
              <MovieLogo 
                id={series.id} 
                type="tv" 
                title={series.name} 
                className="h-8 sm:h-12 md:h-20 lg:h-32 max-w-full" 
              />
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 text-white/70 text-xs sm:text-sm lg:text-base mb-3 lg:mb-6">
              <span>{year}</span>
              <span className="px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 lg:py-1.5 rounded bg-accent/10 text-accent text-[7px] sm:text-[9px] lg:text-xs font-bold">{series.number_of_seasons} {lang === 'ar' ? 'مواسم' : 'SAISONS'}</span>
            </div>
            
            {/* Ratings Display */}
            <RatingsDisplay
              tmdbRating={series.vote_average}
              tmdbVoteCount={series.vote_count}
              imdbRating={omdbData?.imdbRating}
              rottenTomatoes={omdbData?.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value}
              metacritic={omdbData?.Ratings?.find(r => r.Source === "Metacritic")?.Value}
            />
          </div>
        </div>

        {/* Overview */}
        <p className="text-white/60 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-6 lg:mb-8 line-clamp-3">
          {series.overview}
        </p>

        {/* Primary Action Button (Watch) */}
        <button
          type="button"
          data-tv-nav="primary"
          tabIndex={0}
          onClick={() =>
            isDesktopOrTV ? goToEpisode(episode) : handleEpisodeClick(episode)
          }
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
            <FavoriteButton tmdbId={series.id} mediaType="tv" title={series.name} posterPath={series.poster_path} />
          </div>

          <div className="flex items-center justify-center w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-full bg-white/5 hover:bg-accent/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <RemotePairingButton />
          </div>

          <div className="flex items-center justify-center w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-full bg-white/5 hover:bg-accent/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <ShareButtons title={series.name} />
          </div>
        </div>
      </section>


      <div className="container py-4">
        {/* Episodes & Seasons Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">{lang === "ar" ? "الحلقات" : "Épisodes"}</h2>
            <p className="text-white/40 text-sm">{series.name} • Saison {season}</p>
          </div>

          {/* Season Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {seasons.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSeason(s.season_number); setEpisode(1); }}
                className={`shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  season === s.season_number 
                    ? "bg-accent text-accent-foreground border-accent shadow-glow" 
                    : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Episode Grid */}
        {seasonLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <div key={n} className="aspect-video rounded-2xl shimmer-gold" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {seasonData?.episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => handleEpisodeClick(ep.episode_number)}
                className={`group relative flex flex-col text-left rounded-2xl overflow-hidden transition-all duration-500 border ${
                  episode === ep.episode_number
                    ? "bg-accent/10 border-accent shadow-glow scale-[1.03] z-10"
                    : "bg-surface-card border-white/5 hover:border-accent/40 hover:-translate-y-2"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={ep.still_path ? IMG.backdrop(ep.still_path, "w780") : backdrop}
                    alt={ep.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center shadow-glow">
                      <Play className="w-6 h-6 fill-accent-foreground text-accent-foreground ms-1" />
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-[10px] font-black">
                      E{ep.episode_number}
                    </span>
                    {ep.runtime && (
                      <span className="text-[10px] font-bold text-white/80 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ep.runtime}m
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                    {ep.name}
                  </h3>
                  <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2 mb-4">
                    {ep.overview || "Aucune description disponible pour cet épisode."}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold text-accent/60 uppercase tracking-tighter">
                      {ep.air_date}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                
                {/* Active Indicator */}
                {episode === ep.episode_number && playing ? (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-accent text-accent-foreground text-[8px] font-bold animate-pulse z-10">
                    LECTURE
                  </div>
                ) : (() => {
                  const hist = seriesHistory.find(h => h.season_number === season && h.episode_number === ep.episode_number);
                  const isWatched = hist && hist.duration_seconds && (hist.progress_seconds / hist.duration_seconds > 0.85);
                  if (isWatched) {
                    return (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-green-500/80 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm z-10">
                        <Check className="w-3 h-3" /> {lang === 'ar' ? 'تمت المشاهدة' : 'Visionné'}
                      </div>
                    );
                  }
                  return null;
                })()}
              </button>
            ))}
          </div>
        )}
      </div>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} videoKey={trailer?.key} title={series.name} />

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="py-20 bg-gradient-to-b from-transparent to-black/40">
          <MovieRow title={lang === "ar" ? "مسلسلات مشابهة" : "Séries similaires"} items={recommendations} type="tv" />
        </div>
      )}

      {/* Reviews */}
      <ReviewSection tmdbId={series.id} mediaType="tv" />

      {/* DISTRIBUTION MOVED TO BOTTOM */}
      <section className="container py-20 border-t border-white/5">
        {cast.length > 0 && (
          <div>
            <h2 className="font-display text-3xl mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-accent rounded-full" />
              Distribution
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
              {cast.map((person: any) => (
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

export default Series;
