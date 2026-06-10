/**
 * BNKhub — Sidebar professionnel pour desktop/TV uniquement.
 */
import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Clapperboard,
  Tv2,
  List,
  CalendarClock,
  Search,
  User,
  Settings,
  Baby,
  LogIn,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useSidebar } from "@/context/SidebarContext";

export const Sidebar = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { kidsMode, toggleKidsMode } = useSettings();
  const location = useLocation();
  const { isCollapsed, setIsCollapsed, isHovered, setIsHovered } = useSidebar();

  useEffect(() => {
    if (isCollapsed) {
      setIsHovered(true);
      const timer = setTimeout(() => setIsHovered(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isCollapsed, setIsHovered]);

  useEffect(() => {
    const w = isExpanded ? (window.innerWidth >= 1024 ? 260 : 240) : 72;
    document.documentElement.style.setProperty("--sidebar-w", `${w}px`);
  }, [isExpanded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle sidebar navigation if not typing in input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        return;
      }

      // Right arrow: expand sidebar when collapsed
      if (e.key === "ArrowRight" && isCollapsed && !isHovered) {
        e.preventDefault();
        setIsHovered(true);
        return;
      }

      // Left arrow: collapse sidebar when expanded
      if (e.key === "ArrowLeft" && !isCollapsed) {
        e.preventDefault();
        setIsCollapsed(true);
        return;
      }

      // Escape: collapse sidebar smoothly
      if (e.key === "Escape" && !isCollapsed) {
        e.preventDefault();
        setIsCollapsed(true);
        setIsHovered(false);
        return;
      }

      // Home: collapse sidebar and go to home
      if (e.key === "Home") {
        e.preventDefault();
        setIsCollapsed(true);
        setIsHovered(false);
        window.location.href = "/";
        return;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isCollapsed, isHovered, setIsCollapsed, setIsHovered]);

  const navLinks = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/movies", label: t("nav_movies"), icon: Clapperboard },
    { to: "/series", label: t("nav_series"), icon: Tv2 },
    { to: "/my-list", label: lang === "ar" ? "قائمتي" : "Ma Liste", icon: List },
    { to: "/coming-soon", label: lang === "ar" ? "قريباً" : "Bientôt", icon: CalendarClock },
    { to: "/search", label: t("nav_search"), icon: Search },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin"), icon: Settings });
  }

  const isExpanded = !isCollapsed || isHovered;

  const navItemClass = (isActive: boolean) => {
    const base =
      "relative flex items-center gap-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";
    const size = isExpanded ? "px-4 py-3 text-base" : "justify-center p-3 mx-auto w-14 h-14";

    if (isActive) {
      return kidsMode
        ? `${base} ${size} bg-sky-500/15 text-sky-300 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]`
        : `${base} ${size} bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.3)]`;
    }
    return `${base} ${size} text-foreground/55 hover:text-foreground hover:bg-white/[0.06]`;
  };

  const iconClass = (isActive: boolean) =>
    `w-[24px] h-[24px] shrink-0 ${
      isActive
        ? kidsMode
          ? "text-sky-300"
          : "text-accent"
        : "text-foreground/45 group-hover:text-foreground/80"
    }`;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex fixed left-0 top-0 bottom-0 z-[40] flex-col border-r transition-all duration-300 ease-out ${
        kidsMode
          ? "bg-[#0c1520]/30 border-sky-500/10"
          : "bg-[#08080c]/30 border-white/[0.06]"
      } backdrop-blur-3xl ${isExpanded ? "w-[240px] lg:w-[260px]" : "w-[72px]"}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={`shrink-0 flex items-center border-b border-white/[0.06] ${isExpanded ? "px-5 h-[72px]" : "justify-center h-[72px]"}`}>
        <Link to="/" className="flex items-center group overflow-hidden">
          <img
            src="/logo.png"
            alt="BNKhub"
            className={`object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(var(--accent-rgb),0.35)] ${
              isExpanded ? "h-16 lg:h-20 w-auto" : "h-10 w-10"
            }`}
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden py-4 px-3 gap-1">
        {isExpanded && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/25">
            {lang === "ar" ? "التصفح" : "Navigation"}
          </p>
        )}

        <nav className="flex flex-col gap-0.5">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-tv-nav="main"
              tabIndex={0}
              title={!isExpanded ? l.label : undefined}
              className={({ isActive }) => `group ${navItemClass(isActive)}`}
            >
              {({ isActive }) => (
                <>
                  <l.icon className={iconClass(isActive)} />
                  {isExpanded && <span className="truncate">{l.label}</span>}
                  {isActive && !isExpanded && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${kidsMode ? "bg-sky-400" : "bg-accent"}`} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="shrink-0 px-3 pb-4 pt-2 border-t border-white/[0.06] flex flex-col gap-0.5">
        {isExpanded && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/25">
            {lang === "ar" ? "الحساب" : "Compte"}
          </p>
        )}

        <button
          type="button"
          onClick={toggleKidsMode}
          title={!isExpanded ? (kidsMode ? "Kids" : "Kids Mode") : undefined}
          className={`group ${navItemClass(kidsMode)}`}
        >
          <Baby className={iconClass(kidsMode)} />
          {isExpanded && (
            <span className="truncate">
              {kidsMode
                ? lang === "ar"
                  ? "إيقاف وضع الأطفال"
                  : "Désactiver Enfants"
                : lang === "ar"
                  ? "وضع الأطفال"
                  : "Mode Enfants"}
            </span>
          )}
        </button>

        {!user && (
          <NavLink
            to="/auth-desktop"
            title={!isExpanded ? t("auth_signin") : undefined}
            className={({ isActive }) => `group ${navItemClass(isActive)}`}
          >
            {({ isActive }) => (
              <>
                <LogIn className={iconClass(isActive)} />
                {isExpanded && <span className="truncate">{t("auth_signin")}</span>}
              </>
            )}
          </NavLink>
        )}

        <NavLink
          to="/profile"
          end
          data-tv-nav="main"
          tabIndex={0}
          title={!isExpanded ? t("nav_profile") : undefined}
          className={({ isActive }) => `group ${navItemClass(isActive)}`}
        >
          {({ isActive }) => (
            <>
              <User className={iconClass(isActive)} />
              {isExpanded && <span className="truncate">{t("nav_profile")}</span>}
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
