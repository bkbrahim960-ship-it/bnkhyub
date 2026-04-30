import { NavLink, Link } from "react-router-dom";
import { Home, Film, Tv, Search, Heart, Monitor, User as UserIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ColorSwitcher } from "@/components/ui/ColorSwitcher";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export const BottomNav = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { to: "/", icon: Home, label: t("nav_home") },
    { to: "/search", icon: Search, label: t("nav_search") },
    { to: user ? "/profile" : "/auth", icon: UserIcon, label: t("nav_profile") },
  ];

  return (
    <div className="fixed bottom-4 md:bottom-8 inset-x-4 z-50 pointer-events-none">
        {/* Compact Navigation Bar with 3 Functional Buttons */}
        <div className="mx-auto flex items-center justify-around gap-4 sm:gap-8 md:gap-12 p-1.5 md:p-2.5 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl w-fit px-6 sm:px-10 md:px-14 pointer-events-auto">
          {/* Profile Button with Login Status Indicator */}
          <NavLink
            to={user ? "/profile" : "/auth"}
            className={({ isActive }) =>
              `relative p-2 md:p-3 rounded-full transition-all duration-500 hover:scale-110 active:scale-95 ${
                isActive 
                  ? "text-accent bg-accent/20 shadow-glow-accent border border-accent/40" 
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            {user && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-black shadow-glow-sm animate-pulse" />
            )}
          </NavLink>

          {/* Language Switcher */}
          <div className="scale-75 sm:scale-90 md:scale-100 hover:scale-110 transition-transform duration-500">
            <LanguageSwitcher />
          </div>

          {/* Color Switcher */}
          <div className="scale-75 sm:scale-90 md:scale-100 hover:scale-110 transition-transform duration-500">
            <ColorSwitcher />
          </div>
        </div>
    </div>
  );
};
