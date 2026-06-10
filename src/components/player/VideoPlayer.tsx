/**
 * BNKhub — Lecteur vidéo avec 10 sources.
 * ⚠️ Changement de source UNIQUEMENT manuel (pas de fallback auto).
 * Le timeout de 5s n'a été conservé que pour marquer visuellement une source
 * comme potentiellement indisponible, mais il NE bascule plus automatiquement.
 */
import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { getMovieSources, getTVSources, SOURCE_LABELS, getInternalBackendSources, fetchCineProSources, CineProSource } from "@/services/player";
import { AdsNoticeModal, hasSeenAdsNotice } from "./AdsNoticeModal";
import { ResumeModal } from "./ResumeModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getRecentHistory } from "@/services/watchHistory";
import { Loader2, AlertCircle, RotateCw, ShieldCheck, Play, Pause, Settings, Lock, Unlock, FastForward, Languages, Captions, Monitor, Gauge, PictureInPicture as PipIcon, Search, Download, ExternalLink, X, Check, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { searchSubtitles, getDownloadUrl, SubtitleResult } from "@/services/opensubtitles";
import { searchWyzieSubtitles, WyzieSubtitle } from "@/services/wyzie";
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
  /** Index initial de source (pour reprise depuis historique) */
  initialSourceIndex?: number;
  /** Callback à chaque changement manuel de source (pour synchro Cloud) */
  onSourceChange?: (index: number, label: string) => void;
  /** Callback au lancement du lecteur (1re lecture) — pour créer l'entrée historique */
  onPlayStart?: (index: number, label: string) => void;
  /** URL directe pour les contenus personnalisés */
  customUrl?: string;
  /** Callback pour mettre à jour la progression dans l'historique */
  onProgress?: (seconds: number, duration?: number) => void;
  /** Callback quand la vidéo est terminée (pour auto-play suivant) */
  onCompleted?: () => void;
  /** Démarre automatiquement la lecture (TV / desktop) */
  autoStart?: boolean;
}

