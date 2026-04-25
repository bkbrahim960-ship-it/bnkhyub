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
    { to: "/movies", icon: Film, label: t("nav_movies") },
    { to: "/series", icon: Tv, label: t("nav_series") },
    { to: "/channels", icon: Monitor, label: t("nav_channels") },
    { to: "/search", icon: Search, label: t("nav_search") },
    { to: "/my-list", icon: Heart, label: t("nav_mylist") },
  ];

  return (
    <div className="fixed bottom-4 inset-x-4 md:inset-x-8 lg:inset-x-12 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Navigation - Main (Left on PC, Center on Mobile) */}
        <nav className="flex items-center gap-1 p-2 rounded-2xl bg-surface-primary/80 backdrop-blur-xl border border-border/50 shadow-luxe overflow-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col md:flex-row items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`
                }
              >
                <Icon className="w-5 h-5 md:w-4 md:h-4" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest hidden xs:block md:block">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Settings & Profile - Right (Hidden on mobile if needed, but keeping for user request) */}
        <div className="hidden md:flex items-center gap-3 p-2 rounded-2xl bg-surface-primary/80 backdrop-blur-xl border border-border/50 shadow-luxe">
          <div className="px-2 border-r border-border/50">
            <ColorSwitcher compact />
          </div>
          <div className="px-2 border-r border-border/50">
            <LanguageSwitcher />
          </div>
          <Link
            to={user ? "/profile" : "/auth"}
            className="flex items-center gap-2 ps-2 pe-4 py-1.5 rounded-xl hover:bg-white/5 transition-all group"
          >
            <div className={`p-1.5 rounded-full ${user ? "bg-accent/20 text-accent" : "bg-surface-card"}`}>
              <UserIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest truncate max-w-[100px]">
              {user ? (user.user_metadata?.username || user.email?.split('@')[0]) : t("nav_profile")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
