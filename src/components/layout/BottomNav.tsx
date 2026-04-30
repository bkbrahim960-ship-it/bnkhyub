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
    <div className="fixed bottom-4 inset-x-4 md:inset-x-8 lg:inset-x-12 z-50 pointer-events-none">
        {/* Single Navigation Bar with 3 Buttons */}
        <nav className="mx-auto flex items-center justify-around gap-2 p-2 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 shadow-luxe w-fit px-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-300 ${
                    isActive ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
    </div>
  );
};
