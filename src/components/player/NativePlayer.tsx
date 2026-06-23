import { useRef, useState, useCallback, useEffect } from "react";
import { CustomPlayerControls } from "./CustomPlayerControls";

interface Props {
  src: string;
  title?: string;
  subtitle?: string;
}

export const NativePlayer = ({ src, title, subtitle }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + seconds, v.duration || 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  const handleProgressChange = useCallback((value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = value;
    setProgress(value);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = value;
    setVolume(value);
  }, []);

  const toggleLock = useCallback(() => setIsLocked((p) => !p), []);

  return (
    <>
      <style>{`
        video::-webkit-media-controls { display: none !important; }
        video::-webkit-media-controls-enclosure { display: none !important; }
        video::-webkit-media-controls-panel { display: none !important; }
        video::-webkit-media-controls-overlay-play-button { display: none !important; }
        video::-webkit-media-controls-start-playback-button { display: none !important; }
      `}</style>
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl cursor-pointer"
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          onTimeUpdate={() => {
            const v = videoRef.current;
            if (v) setProgress(v.currentTime);
          }}
          onLoadedMetadata={() => {
            const v = videoRef.current;
            if (v) setDuration(v.duration);
          }}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
          preload="metadata"
        />
        <CustomPlayerControls
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onSeek={seek}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          onShowSettings={() => {}}
          progress={progress}
          duration={duration}
          onProgressChange={handleProgressChange}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isLocked={isLocked}
          onToggleLock={toggleLock}
          title={title}
          subtitle={subtitle}
        />
      </div>
    </>
  );
};
