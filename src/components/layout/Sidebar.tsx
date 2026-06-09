/**
 * BNKhub — Modern Right Sidebar for desktop/TV (collapsible, remote-friendly)
 */
import { useEffect } from "react";
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
  ChevronsLeft, 
  ChevronsRight,
  Baby,
  LogIn
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

  // Auto-expand when active page changes
  useEffect(() => {
    if (isCollapsed) {
      setIsHovered(true);
      const timer = setTimeout(() => setIsHovered(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isCollapsed, setIsHovered]);

  // Remote control support (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && isCollapsed) {
        setIsCollapsed(false);
      } else if (e.key === "ArrowLeft" && !isCollapsed) {
        setIsCollapsed(true);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed, setIsCollapsed]);

  // Navigation links with Kids Mode first, then Profile
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

  // Sidebar background and border colors based on kids mode
  const sidebarBg = kidsMode 
    ? "bg-sky-900/95 border-sky-500/30" 
    : "bg-surface-elevated/95 border-white/10";
  
  const toggleBtnBg = kidsMode ? "bg-sky-500" : "bg-accent";

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex fixed left-0 top-0 bottom-0 z-[90] flex-col backdrop-blur-3xl border-r shadow-2xl transition-all duration-500 ease-in-out ${sidebarBg} ${
        isExpanded ? "w-64 lg:w-72" : "w-20"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-5 top-1/2 -translate-y-1/2 ${toggleBtnBg} text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10`}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
      </button>

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col p-0 gap-0 overflow-y-auto">
        {/* Logo (collapsed only) */}
        {isCollapsed && (
          <Link to="/" className="flex items-center justify-center py-6">
            <img 
              src="/logo.png" 
              alt="BNKhub" 
              className="h-12 w-12 object-contain"
            />
          </Link>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-0">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-tv-nav="main"
              tabIndex={0}
              className={({ isActive }) =>
                `w-full px-6 py-4 flex items-center gap-4 text-sm lg:text-base font-medium transition-all duration-300 hover:bg-white/5 group ${
                  isActive 
                    ? (kidsMode ? "bg-sky-400/20 text-sky-400 border-l-4 border-sky-400" : "bg-accent/10 text-accent border-l-4 border-accent") 
                    : `text-foreground/80 hover:text-foreground hover:bg-white/5`
                } ${!isExpanded ? "justify-center px-0 py-4" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <l.icon 
                    className={`w-6 h-6 flex-shrink-0 ${
                      isActive 
                        ? (kidsMode ? "text-sky-400" : "text-accent") 
                        : "text-muted-foreground group-hover:text-foreground"
                    }`} 
                  />
                  {isExpanded && (
                    <span className="truncate">{l.label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className={`h-px ${kidsMode ? "bg-sky-500/30" : "bg-white/10"} mx-4`} />

        {/* Kids Mode Button (swapped with Profile) */}
        <button
          onClick={toggleKidsMode}
          className={`w-full px-6 py-4 flex items-center gap-4 text-sm lg:text-base font-medium transition-all duration-300 hover:bg-white/5 group ${
            kidsMode 
              ? "text-sky-400 bg-sky-400/10 border-l-4 border-sky-400" 
              : "text-foreground/80 hover:text-foreground"
          } ${!isExpanded ? "justify-center px-0 py-4" : ""}`}
        >
          <Baby className={`w-6 h-6 flex-shrink-0 ${kidsMode ? "text-sky-400" : "text-muted-foreground group-hover:text-foreground"}`} />
          {isExpanded && (
            <span className="truncate">{kidsMode ? (lang === "ar" ? "إيقاف وضع الأطفال" : "Désactiver Mode Enfants") : (lang === "ar" ? "وضع الأطفال" : "Mode Enfants")}</span>
          )}
        </button>

        {/* Sign In (desktop/TV only, when not logged in) */}
        {!user && (
          <NavLink
            to="/auth-desktop"
            className={({ isActive }) =>
              `w-full px-6 py-4 flex items-center gap-4 text-sm lg:text-base font-medium transition-all duration-300 hover:bg-white/5 group ${
                isActive
                  ? (kidsMode ? "bg-sky-400/20 text-sky-400 border-l-4 border-sky-400" : "bg-accent/10 text-accent border-l-4 border-accent")
                  : "text-foreground/80 hover:text-foreground hover:bg-white/5"
              } ${!isExpanded ? "justify-center px-0 py-4" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <LogIn
                  className={`w-6 h-6 flex-shrink-0 ${
                    isActive
                      ? (kidsMode ? "text-sky-400" : "text-accent")
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {isExpanded && (
                  <span className="truncate">{t("auth_signin")}</span>
                )}
              </>
            )}
          </NavLink>
        )}

        {/* Profile Button (now at the end) */}
        <NavLink
          to="/profile"
          end
          className={({ isActive }) =>
            `w-full px-6 py-4 flex items-center gap-4 text-sm lg:text-base font-medium transition-all duration-300 hover:bg-white/5 group ${
              isActive 
                ? (kidsMode ? "bg-sky-400/20 text-sky-400 border-l-4 border-sky-400" : "bg-accent/10 text-accent border-l-4 border-accent") 
                : `text-foreground/80 hover:text-foreground hover:bg-white/5`
            } ${!isExpanded ? "justify-center px-0 py-4" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <User 
                className={`w-6 h-6 flex-shrink-0 ${
                  isActive 
                    ? (kidsMode ? "text-sky-400" : "text-accent") 
                    : "text-muted-foreground group-hover:text-foreground"
                }`} 
              />
              {isExpanded && (
                <span className="truncate">{t("nav_profile")}</span>
              )}
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
