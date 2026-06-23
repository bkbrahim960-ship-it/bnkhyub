import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { VideoPlayer, VideoPlayerRef } from "@/components/player/VideoPlayer";
import { IMG, getMovieDetails, getSeriesDetails, TMDBMovie, TMDBSeries } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SOURCE_LABELS } from "@/services/player";
import { useAuth } from "@/context/AuthContext";
import { upsertWatchEntry } from "@/services/watchHistory";

export default function Player() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const [meta, setMeta] = useState<{ title: string; imdb_id: string; poster?: string; backdrop?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const isMovie = type === "movie";
  const season = params.get("s") ? Number(params.get("s")) : undefined;
  const episode = params.get("e") ? Number(params.get("e")) : undefined;
  const initialSourceIndex = useMemo(() => {
    const src = params.get("src");
    if (!src) return 0;
    const i = SOURCE_LABELS.findIndex((l) => l.startsWith(src));
    return i >= 0 ? i : 0;
  }, [params]);

  useEffect(() => {
    if (!id) return;
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
  }, [id, isMovie, lang]);

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

  return (
    <>
      <SEO title={meta?.title || "Player"} />
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 p-3 bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          {meta?.title && (
            <span className="text-sm font-bold text-white truncate">{meta.title}</span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 z-40 pointer-events-none opacity-25">
          <img src="/logo.png" alt="BNKhub" className="h-8 sm:h-10 w-auto" />
        </div>
        <div className="flex-1 flex items-center justify-center p-0 overflow-hidden">
          <div className="w-full h-full">
            <VideoPlayer
              ref={videoPlayerRef}
              imdb_id={meta?.imdb_id || ""}
              tmdb_id={Number(id)}
              type={isMovie ? "movie" : "tv"}
              season={season}
              episode={episode}
              title={meta?.title}
              initialSourceIndex={initialSourceIndex}
              autoStart={true}
              onPlayStart={(_i, label) => saveHistory(label)}
              onSourceChange={(_i, label) => saveHistory(label)}
              onProgress={(seconds, duration) => {
                const label = SOURCE_LABELS[initialSourceIndex] || "S1";
                saveHistory(label, seconds, duration);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
