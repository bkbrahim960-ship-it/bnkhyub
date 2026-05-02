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
    }, 800); 

    return () => clearTimeout(timer);
  }, [videoKey]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Static Image Backdrop — object-top so face/action stays visible on mobile */}
      <img
        src={backdropPath}
        alt={title}
        className={`w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${
          isVideoReady ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Video Backdrop — aligned to TOP, not centered, so it sticks to header */}
      {videoKey && (
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            isVideoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Shield to prevent interaction and hide YouTube UI - NO pointer-events-none so it blocks clicks */}
          <div className="absolute inset-0 z-[2]" />
          
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoKey}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&vq=hd1080&playsinline=1&disablekb=1&fs=0`}
            title="Trailer"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[300%] h-full md:w-[180%] lg:w-[120%] pointer-events-none z-[1]"
            allow="autoplay; encrypted-media"
            style={{ border: 0 }}
          />
        </div>
      )}

      {/* Cinematic Overlays — stronger on mobile for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30 md:via-background/40 md:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent md:from-background md:via-background/20" />
      
      {/* Bottom fade for content readability */}
      <div className="absolute bottom-0 left-0 right-0 h-[50%] md:h-[40%] bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
