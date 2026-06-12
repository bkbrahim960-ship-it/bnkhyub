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
  tmdb_id, type, season, episode, title, customUrl, onPlayStart, autoStart = false,
}, ref) => {
  const [playerActive, setPlayerActive] = useState(!!customUrl || autoStart);
  const [loading, setLoading] = useState(true);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [historyProgress, setHistoryProgress] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const startedRef = useRef(false);
  const { user } = useAuth();

  const cinemaOsParams = "language=ar&theme=c124a0&subtitle=ar&sub=ar&noads=1";
  const cinemaOsUrl = type === "movie"
    ? `https://cinemaos.tech/player/${tmdb_id}?${cinemaOsParams}`
    : `https://cinemaos.tech/player/${tmdb_id}/${season}/${episode}?${cinemaOsParams}`;

  const src = customUrl || cinemaOsUrl;

  useImperativeHandle(ref, () => ({
    setSubtitle: () => {},
    startPlayback: () => setPlayerActive(true),
  }));

  useEffect(() => {
    if (autoStart) setPlayerActive(true);
  }, [autoStart]);

  useEffect(() => {
    if (!playerActive) return;
    setLoading(true);
    if (onPlayStart && !startedRef.current) {
      onPlayStart(0, "CinemaOS");
      startedRef.current = true;
    }
  }, [playerActive, onPlayStart]);

  // Resume modal
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
        {playerActive && (
          <div className="absolute top-4 right-5 z-50 pointer-events-none select-none opacity-40">
            <img src="/logo.png" alt="BNKhub" className="h-8 md:h-12 w-auto object-contain" />
          </div>
        )}

        {!playerActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/30 via-black/60 to-black z-30">
            <button
              onClick={() => setPlayerActive(true)}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-[0_0_60px_hsl(var(--accent)/0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-12 h-12 fill-current ml-1.5" />
            </button>
          </div>
        )}

        {playerActive && (
          <iframe
            key={src}
            src={src}
            title="BNKHUB"
            allow="fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
            allowFullScreen
            frameBorder="0"
            scrolling="no"
            sandbox="allow-same-origin allow-scripts allow-forms"
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
    </div>
  );
});
