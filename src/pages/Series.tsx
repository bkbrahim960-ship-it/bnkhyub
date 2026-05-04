import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { VideoPlayer, VideoPlayerRef } from "@/components/player/VideoPlayer";
import { SubtitleFinder } from "@/components/player/SubtitleFinder";
import { IMG, getSeriesDetails, getSeasonDetails, getSeriesRecommendations, TMDBSeries, TMDBSeason } from "@/services/tmdb";
import { FavoriteButton } from "@/components/movie/FavoriteButton";
import { ShareButtons } from "@/components/movie/ShareButtons";
import { MovieRow } from "@/components/movie/MovieRow";

import { TrailerModal } from "@/components/movie/TrailerModal";

import { VideoBackdrop } from "@/components/movie/VideoBackdrop";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { tmdbLang } from "@/services/i18n";
import { SEO } from "@/components/SEO";
import { upsertWatchEntry } from "@/services/watchHistory";
import { KABYLE_CONTENT } from "@/services/customContent";
import { SOURCE_LABELS } from "@/services/player";
import { Play, Star, Calendar, ArrowLeft, Youtube, ChevronRight, Clock, Info } from "lucide-react";
import { useAmbient } from "@/context/AmbientContext";
import { RemotePairingButton } from "@/components/movie/RemotePairingButton";
import { NextEpisodeOverlay } from "@/components/player/NextEpisodeOverlay";

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
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [seasonData, setSeasonData] = useState<TMDBSeason | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const resumeRequested = params.get("resume") === "1";
  const resumeSeason = Number(params.get("s")) || null;
  const resumeEpisode = Number(params.get("e")) || null;
  const initialSourceIndex = useMemo(() => sourceIdToIndex(params.get("src")), [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setPlaying(false);

    const custom = KABYLE_CONTENT.find(c => c.id === id);
    if (custom) {
      const customSeries = {
        ...custom,
        seasons: [{ id: 1, name: "Saison 1", episode_count: custom.episodes?.length || 0, season_number: 1 }],
      };
      setSeries(customSeries as any);
      setLoading(false);
      
      if (resumeRequested && resumeSeason && resumeEpisode) {
        setSeason(resumeSeason);
        setEpisode(resumeEpisode);
        setPlaying(true);
      }
      return;
    }

    getSeriesDetails(id, tmdbLang(lang))
      .then((s) => {
        setSeries(s);
        if (s.backdrop_path) {
          setAmbientImage(IMG.backdrop(s.backdrop_path, "w780"));
        }
        
        if (resumeRequested && resumeSeason && resumeEpisode) {
          setSeason(resumeSeason);
          setEpisode(resumeEpisode);
          setPlaying(true);
        } else {
          const firstReal = s.seasons?.find((se) => se.season_number > 0);
          setSeason(firstReal?.season_number ?? 1);
          setEpisode(1);
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
      .catch(() => {});
  }, [id, lang]);

  useEffect(() => {
    if (!series || !season) return;
    
    const custom = KABYLE_CONTENT.find(c => c.id === String(series.id));
    if (custom) {
      setSeasonData({
        id: 1,
        name: "Saison 1",
        season_number: 1,
        episodes: custom.episodes?.map(ep => ({
          id: ep.id,
          name: ep.title,
          episode_number: ep.id,
          still_path: null,
          overview: ""
        })) || []
      } as any);
      setSeasonLoading(false);
      return;
    }

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

  const saveHistory = (sourceLabel: string, progress?: number, duration?: number) => {
    if (!user) return;
    const sid = sourceLabel.split(" ")[0];
    upsertWatchEntry(user.id, {
      tmdb_id: series.id,
      media_type: "tv",
      title: series.name,
      poster_path: series.poster_path,
      backdrop_path: series.backdrop_path,
      season_number: season,
      episode_number: episode,
      source_id: sid,
      progress_seconds: progress,
      duration_seconds: duration,
    }).catch(() => {});
  };

  const handleEpisodeClick = (epNum: number) => {
    setEpisode(epNum);
    setPlaying(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
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
      {/* Cinematic Hero with Video Background */}
      <section className="relative min-h-[45vh] md:min-h-[85vh] lg:min-h-[90vh] flex items-end pb-24 md:pb-14 lg:pb-20 overflow-hidden pt-0 md:pt-20 lg:pt-24">
        <VideoBackdrop 
          backdropPath={backdrop} 
          videoKey={trailer?.key} 
          title={series.name} 
        />
      </section>

      {/* NEW ORGANIZED INFO BLOCK */}
      <section className="container -mt-32 relative z-20 pb-12">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 md:gap-12 items-end">
          <div className="hidden lg:block animate-fade-in group">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-accent/20">
               <img src={poster} alt={series.name} className="w-full transition-transform duration-700 group-hover:scale-110" />
            </div>
          </div>

          <div className="animate-fade-slide-up">
            <div className="flex flex-wrap gap-2 mb-4">
              {series.genres?.slice(0, 3).map(g => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold uppercase tracking-widest text-accent">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-6xl lg:text-7xl font-bold mb-4 text-white">
              {series.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-white/70 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-black text-white">{series.vote_average.toFixed(1)}</span>
              </div>
              <span>{year}</span>
              <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold">{series.number_of_seasons} SAISONS</span>
            </div>

            <p className="text-white/60 text-base md:text-lg max-w-3xl leading-relaxed mb-8 line-clamp-3">
              {series.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-5">
              <button
                onClick={() => handleEpisodeClick(1)}
                className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 rounded-full font-bold shadow-glow hover:scale-105 transition-all text-sm md:text-base"
              >
                <Play className="w-5 h-5 fill-current" /> {t("hero_watch")}
              </button>
              {trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-full font-bold transition-all text-sm"
                >
                  <Youtube className="w-5 h-5 text-red-500" /> {t("hero_trailer")}
                </button>
              )}
              <FavoriteButton tmdbId={series.id} mediaType="tv" title={series.name} posterPath={series.poster_path} className="px-5 py-4" />
              <div className="flex items-center gap-3">
                <RemotePairingButton />
                <ShareButtons title={series.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-4">
        {/* Player Section */}
        <div ref={playerRef} className="scroll-mt-24">
          {playing && (
            <div className="mb-16 animate-scale-in">
              <VideoPlayer
                ref={videoPlayerRef}
                key={`${season}-${episode}`}
                imdb_id={imdb}
                tmdb_id={series.id}
                type="tv"
                season={season}
                episode={episode}
                title={`${series.name} — S${season} E${episode}`}
                initialSourceIndex={initialSourceIndex}
                onPlayStart={(_i, label) => saveHistory(label)}
                onSourceChange={(_i, label) => saveHistory(label)}
                onProgress={(seconds, duration) => {
                  const label = SOURCE_LABELS[initialSourceIndex] || "S1";
                  saveHistory(label, seconds, duration);
                }}
                onCompleted={() => {
                  if (seasonData && episode < (seasonData.episodes?.length || 0)) {
                    setShowNextEpisode(true);
                  }
                }}
              />
              
              <SubtitleFinder 
                imdbId={imdb || ""} 
                tmdbId={series.id} 
                title={series.name} 
                type="tv"
                season={season}
                episode={episode}
                onSubtitleSelect={(url) => videoPlayerRef.current?.setSubtitle(url)}
              />
              {/* Next Episode Button */}
              {seasonData && episode < (seasonData.episodes?.length || 0) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowNextEpisode(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground font-bold text-sm transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {lang === 'ar' ? 'الحلقة التالية' : 'Épisode suivant'}
                  </button>
                </div>
              )}
              {/* Subtitles Finder below player for TV */}
              <div className="mt-8">

              </div>
            </div>
          )}
        </div>

        {/* Auto-play Next Episode Overlay */}
        {showNextEpisode && seasonData && episode < (seasonData.episodes?.length || 0) && (
          <NextEpisodeOverlay
            nextEpisodeTitle={seasonData.episodes[episode]?.name || `Épisode ${episode + 1}`}
            nextEpisodeNumber={episode + 1}
            seasonNumber={season}
            seriesName={series.name}
            stillPath={seasonData.episodes[episode]?.still_path ? IMG.backdrop(seasonData.episodes[episode].still_path, "w780") : backdrop}
            onPlay={() => {
              setShowNextEpisode(false);
              handleEpisodeClick(episode + 1);
            }}
            onCancel={() => setShowNextEpisode(false)}
          />
        )}

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
                onClick={() => { setSeason(s.season_number); setEpisode(1); setPlaying(false); }}
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
                  episode === ep.episode_number && playing
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
                {episode === ep.episode_number && playing && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-accent text-accent-foreground text-[8px] font-bold animate-pulse">
                    LECTURE
                  </div>
                )}
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
