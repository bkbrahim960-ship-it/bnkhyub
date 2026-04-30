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
    <div className="fixed bottom-6 inset-x-4 md:inset-x-8 lg:inset-x-12 z-50 pointer-events-none">
        {/* Single Navigation Bar with 3 Functional Buttons */}
        <div className="mx-auto flex items-center justify-around gap-8 p-3 rounded-full bg-black/60 backdrop-blur-3xl border border-white/10 shadow-luxe w-fit px-10 pointer-events-auto">
          {/* Profile Button */}
          <NavLink
            to={user ? "/profile" : "/auth"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? "text-accent scale-110" : "text-white/70 hover:text-white"
              }`
            }
          >
            <UserIcon className="w-7 h-7" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {t("nav_profile")}
            </span>
          </NavLink>

          {/* Language Switcher */}
          <div className="flex flex-col items-center gap-1">
            <LanguageSwitcher />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-white/70">
              {t("settings_language")}
            </span>
          </div>

          {/* Color Switcher */}
          <div className="flex flex-col items-center gap-1">
            <ColorSwitcher />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-white/70">
              {t("settings_theme")}
            </span>
          </div>
        </div>
    </div>
  );
};
