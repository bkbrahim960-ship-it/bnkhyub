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
  ChevronsRight 
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

export const Sidebar = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const { isCollapsed, setIsCollapsed, isHovered, setIsHovered } = useSidebar();

  // Auto-expand when active page changes
  useEffect(() => {
    if (isCollapsed) {
      setIsHovered(true);
      const timer = setTimeout(() => setIsHovered(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isCollapsed]);

  // Remote control support (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && isCollapsed) {
        setIsCollapsed(false);
      } else if (e.key === 'ArrowLeft' && !isCollapsed) {
        setIsCollapsed(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  const navLinks = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/movies", label: t("nav_movies"), icon: Clapperboard },
    { to: "/series", label: t("nav_series"), icon: Tv2 },
    { to: "/my-list", label: lang === "ar" ? "قائمتي" : "Ma Liste", icon: List },
    { to: "/coming-soon", label: lang === "ar" ? "قريباً" : "Bientôt", icon: CalendarClock },
    { to: "/search", label: t("nav_search"), icon: Search },
    { to: user ? "/profile" : "/landing", label: t("nav_profile"), icon: User },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin"), icon: Settings });
  }

  const isExpanded = !isCollapsed || isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex fixed left-0 top-0 bottom-0 z-[90] flex-col bg-surface-elevated/95 backdrop-blur-3xl border-r border-white/10 shadow-2xl transition-all duration-500 ease-in-out ${
        isExpanded ? 'w-64 lg:w-72' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-5 top-1/2 -translate-y-1/2 bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
      </button>

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col p-4 gap-8 overflow-y-auto">
        {/* Logo (collapsed only) */}
        {isCollapsed && (
          <Link to="/" className="flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="BNKhub" 
              className="h-12 w-12 object-contain"
            />
          </Link>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3 py-3 rounded-xl flex items-center gap-3 text-sm lg:text-base font-medium transition-all duration-300 hover:bg-white/5 group ${
                  isActive ? "bg-accent/10 text-accent" : "text-foreground/80 hover:text-foreground"
                } ${!isExpanded ? 'justify-center' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <l.icon 
                    className={`w-6 h-6 ${
                      isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
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
      </div>
    </aside>
  );
};
