import { NavLink } from "react-router-dom";
import { Home, Film, Tv, Search, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const BottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: "/", icon: Home, label: t("nav_home") },
    { to: "/movies", icon: Film, label: t("nav_movies") },
    { to: "/series", icon: Tv, label: t("nav_series") },
    { to: "/search", icon: Search, label: t("nav_search") },
    { to: "/my-list", icon: Heart, label: "Ma liste" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-primary/90 backdrop-blur-xl border-t border-border/50 pb-safe">
      <nav className="flex items-center justify-around px-2 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300 ${
                  isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1.5 rounded-full transition-all duration-300 ${
                      isActive ? "bg-accent/15 scale-110" : "bg-transparent scale-100"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isActive ? "scale-110" : "scale-100"
                      }`}
                    />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full animate-pulse-glow" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${
                      isActive ? "font-bold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
