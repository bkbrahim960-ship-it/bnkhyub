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
        {/* Single Navigation Bar with 3 Premium Icon Buttons */}
        <div className="mx-auto flex items-center justify-around gap-12 p-2 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 shadow-2xl w-fit px-12 pointer-events-auto">
          {/* Profile Button */}
          <NavLink
            to={user ? "/profile" : "/auth"}
            className={({ isActive }) =>
              `p-3 rounded-full transition-all duration-500 hover:scale-125 active:scale-90 ${
                isActive 
                  ? "text-accent bg-accent/20 shadow-glow-accent border border-accent/40" 
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <UserIcon className="w-8 h-8 md:w-9 md:h-9" />
          </NavLink>

          {/* Language Switcher */}
          <div className="hover:scale-125 transition-transform duration-500">
            <LanguageSwitcher />
          </div>

          {/* Color Switcher */}
          <div className="hover:scale-125 transition-transform duration-500">
            <ColorSwitcher />
          </div>
        </div>
    </div>
  );
};
