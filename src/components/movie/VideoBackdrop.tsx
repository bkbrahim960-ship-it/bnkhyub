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
            className="absolute top-0 left-1/2 -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 w-[200vw] h-[60vh] min-h-full md:w-[150%] md:h-[150%] lg:w-[120%] lg:h-[120%] pointer-events-none z-[1] object-cover md:scale-105"
            allow="autoplay; encrypted-media"
            style={{ border: 0 }}
          />
        </div>
      )}

      {/* Cinematic Overlays — Balanced for text readability while showing more video */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background via-background/10 to-transparent" />
      
      {/* Subtle edge masking to prevent sharp cuts while keeping video visibility */}
      <div className="absolute inset-0 z-[3] pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
      
      {/* Bottom fade for content readability — reduced height to show more video sides */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] md:h-[25%] z-[4] bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
