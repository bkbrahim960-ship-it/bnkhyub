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
    
    setIsVideoReady(false);
    
    const timer = setTimeout(() => {
      setIsVideoReady(true);
    }, 100); 

    return () => clearTimeout(timer);
  }, [videoKey]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      {/* Static Image Backdrop — object-top so face/action stays visible on mobile */}
      <img
        src={backdropPath}
        alt={title}
        className={`w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
          isVideoReady ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Video Backdrop — Optimized to cover all edges without gaps */}
      {videoKey && (
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Shield to prevent interaction and hide YouTube UI */}
          <div className="absolute inset-0 z-[2]" />
          
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoKey}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&vq=hd1080&playsinline=1&disablekb=1&fs=0`}
            title="Trailer"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] md:w-[140%] md:h-[140%] lg:w-[125%] lg:h-[125%] pointer-events-none z-[1] object-cover scale-110"
            allow="autoplay; encrypted-media"
            style={{ border: 0 }}
          />
        </div>
      )}

      {/* UI Covers — Solid black strips to hide YouTube Title/Logo */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black/80 z-[2] blur-sm" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/80 z-[2] blur-sm" />
      
      {/* Bottom fade for content readability — very subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-[10%] z-[4] bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
