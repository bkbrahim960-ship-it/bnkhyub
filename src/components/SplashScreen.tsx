
import { useState, useEffect } from "react";

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 5 seconds total splash, fade starts at 4.5s
    const fadeTimer = setTimeout(() => setFadeOut(true), 4500);
    const removeTimer = setTimeout(() => onFinish(), 5000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Rotating Luxury Logo Container */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center mb-12">
          {/* Outer Spinning Ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-dashed border-accent/20"
            style={{ animation: "splash-spin 10s linear infinite" }}
          />
          
          {/* Inner Fast Spinning Gradient Ring */}
          <div
            className="absolute inset-2 rounded-full shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, var(--accent) 50%, transparent 100%)`,
              padding: "2px",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
              animation: "splash-spin 2s linear infinite"
            }}
          />

          {/* Logo Icon */}
          <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-black shadow-2xl bg-black animate-scale-in">
            <img
              src="/icon.png"
              alt="BNKhub"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Brand Name with Luxe Shimmer */}
        <div className="text-center space-y-6">
          <h1
            className="text-4xl md:text-5xl font-black tracking-[0.4em] uppercase"
            style={{
              background: "linear-gradient(90deg, #fff, var(--accent), #fff)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "splash-shimmer 3s linear infinite",
            }}
          >
            BNKhub
          </h1>

          {/* Credit Text (French) */}
          <div className="space-y-2 animate-fade-in" style={{ animationDelay: '800ms' }}>
             <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.5em] font-medium">
               Premium Cinematic Experience
             </p>
             <div className="h-px w-12 bg-accent/30 mx-auto my-4" />
             <p className="text-accent/80 font-display text-sm md:text-lg tracking-wider">
               Site conçu et programmé par <span className="font-bold text-white tracking-widest">BRAHIM BEN KEDDACHE</span>
             </p>
          </div>
        </div>
      </div>

      {/* Progress Bar Loader - Adjusted for 5s */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-accent animate-progress" style={{ animationDuration: '4.5s' }} />
      </div>

      <style>{`
        @keyframes splash-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splash-shimmer {
          to { background-position: 200% center; }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2.5s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scale-in {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
