
import { useState, useEffect } from "react";

interface Props {
  backdropPath: string;
  videoKey?: string;
  title?: string;
}

export const VideoBackdrop = ({ backdropPath, videoKey, title }: Props) => {
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    if (!videoKey) {
      setIsVideoReady(false);
      return;
    }
    
    // Reset state when videoKey changes
    setIsVideoReady(false);
    
    // We use a small timeout to let the iframe start buffering
    // Shortened to 800ms for near-instant playback feel
    const timer = setTimeout(() => {
      setIsVideoReady(true);
    }, 800); 

    return () => clearTimeout(timer);
  }, [videoKey]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Static Image Backdrop (Always present as fallback/initial) */}
      <img
        src={backdropPath}
        alt={title}
        className={`w-full h-full object-cover scale-110 transition-opacity duration-1000 ease-in-out ${
          isVideoReady ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Video Backdrop (YouTube Iframe) */}
      {videoKey && (
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            isVideoReady ? "opacity-100 scale-100" : "opacity-0 scale-110"
          }`}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoKey}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&vq=hd1080`}
            title="Trailer"
            className="absolute top-1/2 left-1/2 w-[115%] h-[115%] -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
      
      {/* Vignette for extra focus */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
};
