import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Baby } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { SmileSVG } from "@/pages/Profile";
import { useImmersiveMode } from "@/hooks/useImmersiveMode";

export const BottomNav = () => {
  const { user } = useAuth();
  const { kidsMode, toggleKidsMode } = useSettings();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const immersiveHidden = useImmersiveMode();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div 
      className={`md:hidden fixed bottom-4 inset-x-4 z-50 pointer-events-none transition-all duration-500 ease-out transform-gpu will-change-transform ${
        (isVisible && !immersiveHidden) ? "translate-y-0 opacity-100" : "translate-y-28 opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-auto flex items-center justify-around gap-4 sm:gap-8 p-1.5 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl w-fit px-6 sm:px-10 pointer-events-auto">
        
        {/* Profile Avatar Button */}
        <NavLink
          to={user ? "/profile" : "/auth"}
          className={({ isActive }) =>
            `relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden transition-all duration-500 transform-gpu hover:scale-110 active:scale-95 border-2 border-white/10 bg-accent ${
              isActive 
                ? "ring-2 ring-accent ring-offset-1 ring-offset-black/60 shadow-glow" 
                : "opacity-80 hover:opacity-100"
            }`
          }
        >
          <SmileSVG />
          {user && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black/80 shadow-glow-sm animate-pulse" />
          )}
        </NavLink>

        {/* Football Matches Button */}
        <NavLink
          to="/matches"
          className={({ isActive }) =>
            `p-2 sm:p-3 rounded-full transition-all duration-500 transform-gpu hover:scale-110 active:scale-95 border ${
              isActive
                ? "text-accent bg-accent/20 border-accent/40 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
          aria-label="Live Matches"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9.5" />
            <polygon points="12,4.5 15.8,7.2 14.2,11.8 9.8,11.8 8.2,7.2" fill="currentColor" fillOpacity="0.12" />
            <line x1="12" y1="13" x2="12" y2="21" />
            <line x1="12" y1="13" x2="5.5" y2="16.5" />
            <line x1="12" y1="13" x2="18.5" y2="16.5" />
            <line x1="5.5" y1="7.5" x2="3" y2="12" />
            <line x1="18.5" y1="7.5" x2="21" y2="12" />
          </svg>
        </NavLink>

        {/* Language Switcher */}
        <div className="scale-75 sm:scale-90 hover:scale-110 transition-transform duration-500 transform-gpu">
          <LanguageSwitcher />
        </div>

        {/* Kids Mode Toggle */}
        <button
          onClick={toggleKidsMode}
          className={`p-2 sm:p-3 rounded-full transition-all duration-500 transform-gpu hover:scale-110 active:scale-95 border ${
            kidsMode 
              ? "text-sky-400 bg-sky-400/20 shadow-[0_0_20px_rgba(56,189,248,0.4)] border-sky-400/40" 
              : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
          }`}
          aria-label="Kids Mode"
        >
          <Baby className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
