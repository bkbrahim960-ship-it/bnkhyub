/**
 * BNKhub — Lecteur vidéo avec 10 sources.
 * ⚠️ Changement de source UNIQUEMENT manuel (pas de fallback auto).
 * Le timeout de 5s n'a été conservé que pour marquer visuellement une source
 * comme potentiellement indisponible, mais il NE bascule plus automatiquement.
 */
import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { getMovieSources, getTVSources, SOURCE_LABELS, getInternalBackendSources } from "@/services/player";
import { AdsNoticeModal, hasSeenAdsNotice } from "./AdsNoticeModal";
import { ResumeModal } from "./ResumeModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getRecentHistory } from "@/services/watchHistory";
import { Loader2, AlertCircle, RotateCw, ShieldCheck, Play, Settings, Lock, Unlock, FastForward, Languages, Captions, Monitor, Gauge, PictureInPicture as PipIcon, Maximize, Search, Download, ExternalLink, X, Check } from "lucide-react";
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
  /** Passe en plein écran dès que la lecture commence */
  autoFullscreen?: boolean;
}

export interface VideoPlayerRef {
  setSubtitle: (url: string) => void;
  enterFullscreen: () => void;
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
  autoFullscreen = false,
}, ref) => {
  const { t, lang } = useLanguage();
  const [sourceIndex, setSourceIndex] = useState(Math.min(initialSourceIndex, 2));
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


  const enterFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current as HTMLElement & {
      webkitRequestFullscreen?: () => void;
    };
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => void;
    };
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => setIsWebFullscreen(true));
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else {
        setIsWebFullscreen(true);
      }
    }
  }, []);

  const startPlayback = useCallback(() => {
    setAdsOpen(false);
    setPlayerActive(true);
  }, []);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    setSubtitle: (url: string) => {
      setAppliedExternalSub(url);
      setPlayerActive(true);
    },
    enterFullscreen,
    startPlayback,
  }));

  // Resume Logic
  const { user } = useAuth();
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [historyProgress, setHistoryProgress] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);
  const lastSaveTime = useRef(0);
  const fullscreenAttempted = useRef(false);

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
  const cinemaOsParams = "language=ar&theme=c124a0&autoPlay=true&subtitle=ar&sub=ar&default_sub=ar&cc_lang_pref=ar";
  const cinemaOsUrl = type === "movie"
    ? `https://cinemaos.tech/player/${tmdb_id}?${cinemaOsParams}`
    : `https://cinemaos.tech/player/${tmdb_id}/${season}/${episode}?${cinemaOsParams}`;

  // nhdapi.com URL builder (Custom theme, Arabic options, download enabled)
  const nhdapiParams = new URLSearchParams({
    autoplay: "true",
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

  // For customUrl (Kabyle), only use customUrl
  const allSources = customUrl ? [customUrl] : [cinemaOsUrl, ...sources.slice(0,1), nhdapiUrl];

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

  const allLabels = Array(50).fill(null);
  allLabels[0] = "🎬 CinemaOS (بدون إعلانات)";
  allLabels[1] = customUrl ? "Serveur Kabyle" : "BNKhub serveur";
  allLabels[2] = "📥 nhdapi (تحميل مباشر)";

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
    setTimeout(() => setSourceIndex(Math.max(0, Math.min(allSources.indexOf(current), 2))), 10);
  };

  const selectSource = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, 2));
    if (clampedIndex === sourceIndex) return;
    setLoading(true);
    setSourceIndex(clampedIndex);
    if (onSourceChange) {
      onSourceChange(clampedIndex, `S${clampedIndex + 1} BNKHUB`);
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current as HTMLElement & {
      webkitRequestFullscreen?: () => void;
    };
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => void;
    };
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      enterFullscreen();
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      setIsWebFullscreen(false);
    }
  }, [enterFullscreen]);

  useEffect(() => {
    if (!autoStart) return;
    setAdsOpen(false);
    setPlayerActive(true);
  }, [autoStart]);

  useEffect(() => {
    if (!autoFullscreen || !playerActive || fullscreenAttempted.current) return;
    fullscreenAttempted.current = true;
    // CSS fullscreen works without user gesture (desktop & TV)
    setIsWebFullscreen(true);
    const timer = window.setTimeout(() => enterFullscreen(), 150);
    return () => window.clearTimeout(timer);
  }, [autoFullscreen, playerActive, enterFullscreen]);

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

  useEffect(() => {
    const handleRemote = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape" && isWebFullscreen) setIsWebFullscreen(false);
    };
    window.addEventListener("keydown", handleRemote);
    
    const handleFsChange = () => {
      const fsElem = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsWebFullscreen(!!fsElem);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);

    return () => {
      window.removeEventListener("keydown", handleRemote);
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [isWebFullscreen, toggleFullscreen]);

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
        className={`relative w-full ${allSources[sourceIndex]?.includes("drive.google.com") ? "aspect-square sm:aspect-[4/3] md:aspect-[16/10] rounded-lg" : "aspect-video rounded-2xl"} bg-black overflow-hidden border border-white/10 shadow-2xl group/player transition-all duration-500 ${isWebFullscreen ? 'fixed inset-0 z-[1000] rounded-none !aspect-auto h-screen' : ''}`}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-card/40 backdrop-blur-3xl z-30 p-12 text-center overflow-hidden">
            <div className="absolute -top-24 -start-24 w-64 h-64 bg-accent/10 blur-[100px] rounded-full animate-pulse" />
            <div className="relative z-10 animate-in fade-in zoom-in duration-1000">
              <button
                type="button"
                data-tv-nav="primary"
                tabIndex={0}
                onClick={() => { setAdsOpen(false); setPlayerActive(true); }}
                className="group relative focus:outline-none focus-visible:ring-4 focus-visible:ring-accent rounded-full"
              >
                <div className="absolute inset-0 bg-accent blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-24 h-24 rounded-full bg-accent flex items-center justify-center text-black shadow-accent hover:scale-110 transition-transform duration-500">
                  <Play className="w-10 h-10 fill-current ml-1" />
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-xl font-display font-black tracking-widest text-white uppercase">{t("hero_watch")}</p>
                </div>
              </button>
            </div>
            <p className="mt-8 text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] animate-pulse">Ultra HD · Multi-Server · No Limits</p>
          </div>
        )}

        {/* Video Element for HLS / Direct — only render when active to prevent background audio */}
        {playerActive && (allSources[sourceIndex]?.includes(".m3u8") || 
          allSources[sourceIndex]?.includes(".mp4")) && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            controls
            autoPlay
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            onLoadStart={() => setLoading(true)}
            onPlaying={() => { setLoading(false); setHasResumed(true); }}
            onWaiting={() => setLoading(true)}
            onTimeUpdate={(e) => {
              const current = (e.target as HTMLVideoElement).currentTime;
              const duration = (e.target as HTMLVideoElement).duration;
              
              if (current > 0 && Math.abs(current - lastSaveTime.current) >= 10) {
                lastSaveTime.current = current;
                saveProgress(current, duration);
              }
            }}
            onEnded={() => {
              // No need to handle completed here, watchHistory doesn't track it
            }}
          >
            {appliedExternalSub && <track kind="subtitles" src={appliedExternalSub} srcLang="ar" label="Arabic" default />}
          </video>
        )}

        {/* YouTube Iframe */}
        {playerActive && (allSources[sourceIndex]?.includes("youtube.com") || allSources[sourceIndex]?.includes("youtu.be")) && (
          <iframe
            key={`yt-${sourceIndex}`}
            src={`https://www.youtube.com/embed/${
              allSources[sourceIndex].includes("v=") 
                ? allSources[sourceIndex].split("v=")[1].split("&")[0] 
                : allSources[sourceIndex].split("/").pop()
            }?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
            title="YouTube Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={handleLoad}
            className="absolute inset-0 w-full h-full border-0"
          />
        )}

        {/* Standard Iframe */}
        {playerActive && !allSources[sourceIndex]?.includes(".m3u8") && !allSources[sourceIndex]?.includes(".mp4") && !allSources[sourceIndex]?.includes("youtube.com") && !allSources[sourceIndex]?.includes("youtu.be") && (
          <iframe
            key={`${sourceIndex}-${appliedExternalSub}`}
            src={allSources[sourceIndex]}
            title="BNKHUB"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write; gyroscope; accelerometer; web-share; display-capture; screen-wake-lock"
            allowFullScreen
            allowtransparency
            frameBorder="0"
            scrolling="no"
            {...((allSources[sourceIndex]?.includes("vidapi") || allSources[sourceIndex]?.includes("vaplayer.ru") || allSources[sourceIndex]?.includes("cinemaos.tech")) ? { sandbox: "allow-same-origin allow-scripts allow-forms" } : {})}
            onLoad={handleLoad}
            className="absolute inset-0 w-full h-full border-0 transition-opacity duration-700"
          />
        )}

        {playerActive && loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">{t("player_loading")}</p>
            <p className="text-xs text-accent mt-1">BNKHUB</p>
          </div>
        )}
      </div>

      {/* Sélecteur de source avancé - hide for customUrl */}
      {!customUrl && (
        <div className="mt-5">
          <PlayerSourceSelector 
            sources={allSources.map((src, idx) => {
              const isDirect = src.includes(".m3u8") || src.includes(".mp4") || src.includes("youtube") || src.includes("cinemaos.tech");
              return {
                id: idx,
                name: `S${idx + 1} BNKHUB`,
                quality: isDirect ? "1080p" : "Auto",
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

                    {externalSubs.length === 0 && wyzieSubs.length === 0 && (
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
