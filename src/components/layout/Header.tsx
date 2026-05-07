/**
 * BNKhub — Header luxury fixe avec blur, logo, nav, langue, thème, install, profil.
 */
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Menu, X, User as UserIcon, Bell } from "lucide-react";
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

export const Header = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { kidsMode } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    { to: "/channels", label: t("nav_channels") },
    { to: "/coming-soon", label: lang === "ar" ? "قريباً" : "Bientôt" },
    { to: "/search", label: t("nav_search") },
    { to: user ? "/profile" : "/auth", label: t("nav_profile") },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin") });
  }

  const headerBg = kidsMode 
    ? (scrolled ? "bg-white/40 backdrop-blur-3xl border-b border-sky-200" : "bg-gradient-to-b from-white/60 to-transparent")
    : (scrolled ? "bg-black/20 backdrop-blur-3xl border-b border-white/5" : "bg-gradient-to-b from-black/80 to-transparent");

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ease-luxe pt-safe ${headerBg}`}
    >
      <div className="w-full px-4 md:px-10 lg:px-16 flex items-center justify-between h-16 md:h-20 lg:h-24">
        {/* Logo PNG */}
        <Link to="/" className="flex items-center group shrink-0">
          <img 
            src="/logo.png" 
            alt="BNKhub" 
            className="h-10 md:h-12 lg:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Nav desktop & TV */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 text-sm lg:text-base font-medium transition-all duration-300 relative focus:text-accent focus:outline-none hover:scale-110 active:scale-95 ${isActive ? "text-accent" : "text-foreground/80 hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span
                    className={`absolute -bottom-1 inset-x-0 h-[3px] bg-gradient-accent transition-transform duration-300 origin-center rounded-full ${isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 xs:gap-2 md:gap-4 lg:gap-6">
          <Link
            to="/search"
            className="p-2 md:p-3 rounded-full hover:bg-surface-card transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={t("nav_search")}
          >
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 md:p-3 rounded-full hover:bg-surface-card transition-all focus:outline-none focus:ring-2 focus:ring-accent">
                <Bell className="w-5 h-5 md:w-6 md:h-6" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent border-2 border-surface-primary rounded-full animate-pulse" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] md:w-[380px] bg-surface-card/95 backdrop-blur-2xl border-white/5 p-0 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-accent/10 to-transparent">
                <h4 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
                   <Bell className="w-4 h-4" />
                   {t("profile_notifications")}
                </h4>
                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">3 Nouveaux</span>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
                {/* Notification: New Movie */}
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

                {/* Notification: New Episode */}
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

                {/* Notification: Remote Control */}
                <Link 
                  to="/remote" 
                  className="flex items-start gap-4 p-4 hover:bg-white/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20 group-hover:bg-accent/20 transition-colors">
                    <Search className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white group-hover:text-accent transition-colors">Contrôle à distance</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Connectez votre smartphone pour piloter votre Smart TV en toute fluidité.</p>
                    <p className="text-[9px] text-accent/60 mt-2 font-black uppercase tracking-tighter">Nouveau</p>
                  </div>
                </Link>
              </div>

              <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-white hover:bg-white/5 border-t border-white/5 transition-all">
                Tout marquer comme lu
              </button>
            </PopoverContent>
          </Popover>

          <div className="hidden lg:block">
            {/* Moved to Bottom Bar */}
          </div>
          <div className="hidden sm:block">
            {/* Moved to Bottom Bar */}
          </div>
          <div className="hidden md:block">
            <InstallButton />
          </div>

          <button
            className="md:hidden p-2 rounded-full hover:bg-surface-card focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
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
