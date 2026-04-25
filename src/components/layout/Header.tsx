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
import { InstallButton } from "@/components/pwa/InstallButton";

export const Header = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
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
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin") });
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ease-luxe ${scrolled
          ? "bg-surface-primary/80 backdrop-blur-xl border-b border-border/60"
          : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
    >
      <div className="w-full px-6 md:px-12 lg:px-16 flex items-center h-16 md:h-20 lg:h-24">
        {/* Logo - Left */}
        <div className="flex items-center group shrink-0 cursor-pointer me-12" onClick={() => {
          const el = document.getElementById("main-logo-container");
          if (el) {
            el.classList.add("animate-logo-jump");
            setTimeout(() => {
              el.classList.remove("animate-logo-jump");
              window.location.href = "/";
            }, 800);
          }
        }}>
          <div id="main-logo-container" className="w-10 h-10 xs:w-12 xs:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-black/40 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-accent group-hover:shadow-glow transition-all duration-500 relative group-hover:scale-105">
            <img 
              src="/icon.png" 
              alt="Logo"
              style={{ 
                filter: `drop-shadow(0 0 8px hsl(var(--accent) / 0.5))`,
              }}
              className="w-full h-full object-cover theme-icon-colored transition-transform duration-700 scale-[1.1] group-hover:scale-[1.3]"
            />
          </div>
          <div className="flex flex-col leading-none ms-2 md:ms-3 lg:ms-4">
            <span className="font-display font-bold text-xl xs:text-2xl md:text-3xl lg:text-4xl tracking-tighter transition-colors group-hover:text-accent">
              BNK<span className="text-accent group-hover:text-foreground transition-colors">hub</span>
            </span>
          </div>
        </div>

        {/* Nav desktop & TV - Middle (Centered) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-10 xl:gap-14">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-2 py-2 text-sm lg:text-base xl:text-lg font-bold uppercase tracking-widest transition-all duration-300 relative focus:text-accent focus:outline-none hover:scale-110 active:scale-95 ${isActive ? "text-accent" : "text-foreground/70 hover:text-foreground"
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

        {/* Actions - Right */}
        <div className="flex items-center justify-end gap-2 md:gap-4 lg:gap-6 shrink-0 ms-12">
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
            <ColorSwitcher compact />
          </div>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <div className="hidden md:block">
            <InstallButton />
          </div>

          <Link
            to={user ? "/profile" : "/auth"}
            className="flex items-center gap-2 p-1 md:p-1.5 pe-3 rounded-full hover:bg-surface-card transition-all border border-transparent hover:border-border group focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={t("nav_profile")}
            title={t("nav_profile")}
          >
            <div className={`p-1.5 md:p-2 rounded-full transition-colors ${user ? "bg-accent/20 text-accent group-hover:bg-accent/30" : "bg-surface-card"}`}>
              <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            {user && (
              <span className="hidden md:block text-xs lg:text-sm font-medium max-w-[120px] truncate">
                {user.user_metadata?.username || user.email?.split('@')[0]}
              </span>
            )}
          </Link>

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
