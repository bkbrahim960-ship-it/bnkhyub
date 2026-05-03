/**
 * BNKhub — Lecteur vidéo avec 10 sources.
 * ⚠️ Changement de source UNIQUEMENT manuel (pas de fallback auto).
 * Le timeout de 5s n'a été conservé que pour marquer visuellement une source
 * comme potentiellement indisponible, mais il NE bascule plus automatiquement.
 */
import { useEffect, useRef, useState } from "react";
import { getMovieSources, getTVSources, SOURCE_LABELS } from "@/services/player";
import { AdsNoticeModal, hasSeenAdsNotice } from "./AdsNoticeModal";
import { ResumeModal } from "./ResumeModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getRecentHistory } from "@/services/watchHistory";
import { Loader2, AlertCircle, RotateCw, ShieldCheck, Play, Settings, Lock, Unlock, FastForward, Languages, Captions, Monitor, Gauge, PictureInPicture as PipIcon, Maximize, Search, Download, ExternalLink } from "lucide-react";
import { searchSubtitles, getDownloadUrl, SubtitleResult } from "@/services/opensubtitles";
import { searchYTSSubtitles } from "@/services/yts_subtitles";
import { searchSubscene } from "@/services/subscene";
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
  /** Index initial de source (pour reprise depuis historique) */
  initialSourceIndex?: number;
  /** Callback à chaque changement manuel de source (pour synchro Cloud) */
  onSourceChange?: (index: number, label: string) => void;
  /** Callback au lancement du lecteur (1re lecture) — pour créer l'entrée historique */
  onPlayStart?: (index: number, label: string) => void;
  /** URL directe pour les contenus personnalisés */
  customUrl?: string;
}

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
  const { t, lang } = useLanguage();
  const [sourceIndex, setSourceIndex] = useState(initialSourceIndex);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState<boolean[]>(Array(50).fill(false));
  const [adsOpen, setAdsOpen] = useState(!hasSeenAdsNotice());
  const [playerActive, setPlayerActive] = useState(hasSeenAdsNotice());
  const timeoutRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

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
  const [ytsSubs, setYtsSubs] = useState<any[]>([]);
  const [subsceneResults, setSubsceneResults] = useState<any[]>([]);
  const [isSearchingSubs, setIsSearchingSubs] = useState(false);
  const [appliedExternalSub, setAppliedExternalSub] = useState<string | null>(null);

  // Resume Logic
  const { user } = useAuth();
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [historyProgress, setHistoryProgress] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);

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
            if (hlsRef.current) hlsRef.current.subtitleTrack = -1;
          }
        }
      } catch (err) {
        console.error("Auto-fetch subtitles failed:", err);
      }
    };
    
    if (playerActive) {
      autoFetchSubs();
    }
  }, [imdb_id, playerActive]);

  // Check for resume progress on mount
  useEffect(() => {
    if (!user || startedRef.current || hasResumed) return;

    const checkHistory = async () => {
      try {
        const history = await getRecentHistory(user.id, 50);
        const currentEntry = history.find(e => 
          e.tmdb_id === Number(tmdb_id) && 
          e.media_type === type && 
          (!season || e.season_number === season) && 
          (!episode || e.episode_number === episode)
        );

        if (currentEntry && currentEntry.progress_seconds > 60) {
          setHistoryProgress(currentEntry.progress_seconds);
          setResumeModalOpen(true);
        }
      } catch (err) {
        console.error("Failed to check history for resume:", err);
      }
    };

    checkHistory();
  }, [user, tmdb_id, type, season, episode, hasResumed]);

  const baseSources =
    type === "movie"
      ? getMovieSources(imdb_id, tmdb_id)
      : getTVSources(imdb_id, tmdb_id, season ?? 1, episode ?? 1);

  const [customSources, setCustomSources] = useState<string[]>([]);
  const [customLabels, setCustomLabels] = useState<string[]>([]);

  const sources = customUrl ? [customUrl] : [...baseSources, ...customSources];
  const allLabels = customUrl ? ["Source Directe"] : [...SOURCE_LABELS, ...customLabels];

  useEffect(() => {
    const fetchCustomServers = async () => {
      try {
        const { data, error } = await supabase.from("custom_servers").select("*");
        if (!error && data) {
          const relevant = data.filter((s: any) => s.type === "both" || s.type === type);
          const cSources: string[] = [];
          const cLabels: string[] = [];
          relevant.forEach((s: any) => {
            let url = s.url_pattern
              .replace(/{imdb}/g, imdb_id || "")
              .replace(/{tmdb}/g, String(tmdb_id || ""))
              .replace(/{s}/g, String(season || 1))
              .replace(/{e}/g, String(episode || 1));
            cSources.push(url);
            cLabels.push(`S${10 + cLabels.length + 1} · ${s.name}`);
          });
          setCustomSources(cSources);
          setCustomLabels(cLabels);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchCustomServers();
  }, [imdb_id, tmdb_id, type, season, episode]);

  // Recharge quand on change de source / d'item
  useEffect(() => {
    if (!playerActive) return;
    setLoading(true);
  }, [sourceIndex, playerActive, imdb_id, tmdb_id, season, episode]);

  useEffect(() => {
    const currentSource = sources[sourceIndex];

    if (playerActive && currentSource?.includes(".m3u8") && videoRef.current) {
      const video = videoRef.current;
      
      // Ensure playsInline for iOS
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');

      // Priority 1: Native HLS (Safari/iOS) - User specifically requested native HLS on iOS
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        console.log("Using native HLS support");
        video.src = currentSource;
        video.load();
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Native HLS Autoplay prevented:", error);
            // We'll show the controls so user can manual play if needed
          });
        }
        setLoading(false);
      } 
      // Priority 2: Hls.js for browsers without native support
      else if (Hls.isSupported()) {
        console.log("Using hls.js support");
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(currentSource);
        hls.attachMedia(video);
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              console.log("Hls.js Autoplay prevented");
            });
          }
          setLoading(false);
          
          // Capture tracks and levels
          setAudioTracks(hls.audioTracks);
          setSubtitleTracks(hls.subtitleTracks);
          setLevels(hls.levels);
          setCurrentLevel(hls.currentLevel);
          setCurrentAudio(hls.audioTrack);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          setCurrentLevel(data.level);
        });

        // Update state from video element
        const video = videoRef.current;
        if (video) {
          const updateState = () => {
            setIsPlaying(!video.paused);
            setProgress(video.currentTime);
            setDuration(video.duration);
            setVolume(video.volume);
          };
          video.addEventListener("play", updateState);
          video.addEventListener("pause", updateState);
          video.addEventListener("timeupdate", updateState);
          video.addEventListener("volumechange", updateState);
          video.addEventListener("loadedmetadata", updateState);
          
          updateState(); // Initial sync
        }

        hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
          setCurrentAudio(data.id);
        });

        hls.on(Hls.Events.SUBTITLE_TRACK_SWITCHED, (event, data) => {
          setCurrentSubtitle(data.id);
          setAppliedExternalSub(null); // Reset external if internal is chosen
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      }
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [sourceIndex, playerActive, sources]);

  useEffect(() => {
    if (playerActive && !startedRef.current) {
      startedRef.current = true;
      onPlayStart?.(sourceIndex, allLabels[sourceIndex] || SOURCE_LABELS[sourceIndex]);
    }
  }, [playerActive, sourceIndex, onPlayStart, allLabels]);

  const handleLoad = () => {
    setLoading(false);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    if (playerActive && loading) {
      const safety = window.setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => window.clearTimeout(safety);
    }
  }, [playerActive, loading]);

  const selectSource = (idx: number) => {
    if (idx === sourceIndex) return;
    
    const nextSrc = sources[idx];
    const isEmbed = !nextSrc?.includes('.m3u8') && !nextSrc?.includes('.mp4');

    // Handle PWA iframe restrictions during source selection
    if (playerActive && isPWA() && isEmbed) {
      toast.info("Opening external player for PWA compatibility...");
      window.open(nextSrc, '_blank');
      return;
    }

    setSourceIndex(idx);
    // Réinitialise le flag "lent" pour la source choisie
    setSlow((prev) => {
      const copy = [...prev];
      copy[idx] = false;
      return copy;
    });
    onSourceChange?.(idx, allLabels[idx] || SOURCE_LABELS[idx]);
  };

  const retry = () => {
    setSlow(Array(50).fill(false));
    setLoading(true);
  };

  // Remote Control Listener
  useEffect(() => {
    const handleRemote = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (!playerActive) return;
        const next = (sourceIndex + 1) % sources.length;
        selectSource(next);
      } else if (e.key === "ArrowLeft") {
        if (!playerActive) return;
        const prev = (sourceIndex - 1 + sources.length) % sources.length;
        selectSource(prev);
      } else if (e.key === "Enter" || e.key === "OK" || e.key === "Select") {
        if (!playerActive) {
          handleStartPlay();
        } else if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play().catch(() => {});
          else videoRef.current.pause();
        }
      } else if (e.key === "Escape" || e.key === "Back" || e.key === "BrowserBack") {
        if (adsOpen) setAdsOpen(false);
        else if (playerActive) setPlayerActive(false);
      } else if (e.key === "r" || e.key === "R") {
        retry();
      }
    };

    window.addEventListener("keydown", handleRemote);
    return () => window.removeEventListener("keydown", handleRemote);
  }, [sourceIndex, sources.length, playerActive, adsOpen]);

  // VidAPI Event Listener (Auto-next, Progress)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type !== 'PLAYER_EVENT') return;
      
      const { player_status, player_progress, player_info } = e.data.data;
      const mediaId = player_info?.tmdb || player_info?.imdb || tmdb_id || imdb_id;

      if (player_status === 'playing') {
        // Save progress for resume
        localStorage.setItem(`progress_${mediaId}`, String(player_progress));
      } else if (player_status === 'completed') {
        if (type === 'tv' && episode) {
          // Automatic next logic can be handled by parent or manual action
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [type, episode, tmdb_id, imdb_id, lang]);

  const containerRef = useRef<HTMLDivElement>(null);

  const isAndroidTV = () => {
    return /Android/i.test(navigator.userAgent) && (/TV/i.test(navigator.userAgent) || /Large/i.test(navigator.userAgent));
  };

  const isPWA = () => 
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  const handleStartPlay = () => {
    setAdsOpen(false);
    
    const currentSrc = sources[sourceIndex];
    const isEmbed = !currentSrc?.includes('.m3u8') && !currentSrc?.includes('.mp4');

    // Handle PWA iframe restrictions by opening embed sources in a new tab
    if (isPWA() && isEmbed) {
      toast.info("Opening external player for PWA compatibility...");
      window.open(currentSrc, '_blank');
      return;
    }

    setPlayerActive(true);
    // Bind play to user click for iOS compatibility
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        console.log("Play triggered from click, but may need source to be loaded first");
      });
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      <AdsNoticeModal
        open={adsOpen}
        onAccept={handleStartPlay}
        onClose={() => setAdsOpen(false)}
      />

      {title && (
        <h2 className="font-display text-xl md:text-2xl text-accent mb-3 px-1">{title}</h2>
      )}

      <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/player transition-all duration-500 ${isWebFullscreen ? 'fixed inset-0 z-[1000] rounded-none !aspect-auto h-screen' : ''}`}>
        {/* Custom Overlays Removed as requested */}

        {/* Lock Overlay Removed */}

        {/* Resume / Restart Modal */}
        <ResumeModal 
          open={resumeModalOpen}
          progressSeconds={historyProgress}
          onClose={() => setResumeModalOpen(false)}
          onRestart={() => {
            setResumeModalOpen(false);
            setHasResumed(true);
            if (videoRef.current) videoRef.current.currentTime = 0;
          }}
          onResume={() => {
            setResumeModalOpen(false);
            setHasResumed(true);
            if (videoRef.current) videoRef.current.currentTime = historyProgress;
            toast.success(lang === "ar" ? "تم استئناف المشاهدة" : "Lecture reprise");
          }}
        />


        {!playerActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-surface-elevated/80 backdrop-blur-sm">
            <div className="relative group">
              <div className="absolute -inset-8 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/40 transition-all duration-700 animate-pulse" />
              <button
                onClick={handleStartPlay}
                className="relative bg-gradient-accent text-accent-foreground font-black px-12 py-6 rounded-full shadow-accent hover:scale-110 active:scale-95 transition-all flex items-center gap-4 border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">BNKhub Engine</p>
                  <p className="text-xl font-display">{t("hero_watch")}</p>
                </div>
              </button>
            </div>
            <p className="mt-8 text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] animate-pulse">Ultra HD · Multi-Server · No Limits</p>
          </div>
        )}

        {/* Always render video element if it's an HLS source to allow pre-binding of play() */}
        {sources[sourceIndex]?.includes(".m3u8") && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-300 ${playerActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            controls
            autoPlay
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
          >
            {appliedExternalSub && (
              <track 
                src={appliedExternalSub} 
                kind="subtitles" 
                srcLang="ar" 
                label="Arabe (Online)" 
                default 
              />
            )}
          </video>
        )}

        {/* Interaction Shield & Gestures Removed */}

        {/* Render YouTube if detected */}
        {playerActive && (sources[sourceIndex]?.includes("youtube.com") || sources[sourceIndex]?.includes("youtu.be")) && (
          <iframe
            key={`yt-${sourceIndex}`}
            src={`https://www.youtube.com/embed/${
              sources[sourceIndex].includes("v=") 
                ? sources[sourceIndex].split("v=")[1].split("&")[0] 
                : sources[sourceIndex].split("/").pop()
            }?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
            title="YouTube Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={handleLoad}
            className="absolute inset-0 w-full h-full border-0"
          />
        )}

        {/* Render iframe for other sources (non-m3u8, non-youtube) */}
        {playerActive && !sources[sourceIndex]?.includes(".m3u8") && !sources[sourceIndex]?.includes("youtube.com") && !sources[sourceIndex]?.includes("youtu.be") && (
          <iframe
            {...(sourceIndex === 0 ? { 
              sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation",
              title: "BNKhub Premium Server"
            } : {
              title: "BNKhub Mirror Server"
            })}
            {...(sources[sourceIndex]?.includes('embedmaster.link') || sources[sourceIndex]?.includes('vidsrc') ? { 
              sandbox: undefined,
              allow: "autoplay *; fullscreen *; picture-in-picture *; encrypted-media *"
            } : {
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            })}
            allowFullScreen
            referrerPolicy="no-referrer"
            onLoad={handleLoad}
            className="absolute inset-0 w-full h-full border-0 transition-opacity duration-700"
          />
        )}

        {playerActive && loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">{t("player_loading")}</p>
            <p className="text-xs text-accent mt-1">{allLabels[sourceIndex] || SOURCE_LABELS[sourceIndex]}</p>
          </div>
        )}

        {playerActive && slow[sourceIndex] && !loading && (
          <div className="absolute top-3 end-3 flex items-center gap-2 bg-black/70 border border-border rounded-full px-3 py-1.5 text-xs">
            <AlertCircle className="w-3.5 h-3.5 text-accent" />
            <button onClick={retry} className="inline-flex items-center gap-1 hover:text-accent">
              <RotateCw className="w-3 h-3" /> {t("player_retry")}
            </button>
          </div>
        )}
      </div>

      {/* Sélecteur de source avancé */}
      <div className="mt-5">
        <PlayerSourceSelector 
          sources={sources.map((src, idx) => {
            const isDirect = src.includes(".m3u8") || src.includes(".mp4") || src.includes("youtube");
            return {
              id: idx,
              name: allLabels[idx] || SOURCE_LABELS[idx] || `Source ${idx + 1}`,
              quality: isDirect ? "1080p" : "Auto",
              speed: isDirect ? "50" : "30",
              uptime: "99",
              hasAds: !isDirect,
              selected: idx === sourceIndex
            };
          })}
          onSelect={selectSource}
          isLoading={false}
        />
      </div>

    </div>
  );
};
