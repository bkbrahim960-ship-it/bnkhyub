import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Play, Loader2 } from "lucide-react";
import { ResumeModal } from "./ResumeModal";
import { useAuth } from "@/context/AuthContext";
import { getRecentHistory } from "@/services/watchHistory";

interface Props {
  imdb_id: string;
  tmdb_id: number | string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  initialSourceIndex?: number;
  onSourceChange?: (index: number, label: string) => void;
  onPlayStart?: (index: number, label: string) => void;
  customUrl?: string;
  onProgress?: (seconds: number, duration?: number) => void;
  onCompleted?: () => void;
  autoStart?: boolean;
}

export interface VideoPlayerRef {
  setSubtitle: (url: string) => void;
  startPlayback: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, Props>(({
  imdb_id, tmdb_id, type, season, episode, title, initialSourceIndex = 0,
  onSourceChange, onPlayStart, customUrl, onProgress, autoStart = false,
}, ref) => {
  const [sourceIndex, setSourceIndex] = useState(initialSourceIndex);
  const [loading, setLoading] = useState(true);
  const [playerActive, setPlayerActive] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [historyProgress, setHistoryProgress] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const startedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();

  const cinemaOsUrl = type === "movie"
    ? `https://cinemaos.tech/player/${tmdb_id}?language=ar&theme=c124a0&subtitle=ar&sub=ar&noads=1`
    : `https://cinemaos.tech/player/${tmdb_id}/${season}/${episode}?language=ar&theme=c124a0&subtitle=ar&sub=ar&noads=1`;

  const vaplayerUrl = type === "movie"
    ? `https://vidapi.ru/embed/movie/${imdb_id || tmdb_id}?color=%23C124A0&lang=ar&sub=ar&noads=1`
    : `https://vidapi.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?color=%23C124A0&lang=ar&sub=ar&noads=1`;

  const nhdapiUrl = type === "movie"
    ? `https://nhdapi.com/embed/movie/${tmdb_id}?autonext=true&download=true&primarycolor=C124A0&subtitle=ar`
    : `https://nhdapi.com/embed/tv/${tmdb_id}/${season}/${episode}?autonext=true&download=true&primarycolor=C124A0&subtitle=ar`;

  const sources = customUrl ? [customUrl] : [cinemaOsUrl, vaplayerUrl, nhdapiUrl];
  const src = sources[sourceIndex];

  useImperativeHandle(ref, () => ({
    setSubtitle: () => {},
    startPlayback: () => setPlayerActive(true),
  }));

  const activatePlayer = () => {
    setPlayerActive(true);
    setLoading(true);
  };

  const switchSource = (idx: number) => {
    if (idx === sourceIndex) return;
    setSourceIndex(idx);
    setLoading(true);
    if (onSourceChange) onSourceChange(idx, "");
  };

  useEffect(() => {
    if (autoStart) setPlayerActive(true);
  }, [autoStart]);

  useEffect(() => {
    if (!playerActive) return;
    if (onPlayStart && !startedRef.current) {
      onPlayStart(sourceIndex, "");
      startedRef.current = true;
    }
  }, [playerActive, sourceIndex, onPlayStart]);

  useEffect(() => {
    if (!user || hasResumed) return;
    (async () => {
      try {
        const history = await getRecentHistory(user.id);
        const entry = history.find(h =>
          h.tmdb_id === (typeof tmdb_id === 'string' ? parseInt(tmdb_id) : tmdb_id) &&
          h.media_type === type &&
          (type === 'movie' || (h.season_number === season && h.episode_number === episode))
        );
        if (entry && entry.progress_seconds > 10) {
          setHistoryProgress(entry.progress_seconds);
          setResumeModalOpen(true);
        }
      } catch {}
    })();
  }, [user, tmdb_id, type, season, episode, hasResumed]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <ResumeModal
        open={resumeModalOpen}
        progressSeconds={historyProgress}
        onClose={() => setResumeModalOpen(false)}
        onResume={() => { setHasResumed(true); setResumeModalOpen(false); }}
        onRestart={() => { setHasResumed(true); setResumeModalOpen(false); }}
      />

      <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl">
        {!playerActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/30 via-black/60 to-black z-30">
            <button
              onClick={activatePlayer}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-[0_0_60px_hsl(var(--accent)/0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-12 h-12 fill-current ml-1.5" />
            </button>
          </div>
        )}

        {playerActive && (
          <iframe
            ref={iframeRef}
            src={src}
            title="BNKHUB"
            allow="fullscreen; encrypted-media; gyroscope"
            allowFullScreen
            frameBorder="0"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setLoading(false)}
            className="absolute inset-0 w-full h-full border-0"
          />
        )}

        {playerActive && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 pointer-events-none">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
        )}
      </div>

      {!customUrl && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {sources.map((_, idx) => (
            <button
              key={idx}
              onClick={() => switchSource(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                idx === sourceIndex
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-elevated/50 border border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {`S${idx + 1}`}
              {idx === 2 && (
                <a
                  href={nhdapiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2 text-accent hover:text-accent-light"
                  title="تحميل"
                >
                  ⬇
                </a>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
