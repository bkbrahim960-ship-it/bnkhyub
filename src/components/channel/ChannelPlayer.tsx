import { useEffect, useRef, useState } from "react";
import { X, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import Hls from "hls.js";

interface ChannelPlayerProps {
  name: string;
  logo?: string;
  url: string;
  group?: string;
  onClose: () => void;
  standalone?: boolean;
}

export const ChannelPlayer = ({ name, logo, url, group, onClose, standalone }: ChannelPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const hideUITimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsConfig = {
      lowLatencyMode: true,
      liveSyncDurationCount: 1,
      liveMaxLatencyDurationCount: 3,
      enableWorker: true,
      fragLoadTimeOut: 2000,
      manifestLoadTimeOut: 3000,
    };

    let hls: Hls | null = null;

    if (url.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls(hlsConfig);
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(() => setPlaying(true)).catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls?.startLoad();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().then(() => setPlaying(true)).catch(() => {});
        });
      }
    } else {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        video.play().then(() => setPlaying(true)).catch(() => {});
      });
    }

    return () => {
      if (hls) hls.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [url]);

  const handleMouseMove = () => {
    if (standalone) return;
    setShowUI(true);
    clearTimeout(hideUITimer.current);
    hideUITimer.current = setTimeout(() => {
      if (playing) setShowUI(false);
    }, 3000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullscreen(false);
    } else {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (standalone) {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          muted={muted}
        />

        <div className={`absolute inset-0 transition-opacity duration-300 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className={`absolute top-0 inset-x-0 p-4 flex items-start justify-between transition-opacity duration-300 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onMouseEnter={() => setShowUI(true)}
          onMouseLeave={() => playing && setShowUI(false)}
        >
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {logo && (
              <img
                src={logo}
                alt=""
                className="w-10 h-10 rounded-lg object-contain bg-black/40 backdrop-blur-xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-white drop-shadow-lg">{name}</h2>
              {group && <p className="text-xs text-white/70 drop-shadow-lg">{group}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {playing && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/80 text-white text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            )}
            <button
              onClick={() => setMuted((m) => !m)}
              className="p-2 rounded-full bg-black/40 backdrop-blur-xl hover:bg-white/20 transition-all"
            >
              {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-black/40 backdrop-blur-xl hover:bg-white/20 transition-all"
            >
              {fullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-2 rounded-full bg-black/40 backdrop-blur-xl hover:bg-white/20 transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowUI(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        autoPlay
        playsInline
        muted={muted}
        onClick={(e) => {
          e.stopPropagation();
          if (!playing) return;
          if (videoRef.current?.paused) videoRef.current.play();
          else videoRef.current?.pause();
        }}
      />

      <div className={`absolute inset-0 transition-opacity duration-300 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className={`absolute top-0 inset-x-0 p-6 flex items-start justify-between transition-opacity duration-300 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          {logo && (
            <img
              src={logo}
              alt={name}
              className="w-12 h-12 rounded-xl object-contain bg-black/40 backdrop-blur-xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-white drop-shadow-lg">{name}</h2>
            {group && <p className="text-sm text-white/70 drop-shadow-lg">{group}</p>}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-3 rounded-full bg-black/40 backdrop-blur-xl hover:bg-white/20 transition-all"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className={`absolute bottom-0 inset-x-0 p-6 flex items-center justify-between transition-opacity duration-300 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMuted((m) => !m)}
            className="p-3 rounded-full bg-black/40 backdrop-blur-xl hover:bg-white/20 transition-all"
          >
            {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
          {playing && (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/80 text-white text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-full bg-black/40 backdrop-blur-xl hover:bg-white/20 transition-all"
        >
          {fullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
        </button>
      </div>
    </div>
  );
};
