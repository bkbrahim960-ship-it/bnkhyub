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
import { ColorSwitcher } from "@/components/ui/ColorSwitcher";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useSettings } from "@/context/SettingsContext";

export const Header = () => {
  const { t } = useLanguage();
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
    { to: "/search", label: t("nav_search") },
    { to: user ? "/profile" : "/auth", label: t("nav_profile") },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin") });
  }

  const headerBg = kidsMode 
    ? (scrolled ? "bg-white/40 backdrop-blur-3xl border-b border-pink-200" : "bg-gradient-to-b from-white/60 to-transparent")
    : (scrolled ? "bg-black/20 backdrop-blur-3xl border-b border-white/5" : "bg-gradient-to-b from-black/80 to-transparent");

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ease-luxe pt-safe ${headerBg}`}
    >
      <div className="w-full px-4 md:px-10 lg:px-16 flex items-center justify-between h-16 md:h-20 lg:h-24">
        {/* Logo */}
        <Link to="/" className="flex items-center group shrink-0">
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-2xl xs:text-3xl md:text-4xl lg:text-5xl tracking-tighter transition-colors group-hover:text-accent">
              BNK<span className="text-accent group-hover:text-foreground transition-colors">hub</span>
            </span>
            <span className="hidden sm:block font-decorative text-[8px] md:text-[10px] lg:text-[12px] text-muted-foreground tracking-[0.2em] uppercase opacity-60">
              {t("tagline")}
            </span>
          </div>
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
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent border-2 border-surface-primary rounded-full" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 md:w-80 bg-surface-card border-border p-4 shadow-luxe animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-accent mb-4">{t("profile_notifications")}</h4>
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-surface-primary border border-border/40 hover:border-accent/40 transition-colors cursor-pointer group">
                  <p className="text-xs font-bold group-hover:text-accent transition-colors">Avatar: The Way of Water</p>
                  <p className="text-[10px] text-muted-foreground">Maintenant disponible en 4K Ultra HD.</p>
                  <p className="text-[9px] text-accent/60 mt-1 uppercase font-bold">2h ago</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-primary border border-border/40 hover:border-accent/40 transition-colors cursor-pointer group">
                  <p className="text-xs font-bold group-hover:text-accent transition-colors">Remote Control Active</p>
                  <p className="text-[10px] text-muted-foreground">Contrôlez votre TV depuis votre smartphone.</p>
                  <p className="text-[9px] text-accent/60 mt-1 uppercase font-bold">New</p>
                </div>
              </div>
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
              <ColorSwitcher compact />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
