/**
 * BNKhub — Lecteur vidéo avec 10 sources.
 * ⚠️ Changement de source UNIQUEMENT manuel (pas de fallback auto).
 * Le timeout de 5s n'a été conservé que pour marquer visuellement une source
 * comme potentiellement indisponible, mais il NE bascule plus automatiquement.
 */
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { getMovieSources, getTVSources, SOURCE_LABELS } from "@/services/player";
import { AdsNoticeModal, hasSeenAdsNotice } from "./AdsNoticeModal";
import { ResumeModal } from "./ResumeModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getRecentHistory } from "@/services/watchHistory";
import { Loader2, AlertCircle, RotateCw, ShieldCheck, Play, Settings, Lock, Unlock, FastForward, Languages, Captions, Monitor, Gauge, PictureInPicture as PipIcon, Maximize, Search, Download, ExternalLink, X, Check } from "lucide-react";
import { searchSubtitles, getDownloadUrl, SubtitleResult } from "@/services/opensubtitles";
import { searchWyzieSubtitles, WyzieSubtitle } from "@/services/wyzie";
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
  /** Callback pour mettre à jour la progression dans l'historique */
  onProgress?: (seconds: number, duration?: number) => void;
  /** Callback quand la vidéo est terminée (pour auto-play suivant) */
  onCompleted?: () => void;
}

export interface VideoPlayerRef {
  setSubtitle: (url: string) => void;
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
}, ref) => {
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

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    setSubtitle: (url: string) => {
      setAppliedExternalSub(url);
      setPlayerActive(true);
    }
  }));

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

  const sources = type === "movie" 
    ? getMovieSources(imdb_id, tmdb_id, hasResumed ? historyProgress : 0) 
    : getTVSources(imdb_id, tmdb_id, season!, episode!, hasResumed ? historyProgress : 0);

  const allLabels = Array(50).fill(null);
  allLabels[0] = "BNKhub serveur";

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
    
    const current = sources[sourceIndex];
    setSourceIndex(-1);
    setTimeout(() => setSourceIndex(sources.indexOf(current)), 10);
  };

  const selectSource = (index: number) => {
    if (index === sourceIndex) return;
    setLoading(true);
    setSourceIndex(index);
    if (onSourceChange) {
      onSourceChange(index, allLabels[index] || SOURCE_LABELS[index]);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

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
      
      // 🛡️ Branding Guard: Redirection active vers le conteneur
      if (fsElem && fsElem.tagName === 'IFRAME' && containerRef.current) {
        if (containerRef.current !== fsElem) {
          containerRef.current.requestFullscreen().catch(() => {
            // Fallback si la redirection est bloquée
            console.log("🛡️ BNKhub Engine — Redirection bloquée par le navigateur");
          });
        }
      }
      
      setIsWebFullscreen(!!fsElem);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);

    return () => {
      window.removeEventListener("keydown", handleRemote);
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [isWebFullscreen]);

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

      <div ref={containerRef} className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/player transition-all duration-500 ${isWebFullscreen ? 'fixed inset-0 z-[1000] rounded-none !aspect-auto h-screen' : ''}`}>
        
        {/* Permanent Brand Watermark (Only for BNKhub Server S1) */}
        {playerActive && sourceIndex === 0 && (
          <div className="absolute top-4 right-5 z-50 pointer-events-none select-none">
            <div className="flex flex-col items-end">
              <span className="text-lg md:text-xl font-display font-black tracking-[0.2em] text-accent/60 drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">BNKHUB</span>
              <div className="h-0.5 w-8 bg-accent/40 rounded-full mt-0.5" />
            </div>
          </div>
        )}

        {!playerActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-card/40 backdrop-blur-3xl z-30 p-12 text-center overflow-hidden">
            <div className="absolute -top-24 -start-24 w-64 h-64 bg-accent/10 blur-[100px] rounded-full animate-pulse" />
            <div className="relative z-10 animate-in fade-in zoom-in duration-1000">
              <button 
                onClick={() => { setAdsOpen(false); setPlayerActive(true); }}
                className="group relative"
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

        {/* Video Element for HLS */}
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

        {/* YouTube Iframe */}
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

        {/* Standard Iframe */}
        {playerActive && !sources[sourceIndex]?.includes(".m3u8") && !sources[sourceIndex]?.includes("youtube.com") && !sources[sourceIndex]?.includes("youtu.be") && (
          <iframe
            key={`${sourceIndex}-${appliedExternalSub}`}
            src={`${sources[sourceIndex]}${appliedExternalSub ? `&sub=${encodeURIComponent(appliedExternalSub)}&subtitle=${encodeURIComponent(appliedExternalSub)}` : ''}`}
            {...(sourceIndex === 0 ? { 
              sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation allow-top-navigation",
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
          onToggleSettings={() => { setActiveTab("speed"); setShowSettings(true); }}
          onToggleSubtitles={() => { setActiveTab("subtitle"); setShowSettings(true); }}
          onToggleQuality={() => { setActiveTab("quality"); setShowSettings(true); }}
          isLoading={false}
        />
      </div>

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
