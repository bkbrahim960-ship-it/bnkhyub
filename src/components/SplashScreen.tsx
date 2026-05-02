import { useState, useEffect } from "react";

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const removeTimer = setTimeout(() => onFinish(), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Spinning ring */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-accent/10 blur-2xl animate-pulse" />

        {/* Spinning border ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, var(--accent) 30%, transparent 60%)`,
            animation: "splash-spin 1.2s linear infinite",
            padding: "3px",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          }}
        />

        {/* Inner dark circle with logo */}
        <div className="relative w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
          <img
            src="/icon.png"
            alt="BNKhub"
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>

      {/* Brand name */}
      <h1
        className="mt-8 text-2xl font-black tracking-[0.3em] uppercase"
        style={{
          background: "linear-gradient(135deg, var(--accent), #fff, var(--accent))",
          backgroundSize: "200% 200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "splash-shimmer 2s ease-in-out infinite",
        }}
      >
        BNKhub
      </h1>
      <p className="mt-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] animate-pulse">
        Loading Premium Experience
      </p>

      {/* CSS Animations */}
      <style>{`
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes splash-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};