export interface VideoPlayerRef {
  setSubtitle: (url: string) => void;
  startPlayback: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, Props>(({
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
  onProgress,
  onCompleted,
  autoStart = false,
}, ref) => {
  const { t, lang } = useLanguage();
  const [sourceIndex, setSourceIndex] = useState(initialSourceIndex);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState<boolean[]>(Array(50).fill(false));
  const [adsOpen, setAdsOpen] = useState(!customUrl && !hasSeenAdsNotice());
  const [playerActive, setPlayerActive] = useState(customUrl || hasSeenAdsNotice());
  const timeoutRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Advanced Player States
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"speed" | "quality" | "audio" | "subtitle">("quality");
  const [currentAudio, setCurrentAudio] = useState(-1);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [isPipAvailable] = useState(() => typeof document !== 'undefined' && 'pictureInPictureEnabled' in document);

  // External Subtitles
  const [externalSubs, setExternalSubs] = useState<SubtitleResult[]>([]);
  const [wyzieSubs, setWyzieSubs] = useState<WyzieSubtitle[]>([]);
  const [ytsSubs, setYtsSubs] = useState<any[]>([]);
  const [subsceneResults, setSubsceneResults] = useState<any[]>([]);
  const [isSearchingSubs, setIsSearchingSubs] = useState(false);
  const [appliedExternalSub, setAppliedExternalSub] = useState<string | null>(null);

  // Internal Backend Sources
  const [internalSources, setInternalSources] = useState<any[]>([]);

  // CinePro Core sources
  const [cineproSources, setCineproSources] = useState<CineProSource[]>([]);
  const [cineproSubs, setCineproSubs] = useState<{ url: string; format: string; label: string }[]>([]);

  // Custom Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);


  const startPlayback = useCallback(() => {
    setAdsOpen(false);
    setPlayerActive(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current as HTMLElement & { webkitRequestFullscreen?: () => void };
    const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => setIsFullscreen(true));
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else setIsFullscreen(true);
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
  }, []);

  const handleProgressChange = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Auto-hide controls timeout
  const controlsTimeoutRef = useRef<number | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showSettings) setControlsVisible(false);
    }, 3000);
  }, [isPlaying, showSettings]);
  useEffect(() => {
    return () => { if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current); };
  }, []);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    setSubtitle: (url: string) => {
      setAppliedExternalSub(url);
      setPlayerActive(true);
    },
    startPlayback,
  }));

  // Resume Logic
  const { user } = useAuth();
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [historyProgress, setHistoryProgress] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const lastSaveTime = useRef(0);

  // Save progress using existing watchHistory service
  const saveProgress = async (seconds: number, duration?: number) => {
    if (!user) return;

    try {
      const { upsertWatchEntry } = await import("@/services/watchHistory");
      await upsertWatchEntry(user.id, {
        tmdb_id: typeof tmdb_id === 'string' ? parseInt(tmdb_id) : tmdb_id,
        media_type: type,
        season_number: season,
        episode_number: episode,
        title: title || "",
        progress_seconds: seconds,
        duration_seconds: duration
      });
    } catch (err) {
      console.error("Progress save error:", err);
    }
  };

  // Apply CinePro subtitles when a CinePro source is selected
  useEffect(() => {
    if (sourceIndex >= 3) {
      const cineproIdx = sourceIndex - 3;
      if (cineproIdx < cineproSubs.length && cineproSubs[cineproIdx]) {
        setAppliedExternalSub(cineproSubs[cineproIdx].url);
      }
    }
  }, [sourceIndex, cineproSubs]);

  // Auto-fetch Arabic subtitles on mount
  useEffect(() => {
    const autoFetchSubs = async () => {
      if (!imdb_id || appliedExternalSub) return;
      try {
        const results = await searchSubtitles(imdb_id);
        setExternalSubs(results);
        
        if (results.length > 0) {
          const url = await getDownloadUrl(results[0].attributes.file_id);
          if (url) {
            setAppliedExternalSub(url);
          }
        }

        // Also fetch from Wyzie
        const wyzieResults = await searchWyzieSubtitles(tmdb_id, imdb_id);
        setWyzieSubs(wyzieResults);
        
        // If no OpenSubtitles but we have Wyzie, apply first Wyzie
        if (results.length === 0 && wyzieResults.length > 0) {
          setAppliedExternalSub(wyzieResults[0].url);
        }
      } catch (err) {
        console.error("Auto-sub error:", err);
      }
    };
    autoFetchSubs();
  }, [imdb_id]);

  // Fetch History for Resume
  useEffect(() => {
    if (!user || hasResumed) return;
    
    const fetchHistory = async () => {
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
      } catch (err) {
        console.error("History fetch error:", err);
      }
    };
    
    fetchHistory();
  }, [user, tmdb_id, type, season, episode]);

  // Handle postMessage from VidAPI (vaplayer.ru)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'PLAYER_EVENT') return;
      
      const { player_status, player_progress, player_duration } = event.data.data;
      
      if (player_status === 'playing') {
        if (onProgress && player_progress > 0) {
          onProgress(player_progress, player_duration);
        }
      } else if (player_status === 'completed') {
        if (onCompleted) {
          onCompleted();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgress, onCompleted]);

  // Cleanup hls.js + video on unmount to prevent background audio
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, []);

  const defaultSources = type === "movie" 
    ? getMovieSources(imdb_id, tmdb_id, hasResumed ? historyProgress : 0) 
    : getTVSources(imdb_id, tmdb_id, season!, episode!, hasResumed ? historyProgress : 0);

  const sources = customUrl ? [customUrl] : defaultSources;

  // CinemaOS URL builder (Arabic language & subtitles, theme matching site accent, no ads)
  const cinemaOsParams = "language=ar&theme=c124a0&subtitle=ar&sub=ar&default_sub=ar&cc_lang_pref=ar";
  const cinemaOsUrl = type === "movie"
    ? `https://cinemaos.tech/player/${tmdb_id}?${cinemaOsParams}`
    : `https://cinemaos.tech/player/${tmdb_id}/${season}/${episode}?${cinemaOsParams}`;

  // nhdapi.com URL builder (Custom theme, Arabic options, download enabled)
  const nhdapiParams = new URLSearchParams({
    autonext: "true",
    download: "true", // Enable download control
    primarycolor: "C124A0", // Match site accent color
    secondarycolor: "9F2BBF", // Lighter shade of accent
    iconcolor: "FFFFFF",
    glasscolor: "000000",
    glassopacity: "65",
    glassblur: "20",
    fontcolor: "FFFFFF",
    subtitle: "ar", // Arabic subtitles default
  });
  const nhdapiUrl = type === "movie"
    ? `https://nhdapi.com/embed/movie/${tmdb_id}?${nhdapiParams.toString()}`
    : `https://nhdapi.com/embed/tv/${tmdb_id}/${season}/${episode}?${nhdapiParams.toString()}`;

  // CinePro URLs — direct hls/mp4 sources
  const cineproUrls = cineproSources.map((s) => s.url);

  // For customUrl (Kabyle), only use customUrl
  const allSources = customUrl
    ? [customUrl]
    : [cinemaOsUrl, ...sources.slice(0, 1), nhdapiUrl, ...cineproUrls];

  useEffect(() => {
    const fetchInternal = async () => {
      console.log("Fetching internal sources for:", tmdb_id);
      const results = await getInternalBackendSources(type, String(tmdb_id), title, season, episode);
      console.log("Internal sources found:", results);
      if (results && results.length > 0) {
        setInternalSources(results);
      } else {
        setInternalSources([]);
      }
    };
    fetchInternal();
  }, [type, tmdb_id, season, episode]);

  // BNKhub Private Engine (safe, non-blocking)
  useEffect(() => {
    const tryResolve = async () => {
      try {
        const { resolveProductionStream } = await import("@/services/resolver");
        const result = await resolveProductionStream(String(tmdb_id), type, season, episode);
        if (result.success && result.url) {
          // Append as an additional internal source - does NOT touch existing sources
          setInternalSources(prev => [
            ...prev, 
            { url: result.url, provider: "BNKhub Private Engine", type: result.type || "iframe" }
          ]);
          console.log("💎 BNKhub Private Engine: Source added");
        }
      } catch {
        // Silent fail - player works exactly as before
      }
    };
    if (tmdb_id) tryResolve();
  }, [tmdb_id, type, season, episode]);

  // Fetch CinePro Core sources and auto-select when ready
  useEffect(() => {
    if (!tmdb_id || customUrl) return;
    fetchCineProSources(type, tmdb_id, season, episode).then((data) => {
      if (data && data.sources.length > 0) {
        setCineproSources(data.sources);
        setCineproSubs(data.subtitles || []);
        // Auto-select first CinePro source
        setSourceIndex(3);
        setLoading(true);
      }
    });
  }, [tmdb_id, type, season, episode, customUrl]);

  const allLabels = Array(50).fill(null);
  allLabels[0] = "🎬 CinemaOS (بدون إعلانات)";
  allLabels[1] = customUrl ? "Serveur Kabyle" : "BNKhub serveur";
  allLabels[2] = "📥 nhdapi (تحميل مباشر)";
  // CinePro Core sources
  cineproSources.forEach((s, i) => {
    allLabels[3 + i] = `${s.provider?.name || "CinePro"} (${s.quality})`;
  });

  const handleLoad = () => {
    setLoading(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const retry = () => {
    setLoading(true);
    const newSlow = [...slow];
    newSlow[sourceIndex] = false;
    setSlow(newSlow);
    
    const current = allSources[sourceIndex];
    setSourceIndex(-1);
    setTimeout(() => setSourceIndex(Math.max(0, allSources.indexOf(current))), 10);
  };

  const selectSource = (index: number) => {
    if (index === sourceIndex) return;
    setLoading(true);
    setSourceIndex(index);
    if (onSourceChange) {
      onSourceChange(index, `S${index + 1} BNKHUB`);
    }
  };

  useEffect(() => {
    if (!autoStart) return;
    setAdsOpen(false);
    setPlayerActive(true);
  }, [autoStart]);

  useEffect(() => {
    if (!playerActive) return;

    setLoading(true);
    const currentIdx = sourceIndex;
    
    timeoutRef.current = window.setTimeout(() => {
      const newSlow = [...slow];
      newSlow[currentIdx] = true;
      setSlow(newSlow);
      setLoading(false);
    }, 8000);

    if (onPlayStart && !startedRef.current) {
      onPlayStart(sourceIndex, allLabels[sourceIndex] || SOURCE_LABELS[sourceIndex]);
      startedRef.current = true;
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [sourceIndex, playerActive]);

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <AdsNoticeModal open={adsOpen} onAccept={() => {
        setAdsOpen(false);
        setPlayerActive(true);
      }} />

      <ResumeModal 
        open={resumeModalOpen}
        progressSeconds={historyProgress}
        onClose={() => setResumeModalOpen(false)}
        onResume={() => {
          setHasResumed(true);
          setResumeModalOpen(false);
          if (videoRef.current) {
            videoRef.current.currentTime = historyProgress;
            videoRef.current.play();
          }
        }}
        onRestart={() => {
          setHasResumed(true);
          setResumeModalOpen(false);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
          }
        }}
      />

      <div 
        ref={containerRef} 
        className={`relative w-full ${allSources[sourceIndex]?.includes("drive.google.com") ? "aspect-square sm:aspect-[4/3] md:aspect-[16/10] rounded-lg" : "aspect-video rounded-2xl"} bg-black overflow-hidden border border-white/10 shadow-2xl group/player transition-all duration-500`}
      >
        
        {/* Permanent Brand Watermark */}
        {playerActive && sourceIndex === 0 && (
          <div className="absolute top-4 right-5 z-50 pointer-events-none select-none opacity-40">
            <div className="flex flex-col items-end">
              <img src="/logo.png" alt="BNKhub" className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_2px_10px_rgba(var(--accent-rgb),0.4)]" />
              <div className="h-0.5 w-full bg-accent/40 rounded-full mt-1" />
            </div>
          </div>
        )}



        {!playerActive && !customUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/30 via-black/60 to-black z-30 p-12 text-center overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="relative z-10 animate-fade-in">
              <button
                type="button"
                data-tv-nav="primary"
                tabIndex={0}
                onClick={() => { setAdsOpen(false); setPlayerActive(true); }}
                className="group focus:outline-none focus-visible:ring-4 focus-visible:ring-accent rounded-full"
              >
                <div className="absolute inset-[-20px] rounded-full bg-accent/5 blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
                <div className="absolute inset-[-10px] rounded-full border border-accent/20 group-hover:border-accent/40 transition-all duration-500" />
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-black shadow-[0_0_60px_hsl(var(--accent)/0.5)] group-hover:shadow-[0_0_80px_hsl(var(--accent)/0.7)] hover:scale-105 active:scale-95 transition-all duration-500">
                  <Play className="w-12 h-12 fill-current ml-1.5" />
                </div>
              </button>
              <div className="mt-8 space-y-3">
                <h2 className="text-3xl md:text-4xl font-anton uppercase tracking-[0.08em] text-white drop-shadow-xl">
                  {title || (type === "movie" ? "Watch Movie" : "Watch Episode")}
                </h2>
                <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="px-3 py-1.5 rounded-full bg-accent/20 text-accent border border-accent/30">ULTRA HD</span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/10">MULTI-SERVER</span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/10">NO LIMITS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Element for HLS / Direct — only render when active to prevent background audio */}
        {playerActive && (() => {
          const cineproIdx = sourceIndex >= 3 ? sourceIndex - 3 : -1;
          const cineproSrc = cineproIdx >= 0 && cineproIdx < cineproSources.length ? cineproSources[cineproIdx] : null;
          return allSources[sourceIndex]?.includes(".m3u8") || 
            allSources[sourceIndex]?.includes(".mp4") ||
            (cineproSrc && ["hls", "mp4", "dash", "http", "mkv", "webm"].includes(cineproSrc.type));
        })() && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            onLoadStart={() => setLoading(true)}
            onPlaying={() => { setLoading(false); setHasResumed(true); setIsPlaying(true); }}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setLoading(true)}
            onTimeUpdate={(e) => {
              const video = e.target as HTMLVideoElement;
              setCurrentTime(video.currentTime);
              setDuration(video.duration || 0);
              if (video.currentTime > 0 && Math.abs(video.currentTime - lastSaveTime.current) >= 10) {
                lastSaveTime.current = video.currentTime;
                saveProgress(video.currentTime, video.duration);
              }
            }}
            onLoadedMetadata={(e) => {
              setDuration((e.target as HTMLVideoElement).duration || 0);
            }}
            onVolumeChange={(e) => {
              setVolume((e.target as HTMLVideoElement).volume);
            }}
            onEnded={() => {}}
            onMouseEnter={showControlsTemporarily}
            onMouseLeave={() => { if (isPlaying) setControlsVisible(false); }}
          >
            {appliedExternalSub && <track kind="subtitles" src={appliedExternalSub} srcLang="ar" label="Arabic" default />}
          </video>
        )}

        {/* YouTube Iframe */}
        {playerActive && (() => {
          if (allSources[sourceIndex]?.includes("youtube.com") || allSources[sourceIndex]?.includes("youtu.be")) {
            const cineproIdx = sourceIndex >= 3 ? sourceIndex - 3 : -1;
            const cineproSrc = cineproIdx >= 0 && cineproIdx < cineproSources.length ? cineproSources[cineproIdx] : null;
            return !(cineproSrc && ["hls", "mp4", "dash", "http", "mkv", "webm"].includes(cineproSrc.type));
          }
          return false;
        })() && (
          <iframe
            key={`yt-${sourceIndex}`}
            src={`https://www.youtube.com/embed/${
              allSources[sourceIndex].includes("v=") 
                ? allSources[sourceIndex].split("v=")[1].split("&")[0] 
                : allSources[sourceIndex].split("/").pop()
            }?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
            title="YouTube Video"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={handleLoad}
            className="absolute inset-0 w-full h-full border-0"
          />
        )}

        {/* Standard Iframe */}
        {playerActive && (() => {
          const isM3u8 = allSources[sourceIndex]?.includes(".m3u8");
          const isMp4 = allSources[sourceIndex]?.includes(".mp4");
          const isYt = allSources[sourceIndex]?.includes("youtube.com") || allSources[sourceIndex]?.includes("youtu.be");
          const cineproIdx = sourceIndex >= 3 ? sourceIndex - 3 : -1;
          const cineproSrc = cineproIdx >= 0 && cineproIdx < cineproSources.length ? cineproSources[cineproIdx] : null;
          const isCineproVideo = cineproSrc && ["hls", "mp4", "dash", "http", "mkv", "webm"].includes(cineproSrc.type);
          return !isM3u8 && !isMp4 && !isYt && !isCineproVideo;
        })() && (
          <iframe
            key={`${sourceIndex}-${appliedExternalSub}`}
            src={allSources[sourceIndex]}
            title="BNKHUB"
            allow="fullscreen; picture-in-picture; encrypted-media; clipboard-write; gyroscope; accelerometer; web-share; display-capture; screen-wake-lock"
            allowFullScreen
            allowtransparency
            frameBorder="0"
            scrolling="no"
            {...((allSources[sourceIndex]?.includes("vidapi") || allSources[sourceIndex]?.includes("vaplayer.ru") || allSources[sourceIndex]?.includes("cinemaos.tech")) ? { sandbox: "allow-same-origin allow-scripts allow-forms" } : {})}
            onLoad={handleLoad}
            className="absolute inset-0 w-full h-full border-0 transition-opacity duration-700"
          />
        )}

        {/* Custom Controls Overlay — for direct video sources */}
        {playerActive && (() => {
          const cineproIdx = sourceIndex >= 3 ? sourceIndex - 3 : -1;
          const cineproSrc = cineproIdx >= 0 && cineproIdx < cineproSources.length ? cineproSources[cineproIdx] : null;
          return allSources[sourceIndex]?.includes(".m3u8") || 
            allSources[sourceIndex]?.includes(".mp4") ||
            (cineproSrc && ["hls", "mp4", "dash", "http", "mkv", "webm"].includes(cineproSrc.type));
        })() && (
          <div
            className={`absolute inset-0 z-40 flex flex-col justify-between p-4 md:p-6 transition-all duration-500 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={showControlsTemporarily}
            onMouseMove={showControlsTemporarily}
          >
            {/* Top bar — title + lock */}
            <div className={`flex items-start justify-between transition-all duration-500 pointer-events-auto ${controlsVisible ? 'translate-y-0' : '-translate-y-8'}`}>
              <div className="space-y-0.5">
                <h3 className="text-sm md:text-lg font-anton uppercase tracking-[0.08em] text-white drop-shadow-xl truncate max-w-[300px] md:max-w-[500px]">
                  {title || `Source ${sourceIndex + 1}`}
                </h3>
                <p className="text-[9px] md:text-[10px] text-accent font-black uppercase tracking-[0.3em]">
                  {allLabels[sourceIndex] || `S${sourceIndex + 1}`}
                </p>
              </div>
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`w-10 h-10 rounded-full backdrop-blur-2xl border flex items-center justify-center transition-all pointer-events-auto ${isLocked ? 'bg-accent/30 border-accent/50 text-accent' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>

            {/* Lock overlay */}
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <button onClick={() => setIsLocked(false)} className="w-24 h-24 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center gap-2 animate-pulse">
                  <Lock className="w-8 h-8 text-white/40" />
                  <span className="text-[8px] uppercase font-black tracking-[0.3em] text-white/20">Locked</span>
                </button>
              </div>
            )}

            {/* Bottom controls */}
            <div className={`space-y-4 transition-all duration-500 pointer-events-auto ${controlsVisible && !isLocked ? 'translate-y-0' : 'translate-y-12'}`}>
              {/* Seek bar */}
              {duration > 0 && (
                <div className="group/progress relative h-1.5 md:h-2 flex items-center cursor-pointer">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => handleProgressChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-1 md:h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_15px_hsl(var(--accent)/0.6)] [&::-webkit-slider-thumb]:opacity-0 group-hover/progress:[&::-webkit-slider-thumb]:opacity-100 transition-all"
                  />
                  <div className="absolute h-1 md:h-1.5 bg-accent rounded-full pointer-events-none shadow-[0_0_10px_hsl(var(--accent)/0.4)]" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
                </div>
              )}

              {/* Button row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-5">
                  {/* Play/Pause */}
                  <button onClick={handlePlayPause} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-2xl">
                    {isPlaying ? <Pause className="w-5 h-5 md:w-7 md:h-7 fill-current" /> : <Play className="w-5 h-5 md:w-7 md:h-7 fill-current ml-0.5 md:ml-1" />}
                  </button>
                  {/* Skip */}
                  <button onClick={() => handleSeek(-10)} className="text-white/50 hover:text-white transition-colors">
                    <RotateCw className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button onClick={() => handleSeek(10)} className="text-white/50 hover:text-white transition-colors">
                    <RotateCw className="w-5 h-5 md:w-6 md:h-6 scale-x-[-1]" />
                  </button>
                  {/* Time */}
                  <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono font-bold bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
                    <span className="text-accent">{formatTime(currentTime)}</span>
                    <span className="text-white/20">/</span>
                    <span className="text-white/50">{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  {/* Volume */}
                  <div className="hidden md:flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
                    <button onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)} className="text-white/50 hover:text-white transition-colors">
                      {volume === 0 ? <VolumeX className="w-4 h-4 text-destructive" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => handleVolumeChange(Number(e.target.value))} className="w-16 accent-accent h-1" />
                  </div>
                  {/* Settings */}
                  <button onClick={() => { setShowSettings(true); setControlsVisible(true); }} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:rotate-90 transition-all duration-500">
                    <Settings className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all">
                    {isFullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {playerActive && loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 pointer-events-none">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <div className="absolute inset-0 w-12 h-12 bg-accent/20 blur-xl rounded-full animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground mt-4 font-medium">{t("player_loading")}</p>
            <p className="text-[10px] text-accent font-black uppercase tracking-[0.3em] mt-1">BNKHUB</p>
          </div>
        )}
      </div>

      {/* Sélecteur de source avancé - hide for customUrl */}
      {!customUrl && (
        <div className="mt-5">
          <PlayerSourceSelector 
            sources={allSources.map((src, idx) => {
              const cineproIdx = idx >= 3 ? idx - 3 : -1;
              const cineproSrc = cineproIdx >= 0 && cineproIdx < cineproSources.length ? cineproSources[cineproIdx] : null;
              const isCineproVideo = cineproSrc && ["hls", "mp4", "dash", "http", "mkv", "webm"].includes(cineproSrc.type);
              const isDirect = src.includes(".m3u8") || src.includes(".mp4") || src.includes("youtube") || src.includes("cinemaos.tech") || !!isCineproVideo;
              return {
                id: idx,
                name: `S${idx + 1} BNKHUB`,
                quality: isDirect ? cineproSrc?.quality || "1080p" : "Auto",
                speed: isDirect ? "50" : "30",
                uptime: "99",
                hasAds: !isDirect,
                selected: idx === sourceIndex
              };
            })}
            onSelect={selectSource}
            isLoading={false}
            type={type}
            tmdbId={tmdb_id}
          />
        </div>
      )}

      {/* Settings Modal (High-Contrast Glassmorphism) */}
      {showSettings && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowSettings(false)} />
          
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="absolute -top-12 -end-12 w-32 h-32 bg-accent/10 blur-[60px] rounded-full" />
            
            <div className="relative space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent/10 text-accent">
                    {activeTab === "speed" && <Gauge className="w-5 h-5" />}
                    {activeTab === "subtitle" && <Captions className="w-5 h-5" />}
                    {(activeTab === "quality" || activeTab === "audio") && <Settings className="w-5 h-5" />}
                  </div>
                  <h3 className="text-lg font-display font-black tracking-widest text-white uppercase">{activeTab}</h3>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 rounded-full hover:bg-white/10 text-white/30 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {activeTab === "speed" && [0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button 
                    key={rate}
                    onClick={() => { setPlaybackRate(rate); setShowSettings(false); }}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black transition-all ${playbackRate === rate ? 'bg-accent text-black shadow-glow-sm' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <Check className="w-4 h-4" />}
                  </button>
                ))}

                {activeTab === "subtitle" && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-2">Subtitles Found</p>
                    {/* OpenSubtitles Results */}
                    {externalSubs.length > 0 && externalSubs.map((sub, idx) => (
                      <button 
                        key={`os-${idx}`}
                        onClick={async () => {
                          const url = await getDownloadUrl(sub.attributes.file_id);
                          if (url) setAppliedExternalSub(url);
                          setShowSettings(false);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-bold transition-all border ${appliedExternalSub?.includes(sub.attributes.file_id) ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border-transparent'}`}
                      >
                        <span className="truncate max-w-[220px]">{sub.attributes.release}</span>
                        {appliedExternalSub?.includes(sub.attributes.file_id) && <Check className="w-3 h-3 text-accent" />}
                      </button>
                    ))}

                    {/* Wyzie Results */}
                    {wyzieSubs.length > 0 && (
                      <>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-2 pt-4">Wyzie Premium Subs</p>
                        {wyzieSubs.map((sub, idx) => (
                          <button 
                            key={`wyzie-${idx}`}
                            onClick={() => {
                              setAppliedExternalSub(sub.url);
                              setShowSettings(false);
                            }}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-bold transition-all border ${appliedExternalSub === sub.url ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border-transparent'}`}
                          >
                            <span className="truncate max-w-[220px]">{sub.label}</span>
                            {appliedExternalSub === sub.url && <Check className="w-3 h-3 text-accent" />}
                          </button>
                        ))}
                      </>
                    )}

                    {/* CinePro Subtitles */}
                    {cineproSubs.length > 0 && (
                      <>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-2 pt-4">CinePro Subs</p>
                        {cineproSubs.map((sub, idx) => (
                          <button
                            key={`cinepro-${idx}`}
                            onClick={() => {
                              setAppliedExternalSub(sub.url);
                              setShowSettings(false);
                            }}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-bold transition-all border ${appliedExternalSub === sub.url ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border-transparent'}`}
                          >
                            <span className="truncate max-w-[220px]">{sub.label}</span>
                            {appliedExternalSub === sub.url && <Check className="w-3 h-3 text-accent" />}
                          </button>
                        ))}
                      </>
                    )}

                    {externalSubs.length === 0 && wyzieSubs.length === 0 && cineproSubs.length === 0 && (
                      <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Loader2 className="w-6 h-6 text-accent/20 animate-spin mx-auto mb-3" />
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Searching or none found</p>
                      </div>
                    )}
                  </div>
                )}

                {(activeTab === "quality" || activeTab === "audio") && (
                  <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <ShieldCheck className="w-8 h-8 text-accent/20 mx-auto mb-4" />
                    <p className="text-xs text-white/40 font-medium px-8 leading-relaxed">
                      This setting is managed automatically by the streaming server for optimal performance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
