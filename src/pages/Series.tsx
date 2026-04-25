import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { IMG, getSeriesDetails, getSeasonDetails, getSeriesRecommendations, TMDBSeries, TMDBSeason } from "@/services/tmdb";
import { FavoriteButton } from "@/components/movie/FavoriteButton";
import { ShareButtons } from "@/components/movie/ShareButtons";
import { MovieRow } from "@/components/movie/MovieRow";
import { SubtitleFinder } from "@/components/player/SubtitleFinder";
import { TrailerModal } from "@/components/movie/TrailerModal";
import { ReviewSection } from "@/components/movie/ReviewSection";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { tmdbLang } from "@/services/i18n";
import { upsertWatchEntry } from "@/services/watchHistory";
import { KABYLE_CONTENT } from "@/services/customContent";
import { SOURCE_LABELS } from "@/services/player";
import { Play, Star, Calendar, ArrowLeft, Youtube, ChevronRight, Clock, Info } from "lucide-react";
import { useAmbient } from "@/context/AmbientContext";
import { RemotePairingButton } from "@/components/movie/RemotePairingButton";

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
  const { setAmbientColor } = useAmbient();
  const [series, setSeries] = useState<TMDBSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [seasonData, setSeasonData] = useState<TMDBSeason | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

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
        if (s.backdrop_path) setAmbientColor(`hsl(var(--accent) / 0.2)`);
        
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
  }, [id, lang]);

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
        <div className="h-[70vh] shimmer-gold rounded-b-3xl" />
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

  const saveHistory = (sourceLabel: string) => {
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
    }).catch(() => {});
  };

  const handleEpisodeClick = (epNum: number) => {
    setEpisode(epNum);
    setPlaying(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <Layout>
      {/* Cinematic Hero */}
      <section className="relative min-h-[85vh] flex items-end pb-20 overflow-hidden">
        {backdrop && (
          <div className="absolute inset-0 z-0">
            <img src={backdrop} alt="" className="w-full h-full object-cover scale-105 animate-scale-in" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          </div>
        )}
        
        <div className="container relative z-10 grid lg:grid-cols-[300px_1fr] gap-12 items-end">
          <div className="hidden lg:block animate-fade-in">
            <img src={poster} alt={series.name} className="w-full rounded-2xl border border-white/10 shadow-2xl shadow-accent/20" />
          </div>

          <div className="animate-fade-slide-up">
            <Link to="/" className="inline-flex items-center gap-2 text-accent/80 hover:text-accent mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              <span className="text-xs font-bold uppercase tracking-widest">{t("nav_home")}</span>
            </Link>

            <div className="flex flex-wrap gap-2 mb-6">
              {series.genres?.map(g => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-accent">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-tight">
              {series.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/20 border border-accent/30 text-accent">
                <Star className="w-4 h-4 fill-accent" />
                <span className="font-bold">{series.vote_average.toFixed(1)}</span>
              </div>
              <span className="flex items-center gap-2 text-white/60 font-medium">
                <Calendar className="w-4 h-4" /> {year}
              </span>
              <span className="px-2 py-0.5 rounded border border-white/20 text-[10px] font-bold text-white/80">
                {series.number_of_seasons} SEASONS
              </span>
            </div>

            <p className="text-lg text-white/70 max-w-2xl leading-relaxed mb-10 line-clamp-3 md:line-clamp-none">
              {series.overview}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleEpisodeClick(1)}
                className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-10 py-4 rounded-full font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" /> {t("hero_watch")}
              </button>
              {trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full font-bold transition-all"
                >
                  <Youtube className="w-5 h-5 text-red-500" /> {t("hero_trailer")}
                </button>
              )}
              <FavoriteButton tmdbId={series.id} mediaType="tv" title={series.name} posterPath={series.poster_path} />
              <RemotePairingButton />
              <ShareButtons title={series.name} />
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        {/* Player Section */}
        <div ref={playerRef} className="scroll-mt-24">
          {playing && (
            <div className="mb-16 animate-scale-in">
              <VideoPlayer
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
              />
            </div>
          )}
        </div>

        {/* Episodes & Seasons Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">{lang === "ar" ? "الحلقات" : "Episodes"}</h2>
            <p className="text-white/40 text-sm">{series.name} • Season {season}</p>
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
                    {ep.overview || "No description available for this episode."}
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
                    WATCHING
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <TrailerModal isOpen={showTrailer} onClose={() => setShowTrailer(false)} videoKey={trailer?.key} title={series.name} />

      {/* Subtitles & Extras */}
      {playing && (
        <section className="container py-12 border-t border-white/5">
          <SubtitleFinder imdbId={imdb} tmdbId={series.id} type="tv" title={series.name} season={season} episode={episode} />
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="py-12 bg-black/20">
          <MovieRow title={lang === "ar" ? "مسلسلات مشابهة" : "Similar Series"} items={recommendations} type="tv" />
        </div>
      )}

      {/* Reviews */}
      <section className="container py-20">
        <ReviewSection tmdbId={series.id} mediaType="tv" />
      </section>
    </Layout>
  );
};

export default Series;
