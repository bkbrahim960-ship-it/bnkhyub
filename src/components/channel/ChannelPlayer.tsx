import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Hls from "hls.js";

interface ChannelPlayerProps {
  name: string;
  url: string;
  onClose: () => void;
}

export const ChannelPlayer = ({ name, url, onClose }: ChannelPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (url.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(() => {});
      }
    } else {
      video.src = url;
      video.play().catch(() => {});
    }
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white truncate">{name}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="aspect-video bg-black rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            autoPlay
            playsInline
          />
        </div>
      </div>
    </div>
  );
};
