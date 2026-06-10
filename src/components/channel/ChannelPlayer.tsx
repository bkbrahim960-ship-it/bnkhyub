import { useEffect, useRef, useState } from "react";
import { X, Maximize, Minimize, Volume2, VolumeX, Loader2, Wifi, WifiOff } from "lucide-react";
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
  const [state, setState] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const hideUITimer = useRef<ReturnType<typeof setTimeout>>();
  const retryCount = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setState("loading");
    setErrorMsg("");

    const hlsConfig = {
      lowLatencyMode: true,
      liveSyncDurationCount: 1,
      liveMaxLatencyDurationCount: 3,
      enableWorker: true,
      fragLoadTimeOut: 2000,
      manifestLoadTimeOut: 3000,
    };

    let hls: Hls | null = null;
    let destroyed = false;

    const onPlay = () => {
      if (!destroyed) setState("playing");
    };
    const onError = () => {
      if (!destroyed) {
        setState("error");
        setErrorMsg("تعذر الاتصال بالخادم");
      }
    };

    if (url.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls(hlsConfig);
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(onPlay).catch(onError);
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryCount.current < 2) {
              retryCount.current++;
              setTimeout(() => hls?.startLoad(), 2000);
            } else {
              onError();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.addEventListener("loadedmetadata", () => {
          video.play().then(onPlay).catch(onError);
        });
        video.src = url;
      } else {
        setState("error");
        setErrorMsg("المتصفح لا يدعم تشغيل HLS");
      }
    } else {
      video.addEventListener("loadedmetadata", () => {
        video.play().then(onPlay).catch(onError);
      });
      video.src = url;
    }

    return () => {
      destroyed = true;
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
      if (state === "playing") setShowUI(false);
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

  const loadingOverlay = (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/60 backdrop-blur-sm">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-emerald-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Wifi className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white/90 text-base font-medium tracking-wide">
          جاري التحميل...
        </p>
        <p className="text-white/50 text-sm mt-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          جاري التحقق من الاتصال
        </p>
      </div>
    </div>
  );

  const errorOverlay = (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
        <WifiOff className="w-10 h-10 text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-red-400 text-base font-medium">تعذر الاتصال</p>
        <p className="text-white/50 text-sm mt-1">{errorMsg}</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
      >
        إعادة المحاولة
      </button>
    </div>
  );

  const topBar = (
    <div
      className={`absolute top-0 inset-x-0 p-4 flex items-start justify-between transition-opacity duration-300 ${
        showUI ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onMouseEnter={() => setShowUI(true)}
      onMouseLeave={() => state === "playing" && setShowUI(false)}
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
        {state === "playing" && (
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
  );

  const gradientLayer = (
    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showUI ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );

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
        {state === "loading" && loadingOverlay}
        {state === "error" && errorOverlay}
        {gradientLayer}
        {topBar}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => state === "playing" && setShowUI(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        autoPlay
        playsInline
        muted={muted}
        onClick={(e) => {
          e.stopPropagation();
          if (videoRef.current?.paused) videoRef.current.play();
          else videoRef.current?.pause();
        }}
      />
      {state === "loading" && loadingOverlay}
      {state === "error" && errorOverlay}
      {gradientLayer}
      {topBar}
    </div>
  );
};
