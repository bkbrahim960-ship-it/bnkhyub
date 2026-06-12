import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Play, Loader2, Download, ChevronDown, Check } from "lucide-react";
import { ResumeModal } from "./ResumeModal";
import { useAuth } from "@/context/AuthContext";
import { getRecentHistory } from "@/services/watchHistory";
import { SOURCE_LABELS } from "@/services/player";

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

const LABELS = [
  "🎬 CinemaOS (بدون إعلانات)",
  "vaplayer",
  "📥 nhdapi (تحميل مباشر)",
];

export const VideoPlayer = forwardRef<VideoPlayerRef, Props>(({
  imdb_id, tmdb_id, type, season, episode, title, initialSourceIndex = 0,
  onSourceChange, onPlayStart, customUrl, onProgress, autoStart = false,
}, ref) => {
  const [sourceIndex, setSourceIndex] = useState(initialSourceIndex);
  const [loading, setLoading] = useState(true);
  const [playerActive, setPlayerActive] = useState(!!customUrl || autoStart);
  const [showSources, setShowSources] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [historyProgress, setHistoryProgress] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const startedRef = useRef(false);
  const { user } = useAuth();

  // Build URLs
  const cinemaOsParams = "language=ar&theme=c124a0&subtitle=ar&sub=ar&noads=1";
  const cinemaOsUrl = type === "movie"
    ? `https://cinemaos.tech/player/${tmdb_id}?${cinemaOsParams}`
    : `https://cinemaos.tech/player/${tmdb_id}/${season}/${episode}?${cinemaOsParams}`;

  const vaplayerTheme = new URLSearchParams({
    color: "%23C124A0", primaryColor: "%23C124A0", lang: "ar", sub: "ar",
    subtitle: "ar", noads: "1", ads: "0", autoplay: "1",
  }).toString();
  const vaplayerUrl = type === "movie"
    ? `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?${vaplayerTheme}`
    : `https://vaplayer.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?${vaplayerTheme}`;

  const nhdapiUrl = type === "movie"
    ? `https://nhdapi.com/embed/movie/${tmdb_id}?autonext=true&download=true&primarycolor=C124A0&subtitle=ar`
    : `https://nhdapi.com/embed/tv/${tmdb_id}/${season}/${episode}?autonext=true&download=true&primarycolor=C124A0&subtitle=ar`;

  const allSources = customUrl ? [customUrl] : [cinemaOsUrl, vaplayerUrl, nhdapiUrl];
  const src = allSources[sourceIndex];

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
      onPlayStart(sourceIndex, LABELS[sourceIndex] || SOURCE_LABELS[sourceIndex]);
      startedRef.current = true;
    }
  }, [playerActive, sourceIndex, onPlayStart]);

  const switchSource = (idx: number) => {
    if (idx === sourceIndex) return;
    setSourceIndex(idx);
    setLoading(true);
    setShowSources(false);
    if (onSourceChange) onSourceChange(idx, LABELS[idx] || SOURCE_LABELS[idx]);
  };

  // Resume
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

      <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl group">
        {playerActive && sourceIndex === 0 && (
          <div className="absolute top-4 right-5 z-50 pointer-events-none select-none opacity-40">
            <img src="/logo.png" alt="BNKhub" className="h-8 md:h-12 w-auto object-contain" />
          </div>
        )}

        {/* Source overlay buttons (top-left) */}
        {playerActive && !customUrl && (
          <div className="absolute top-4 left-4 z-50 flex gap-2">
            {/* Source selector */}
            <div className="relative">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-bold text-white/80 hover:text-white border border-white/10 hover:border-accent/50 transition-all"
              >
                {LABELS[sourceIndex] || `S${sourceIndex + 1}`}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showSources && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSources(false)} />
                  <div className="absolute top-full left-0 mt-1 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden min-w-[180px]">
                    {allSources.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => switchSource(idx)}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left transition-all hover:bg-white/5 ${
                          idx === sourceIndex ? "text-accent bg-accent/10" : "text-white/60"
                        }`}
                      >
                        <span>{LABELS[idx] || `S${idx + 1}`}</span>
                        {idx === sourceIndex && <Check className="w-3 h-3 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Download button (nhdapi) */}
            <button
              onClick={() => window.open(nhdapiUrl, "_blank")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-bold text-white/80 hover:text-accent border border-white/10 hover:border-accent/50 transition-all"
              title="تحميل مباشر"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Play overlay */}
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

        {/* Iframe */}
        {playerActive && (
          <iframe
            key={`${sourceIndex}-${src}`}
            src={src}
            title="BNKHUB"
            allow="fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; web-share"
            allowFullScreen
            frameBorder="0"
            scrolling="no"
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

      {/* Source tabs below player */}
      {playerActive && !customUrl && (
        <div className="flex flex-wrap gap-2 mt-4">
          {allSources.map((_, idx) => (
            <button
              key={idx}
              onClick={() => switchSource(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                idx === sourceIndex
                  ? "bg-accent text-accent-foreground shadow-glow-sm"
                  : "bg-surface-elevated/50 border border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {LABELS[idx] || `S${idx + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
