/**
 * BNKhub — Header luxury fixe avec blur et logo seulement (desktop).
 */
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useImmersiveMode } from "@/hooks/useImmersiveMode";
import { useSidebar } from "@/context/SidebarContext";

export const Header = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { kidsMode } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const immersiveHidden = useImmersiveMode();
  const { isCollapsed, isHovered } = useSidebar();
  const isSidebarExpanded = !isCollapsed || isHovered;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { to: "/", label: t("nav_home") },
    { to: "/movies", label: t("nav_movies") },
    { to: "/series", label: t("nav_series") },
    { to: "/my-list", label: lang === "ar" ? "قائمتي" : "Ma Liste" },
    { to: "/coming-soon", label: lang === "ar" ? "قريباً" : "Bientôt" },
    { to: "/search", label: t("nav_search") },
    { to: user ? "/profile" : "/landing", label: t("nav_profile") },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin") });
  }

  const headerBg = kidsMode
    ? (scrolled ? "bg-white/40 backdrop-blur-3xl border-b border-sky-200" : "bg-gradient-to-b from-white/60 to-transparent")
    : (scrolled ? "bg-black/20 backdrop-blur-3xl border-b border-white/5" : "bg-gradient-to-b from-black/80 to-transparent");

  return (
    <header
      className={`fixed top-0 inset-x-0 ${
        isSidebarExpanded ? 'md:left-64 lg:left-72' : 'md:left-20'
      } z-[100] transition-all duration-500 ease-luxe pt-safe ${headerBg} ${immersiveHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
    >

      <div className="w-full px-4 md:px-10 lg:px-16 flex items-center justify-between h-16 md:h-20 lg:h-24">
        {/* Logo */}
        <Link to="/" className="flex items-center group shrink-0 relative z-[110]">
          <img 
            src="/logo.png" 
            alt="BNKhub" 
            className="h-28 md:h-40 lg:h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] -ml-4 md:-ml-8 translate-y-1 md:translate-y-2 lg:translate-y-3"
          />
        </Link>

        {/* Only show menu button on mobile */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-surface-card focus:outline-none focus:ring-2 focus:ring-accent"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Nav mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-primary/95 backdrop-blur-xl border-t border-border animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `py-3 px-3 rounded-lg text-sm font-medium ${isActive ? "bg-accent/10 text-accent" : "text-foreground/80"
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
                  `py-3 px-3 rounded-lg text-sm font-medium ${isActive ? "bg-accent/10 text-accent" : "text-foreground/80"
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
