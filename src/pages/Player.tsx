import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { VideoPlayer, VideoPlayerRef } from "@/components/player/VideoPlayer";
import { IMG, getMovieDetails, getSeriesDetails, getSeasonDetails, TMDBMovie, TMDBSeries, TMDBSeason } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { SEO } from "@/components/SEO";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SOURCE_LABELS } from "@/services/player";
import { CUSTOM_CONTENT, MOCK_SERIES } from "@/services/customContent";
import { useAuth } from "@/context/AuthContext";
import { upsertWatchEntry } from "@/services/watchHistory";

export default function Player() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [meta, setMeta] = useState<{ title: string; imdb_id: string; poster?: string; backdrop?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasonData, setSeasonData] = useState<TMDBSeason | null>(null);
  const [showControls, setShowControls] = useState(true);

  const isMovie = type === "movie";
  const season = params.get("s") ? Number(params.get("s")) : undefined;
  const episode = params.get("e") ? Number(params.get("e")) : undefined;
  const customEntry = useMemo(() => {
    if (!id) return undefined;
    if (id.startsWith("m-") || id.startsWith("s-")) {
      return CUSTOM_CONTENT.find((c) => c.id === id) || MOCK_SERIES.find((c) => c.id === id);
    }
    return undefined;
  }, [id]);
  const customUrl = useMemo(() => {
    if (!customEntry) return undefined;
    if (!isMovie && episode && (customEntry as any).episodes) {
      const ep = (customEntry as any).episodes.find((e: any) => e.id === episode);
      return ep?.videoUrl || customEntry.videoUrl;
    }
    return customEntry.videoUrl;
  }, [customEntry, isMovie, episode]);
  const initialSourceIndex = useMemo(() => {
    if (customUrl) return 0;
    const src = params.get("src");
    if (!src) return 0;
    const i = SOURCE_LABELS.findIndex((l) => l.startsWith(src));
    return i >= 0 ? i : 0;
  }, [params, customUrl]);

  useEffect(() => {
    if (!id) return;
    if (customEntry) {
      setMeta({ title: customEntry.title, imdb_id: "", poster: customEntry.thumbnail, backdrop: customEntry.thumbnail });
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetcher = isMovie ? getMovieDetails : getSeriesDetails;
    fetcher(id, tmdbLang(lang))
      .then((data: TMDBMovie | TMDBSeries) => {
        setMeta({
          title: (data as any).title || (data as any).name || "",
          imdb_id: (data as any).imdb_id || (data as any).external_ids?.imdb_id || "",
          poster: (data as any).poster_path,
          backdrop: (data as any).backdrop_path,
        });
      })
      .catch(() => {
        setMeta({ title: "", imdb_id: "" });
      })
      .finally(() => setLoading(false));
  }, [id, isMovie, lang, customEntry]);

  useEffect(() => {
    if (!id || isMovie || !season) return;
    getSeasonDetails(id, season, tmdbLang(lang))
      .then(setSeasonData)
      .catch(() => setSeasonData(null));
  }, [id, isMovie, season, lang]);

  const restartHideTimer = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
  };

  useEffect(() => {
    if (!loading) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
    }
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [loading]);

  useEffect(() => {
    const onActivity = () => restartHideTimer();
    document.addEventListener("mousemove", onActivity);
    document.addEventListener("touchstart", onActivity);
    return () => {
      document.removeEventListener("mousemove", onActivity);
      document.removeEventListener("touchstart", onActivity);
    };
  }, []);

  useEffect(() => {
    try { (screen.orientation as any)?.lock?.("landscape")?.catch(() => {}); } catch {}
    return () => { try { (screen.orientation as any)?.unlock?.(); } catch {} };
  }, []);

  const goToEpisode_ = (s: number, e: number) => {
    navigate(`/player/tv/${id}?s=${s}&e=${e}&src=S${initialSourceIndex + 1}`);
  };

  const totalEps = seasonData?.episodes?.length || 0;
  const hasPrev = !isMovie && season !== undefined && episode !== undefined && (season > 1 || episode > 1);
  const hasNext = !isMovie && season !== undefined && episode !== undefined && (episode < totalEps);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  const saveHistory = (sourceLabel: string, progress?: number, duration?: number) => {
    if (!user || !meta) return;
    const sid = sourceLabel.split(" ")[0];
    upsertWatchEntry(user.id, {
      tmdb_id: Number(id),
      media_type: isMovie ? "movie" : "tv",
      title: meta.title,
      poster_path: meta.poster,
      backdrop_path: meta.backdrop,
      source_id: sid,
      progress_seconds: progress,
      duration_seconds: duration,
    }).catch(() => {});
  };

  const goBack = () => {
    if (hasPrev) {
      if (episode! > 1) goToEpisode_(season!, episode! - 1);
      else goToEpisode_(season! - 1, totalEps);
    }
  };

  const goForward = () => {
    if (hasNext) {
      goToEpisode_(season!, episode! + 1);
    }
  };

  return (
    <>
      <SEO title={meta?.title || "Player"} />
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className={`absolute top-0 left-0 right-0 z-40 flex items-center gap-3 p-3 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <button
            onClick={() => navigate(isMovie ? `/movie/${id}` : `/series/${id}`)}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          {meta?.title && (
            <span className="text-sm font-bold text-white truncate">{meta.title}</span>
          )}
          {!isMovie && season !== undefined && episode !== undefined && (
            <div className="flex items-center gap-2 ms-auto">
              <button
                onClick={goBack}
                disabled={!hasPrev}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-20 shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <span className="text-xs font-bold text-white/80 whitespace-nowrap">S{season} E{episode}</span>
              <button
                onClick={goForward}
                disabled={!hasNext}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-20 shrink-0"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
          <img src="/logo.png" alt="BNKhub" className="h-5 sm:h-7 w-auto opacity-25 ms-2" />
        </div>

        <div className="flex-1 relative overflow-hidden">
            <VideoPlayer
              ref={videoPlayerRef}
              imdb_id={meta?.imdb_id || ""}
              tmdb_id={customUrl ? id : Number(id)}
              type={isMovie ? "movie" : "tv"}
              season={season}
              episode={episode}
              title={meta?.title}
              customUrl={customUrl}
              initialSourceIndex={initialSourceIndex}
              autoStart={true}
              fullscreen={true}
              onPlayStart={(_i, label) => saveHistory(label)}
              onSourceChange={(_i, label) => saveHistory(label)}
              onProgress={(seconds, duration) => {
                const label = SOURCE_LABELS[initialSourceIndex] || "S1";
                saveHistory(label, seconds, duration);
              }}
            />
        </div>

      </div>
    </>
  );
}
