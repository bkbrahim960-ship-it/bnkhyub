import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Play, Loader2, Download, Monitor, X } from "lucide-react";

import { ResumeModal } from "./ResumeModal";
import { useAuth } from "@/context/AuthContext";
import { getRecentHistory } from "@/services/watchHistory";

interface DownloadLink {
  url: string;
  quality: string;
  size: string;
  type: string;
  active: boolean;
}

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
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloads, setDownloads] = useState<DownloadLink[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const startedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();

  const cinemaOsUrl = type === "movie"
    ? `https://cinemaos.tech/player/${tmdb_id}?language=ar&theme=c124a0&subtitle=ar&sub=ar&noads=1`
    : `https://cinemaos.tech/player/${tmdb_id}/${season}/${episode}?language=ar&theme=c124a0&subtitle=ar&sub=ar&noads=1`;

  const vaplayerUrl = type === "movie"
    ? `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?color=%23C124A0&primaryColor=%23C124A0&theme=dark&lang=ar&sub=ar&subtitle=ar&autoplay=1`
    : `https://vaplayer.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?color=%23C124A0&primaryColor=%23C124A0&theme=dark&lang=ar&sub=ar&subtitle=ar&autoplay=1`;

  const nhdapiUrl = type === "movie"
    ? `https://nhdapi.com/embed/movie/${tmdb_id}?autonext=true&download=true&primarycolor=C124A0&subtitle=ar`
    : `https://nhdapi.com/embed/tv/${tmdb_id}/${season}/${episode}?autonext=true&download=true&primarycolor=C124A0&subtitle=ar`;

  const downloadUrl = type === "movie"
    ? `https://missourimonster-vyla.hf.space/api/downloads/movie/${tmdb_id}`
    : `https://missourimonster-vyla.hf.space/api/downloads/tv/${tmdb_id}/${season}/${episode}`;

  const sources = customUrl ? [customUrl] : [cinemaOsUrl, vaplayerUrl, nhdapiUrl];

  useImperativeHandle(ref, () => ({
    setSubtitle: () => {},
    startPlayback: () => setPlayerActive(true),
  }));

  useEffect(() => {
    if (autoStart) setPlayerActive(true);
  }, [autoStart]);

  useEffect(() => {
    if (!playerActive) return;
    if (onPlayStart && !startedRef.current) {
      onPlayStart(sourceIndex, `S${sourceIndex + 1}`);
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

  const activatePlayer = () => {
    setPlayerActive(true);
    setLoading(true);
  };

  const switchSource = (idx: number) => {
    if (idx === sourceIndex) return;
    setSourceIndex(idx);
    setLoading(true);
    if (onSourceChange) onSourceChange(idx, `S${idx + 1}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <ResumeModal
        open={resumeModalOpen}
        progressSeconds={historyProgress}
        onClose={() => setResumeModalOpen(false)}
        onResume={() => { setHasResumed(true); setResumeModalOpen(false); }}
        onRestart={() => { setHasResumed(true); setResumeModalOpen(false); }}
      />

      {!playerActive && (
        <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-gradient-to-b from-black/30 via-black/60 to-black">
          <button
            onClick={activatePlayer}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-[0_0_60px_hsl(var(--accent)/0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-12 h-12 fill-current ml-1.5" />
          </button>
        </div>
      )}

      {playerActive && (
        <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl">
          <iframe
            ref={iframeRef}
            src={sources[sourceIndex]}
            title="BNKHUB"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-fullscreen"
            onLoad={() => setLoading(false)}
            className="absolute inset-0 w-full h-full border-0"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 pointer-events-none">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
          )}
        </div>
      )}

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
            </button>
          ))}
          <button
            onClick={async () => {
              setDownloadModal(true);
              setDownloading(true);
              setDownloads([]);
              setDownloadError("");
              try {
                const res = await fetch(downloadUrl);
                if (!res.ok) {
                  setDownloadError("فشل الاتصال بالخادم");
                  setDownloading(false);
                  return;
                }
                const text = await res.text();
                const data = JSON.parse(text);
                setDownloads(data.downloads || []);
                if (!data.downloads || data.downloads.length === 0) {
                  setDownloadError("");
                }
              } catch (e) {
                setDownloadError("تعذر جلب روابط التحميل");
              }
              setDownloading(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-surface-elevated/50 border border-border text-muted-foreground hover:border-accent/50 hover:text-accent transition-all"
            title="تحميل"
          >
            <Download className="w-3.5 h-3.5" />
            تحميل
          </button>
        </div>
      )}

      {downloadModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setDownloadModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4">
            <div className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-sm font-bold">روابط التحميل</h3>
                <button onClick={() => setDownloadModal(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {downloading && (
                  <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ البحث عن روابط التحميل…
                  </div>
                )}
                {!downloading && downloadError && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {downloadError}
                  </div>
                )}
                {!downloading && !downloadError && downloads.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    لا توجد روابط تحميل متاحة لهذا المحتوى
                  </div>
                )}
                {!downloading && downloads.map((dl, i) => (
                  <a
                    key={i}
                    href={dl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/50 border border-border hover:border-accent/50 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{dl.quality || dl.type || "مصدر"}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {dl.size} · {dl.type}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                  </a>
                ))}
                {!downloading && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] text-muted-foreground hover:text-accent transition-colors border border-dashed border-border hover:border-accent/50"
                  >
                    <Download className="w-3 h-3" />
                    فتح صفحة التحميل مباشرة
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});
