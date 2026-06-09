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
  Bell, 
  Baby, 
  User, 
  Settings, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { InstallButton } from "@/components/pwa/InstallButton";
import { useSettings } from "@/context/SettingsContext";
import { useImmersiveMode } from "@/hooks/useImmersiveMode";
import { SmileSVG } from "@/pages/Profile";
import { useSidebar } from "@/context/SidebarContext";

export const Sidebar = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { kidsMode, toggleKidsMode } = useSettings();
  const immersiveHidden = useImmersiveMode();
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
      } ${immersiveHidden ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}
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

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all group ${!isExpanded ? 'justify-center' : ''}`}>
                <Bell className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
                {isExpanded && (
                  <>
                    <span className="text-sm font-medium">{t("profile_notifications")}</span>
                    <span className="ml-auto w-2.5 h-2.5 bg-accent border-2 border-surface-elevated rounded-full animate-pulse" />
                  </>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] bg-surface-card/95 backdrop-blur-2xl border-white/5 p-0 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-accent/10 to-transparent">
                <h4 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {t("profile_notifications")}
                </h4>
                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">3 Nouveaux</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
                <Link
                  to="/movie/76600"
                  className="flex items-start gap-4 p-4 hover:bg-white/5 transition-all group"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-accent/40 transition-colors">
                    <img src="https://image.tmdb.org/t/p/w200/t6Sna4asZ9fS6YpOiY782X69Yn0.jpg" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-black text-white group-hover:text-accent transition-colors">Avatar: The Way of Water</p>
                      <span className="w-2 h-2 bg-accent rounded-full" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">Le chef-d'œuvre de James Cameron est maintenant disponible en 4K Ultra HD sur BNKhub.</p>
                    <p className="text-[9px] text-accent/60 mt-2 font-black uppercase tracking-tighter">Il y a 2h</p>
                  </div>
                </Link>
                <Link
                  to="/series/1396"
                  className="flex items-start gap-4 p-4 hover:bg-white/5 transition-all group"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-accent/40 transition-colors">
                    <img src="https://image.tmdb.org/t/p/w200/ztkUQvFCz9Z96mZCNm60rxkv0BT.jpg" alt="Breaking Bad" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-black text-white group-hover:text-accent transition-colors">Breaking Bad: S05E16</p>
                      <span className="w-2 h-2 bg-accent rounded-full" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Le dernier épisode de la série culte est prêt à être visionné.</p>
                    <p className="text-[9px] text-accent/60 mt-2 font-black uppercase tracking-tighter">Il y a 5h</p>
                  </div>
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* Language Switcher */}
          <div className={`flex items-center gap-3 px-3 py-3 ${!isExpanded ? 'justify-center' : ''}`}>
            <LanguageSwitcher />
            {isExpanded && (
              <span className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "اللغة" : "Langue"}</span>
            )}
          </div>

          {/* Kids Mode */}
          <button
            onClick={toggleKidsMode}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              kidsMode 
                ? "text-sky-400 bg-sky-400/10 border border-sky-400/30" 
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            } ${!isExpanded ? 'justify-center' : ''}`}
          >
            <Baby className="w-6 h-6" />
            {isExpanded && (
              <span className="text-sm font-medium">{kidsMode ? (lang === "ar" ? "إيقاف وضع الأطفال" : "Désactiver Mode Enfants") : (lang === "ar" ? "وضع الأطفال" : "Mode Enfants")}</span>
            )}
          </button>

          {/* Install Button */}
          <div className={`flex items-center gap-3 px-3 py-3 ${!isExpanded ? 'justify-center' : ''}`}>
            {isExpanded ? (
              <>
                <InstallButton />
                <span className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "تثبيت التطبيق" : "Installer App"}</span>
              </>
            ) : (
              <InstallButton />
            )}
          </div>

          {/* Profile */}
          <div className={`flex items-center gap-3 px-3 py-3 ${!isExpanded ? 'justify-center' : ''}`}>
            <NavLink
              to={user ? "/profile" : "/auth"}
              className={({ isActive }) =>
                `relative w-12 h-12 rounded-full overflow-hidden transition-all border-2 border-white/10 bg-accent ${
                  isActive 
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-surface-elevated" 
                    : "opacity-80 hover:opacity-100"
                }`
              }
            >
              <SmileSVG />
              {user && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black/80" />
              )}
            </NavLink>
            {isExpanded && (
              <span className="text-sm font-medium">{user ? (lang === "ar" ? "الملف الشخصي" : "Profil") : (lang === "ar" ? "تسجيل الدخول" : "Connexion")}</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
