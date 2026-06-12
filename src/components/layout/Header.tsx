/**
 * BNKhub — Header mobile uniquement (logo + menu).
 * Sur desktop/TV le header est masqué — le logo est dans la sidebar.
 */
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useImmersiveMode } from "@/hooks/useImmersiveMode";

export const Header = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const immersiveHidden = useImmersiveMode();

  const navLinks = [
    { to: "/", label: t("nav_home") },
    { to: "/movies", label: t("nav_movies") },
    { to: "/series", label: t("nav_series") },
    { to: "/my-list", label: lang === "ar" ? "قائمتي" : "Ma Liste" },
    { to: "/coming-soon", label: lang === "ar" ? "قريباً" : "Bientôt" },
    { to: "/matches", label: lang === "ar" ? "مباريات" : "Matches" },
    { to: "/profile", label: t("nav_profile") },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin") });
  }

  return (
    <header
      className={`md:hidden fixed top-0 inset-x-0 z-[100] pt-safe bg-gradient-to-b from-black/80 to-transparent transition-all duration-500 ${
        immersiveHidden ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="w-full px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center group shrink-0">
          <img
            src="/logo.png"
            alt="BNKhub"
            className="h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] -ml-2"
          />
        </Link>

        <div className="flex items-center gap-2">
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `p-2 rounded-full transition-colors ${
                isActive ? "text-accent bg-accent/10" : "text-white/70 hover:text-white hover:bg-white/5"
              }`
            }
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </NavLink>
          <button
            className="p-2 rounded-full hover:bg-surface-card focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="bg-surface-primary/95 backdrop-blur-xl border-t border-border animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `py-3 px-3 rounded-lg text-sm font-medium ${
                    isActive ? "bg-accent/10 text-accent" : "text-foreground/80"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <NavLink
                to="/search"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `py-3 px-3 rounded-lg text-sm font-medium ${
                    isActive ? "bg-accent/10 text-accent" : "text-foreground/80"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5" />
                  {t("nav_search")}
                </div>
              </NavLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
