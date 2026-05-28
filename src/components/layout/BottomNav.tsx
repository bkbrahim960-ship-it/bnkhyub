import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Baby } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useImmersiveMode } from "@/hooks/useImmersiveMode";

export const BottomNav = () => {
  const { user } = useAuth();
  const { kidsMode, toggleKidsMode } = useSettings();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [avatarId, setAvatarId] = useState("red");
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

  }, []);

  return (
    <div 
      className={`fixed bottom-4 md:bottom-8 inset-x-4 z-50 pointer-events-none transition-all duration-500 ease-out transform-gpu will-change-transform ${
        (isVisible && !immersiveHidden) ? "translate-y-0 opacity-100" : "translate-y-28 opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-auto flex items-center justify-around gap-4 sm:gap-8 md:gap-12 p-1.5 md:p-2.5 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl w-fit px-6 sm:px-10 md:px-14 pointer-events-auto">
        
        {/* Profile Avatar Button */}
        <NavLink
          to={user ? "/profile" : "/auth"}
          className={({ isActive }) =>
            `relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden transition-all duration-500 transform-gpu hover:scale-110 active:scale-95 border-2 border-white/10 ${
              isActive 
                ? "ring-2 ring-accent ring-offset-1 ring-offset-black/60 shadow-glow" 
                : "opacity-80 hover:opacity-100"
            }`
          }
        >
          <img src="/profile-avatar.png" alt="Profile" className="w-full h-full object-cover" />
          {user && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black/80 shadow-glow-sm animate-pulse" />
          )}
        </NavLink>

        {/* Language Switcher */}
        <div className="scale-75 sm:scale-90 md:scale-100 hover:scale-110 transition-transform duration-500 transform-gpu">
          <LanguageSwitcher />
        </div>

        {/* Kids Mode Toggle */}
        <button
          onClick={toggleKidsMode}
          className={`p-2 md:p-3 rounded-full transition-all duration-500 transform-gpu hover:scale-110 active:scale-95 border ${
            kidsMode 
              ? "text-sky-400 bg-sky-400/20 shadow-[0_0_20px_rgba(56,189,248,0.4)] border-sky-400/40" 
              : "text-white/60 hover:text-white hover:bg-white/5 border-transparent"
          }`}
          aria-label="Kids Mode"
        >
          <Baby className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
        </button>

      </div>
    </div>
  );
};
