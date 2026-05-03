/**
 * BNKhub — Lecteur vidéo avec 10 sources.
 * ⚠️ Changement de source UNIQUEMENT manuel (pas de fallback auto).
 * Le timeout de 5s n'a été conservé que pour marquer visuellement une source
 * comme potentiellement indisponible, mais il NE bascule plus automatiquement.
 */
import { useEffect, useRef, useState, useMemo } from "react";
import { getMovieSources, getTVSources, SOURCE_LABELS } from "@/services/player";
import { AdsNoticeModal, hasSeenAdsNotice } from "./AdsNoticeModal";
import { ResumeModal } from "./ResumeModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getRecentHistory, updateWatchHistory } from "@/services/watchHistory";
import { Loader2, AlertCircle, RotateCw, Play, Settings, Lock, Unlock, FastForward, Captions, Monitor, Gauge, PictureInPicture as PipIcon, Maximize, Search, Download, ExternalLink } from "lucide-react";
import { searchSubtitles, getDownloadUrl, SubtitleResult } from "@/services/opensubtitles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Hls from "hls.js";
import { PlayerSourceSelector } from "./PlayerSourceSelector";

interface Props {
  imdb_id: string;
  tmdb_id: number | string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
  initialSourceIndex?: number;
  onSourceChange?: (index: number) => void;
  onPlayStart?: () => void;
  customUrl?: string;
}

const safeGetAccentHex = () => {
  if (typeof window === "undefined") return "#D4AF37";
  const style = getComputedStyle(document.documentElement);
  const color = style.getPropertyValue("--accent").trim();
  if (color.startsWith("#")) return color;
  return "#D4AF37";
};

export const VideoPlayer = ({
  imdb_id,
  tmdb_id,
  type,
  season,
  episode,
  title,
  initialSourceIndex = 0,
  onSourceChange,
  onPlayStart,
  customUrl,
}: Props) => {
  const { t } = useLanguage();
  const [sourceIndex, setSourceIndex] = useState(initialSourceIndex);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState<boolean[]>(Array(50).fill(false));
  const [adsOpen, setAdsOpen] = useState(!hasSeenAdsNotice());
  const [playerActive, setPlayerActive] = useState(hasSeenAdsNotice());
  const startedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);

  const { user } = useAuth();
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [historyProgress, setHistoryProgress] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

    if (playerActive) {
      // Auto-fetch disabled as requested to revert to original state
    }
  }, [imdb_id, playerActive]);

  // Check for resume progress
  useEffect(() => {
    if (!user || startedRef.current || hasResumed) return;
    const checkHistory = async () => {
      try {
        const history = await getRecentHistory(user.id, 50);
        const currentEntry = history.find(e => 
          e.tmdb_id === Number(tmdb_id) && e.media_type === type && 
          (!season || e.season_number === season) && (!episode || e.episode_number === episode)
        );
        if (currentEntry && currentEntry.progress_seconds > 60) {
          setHistoryProgress(currentEntry.progress_seconds);
          setResumeModalOpen(true);
        }
      } catch (err) {
        console.error("Failed to check history:", err);
      }
    };
    checkHistory();
  }, [user, tmdb_id, type, season, episode, hasResumed]);

  const baseSources = useMemo(() => 
    type === "movie"
      ? getMovieSources(imdb_id || "", tmdb_id)
      : getTVSources(imdb_id || "", tmdb_id, season ?? 1, episode ?? 1)
  , [imdb_id, tmdb_id, type, season, episode]);

  const sources = customUrl ? [customUrl] : baseSources;
  const allLabels = customUrl ? ["Source Directe"] : SOURCE_LABELS;

  useEffect(() => {
    if (!playerActive) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 15000);
    return () => clearTimeout(timer);
  }, [sourceIndex, playerActive, imdb_id, tmdb_id, season, episode]);

  const handleLoad = () => setLoading(false);

  const handleStartPlay = () => {
    setAdsOpen(false);
    setPlayerActive(true);
    if (onPlayStart) onPlayStart();
  };

  return (
    <div className="w-full" ref={containerRef}>
      <AdsNoticeModal open={adsOpen} onAccept={handleStartPlay} onClose={() => setAdsOpen(false)} />

      {title && <h2 className="font-display text-xl md:text-2xl text-accent mb-3 px-1">{title}</h2>}

      <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/player transition-all duration-500 ${isWebFullscreen ? 'fixed inset-0 z-[1000] rounded-none !aspect-auto h-screen' : ''}`}>
        
        {/* Player Content */}
        {playerActive && (
          <div className="absolute inset-0 w-full h-full">
            {/* Native HLS / MP4 */}
            {sources[sourceIndex]?.includes(".m3u8") ? (
              <video 
                ref={videoRef}
                controls
                playsInline
                className="w-full h-full object-contain"
                onLoadedData={handleLoad}
              >
                <source src={sources[sourceIndex]} type="application/x-mpegURL" />
              </video>
            ) : (
              <iframe
                key={sourceIndex}
                src={sources[sourceIndex]}
                title="BNKhub player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={handleLoad}
                className="w-full h-full border-0"
              />
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {playerActive && loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
            <p className="text-sm text-white/50">{t("player_loading")}</p>
          </div>
        )}

        {/* Lock Overlay (Simplified) */}
        {isLocked && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <button onClick={() => setIsLocked(false)} className="p-4 rounded-full bg-accent text-accent-foreground"><Unlock className="w-6 h-6" /></button>
          </div>
        )}
      </div>

      {/* Source Selector */}
      <PlayerSourceSelector 
        sources={sources}
        sourceIndex={sourceIndex}
        onSourceChange={(idx) => {
          setSourceIndex(idx);
          if (onSourceChange) onSourceChange(idx);
        }}
        labels={allLabels}
      />

      <ResumeModal 
        open={resumeModalOpen} 
        progressSeconds={historyProgress} 
        onClose={() => setResumeModalOpen(false)} 
        onRestart={() => { setResumeModalOpen(false); setHasResumed(true); }} 
        onResume={() => {
          setResumeModalOpen(false);
          setHasResumed(true);
          if (videoRef.current) videoRef.current.currentTime = historyProgress;
        }} 
      />

    </div>
  );
};
