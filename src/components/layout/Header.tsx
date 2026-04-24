/**
 * BNKhub — Header luxury fixe avec blur, logo, nav, langue, thème, install, profil.
 */
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Menu, X, User as UserIcon } from "lucide-react";
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
    { to: "/search", label: t("nav_search") },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: "Admin Panel" });
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-luxe ${scrolled
          ? "bg-surface-primary/80 backdrop-blur-xl border-b border-border/60"
          : "bg-gradient-to-b from-black/60 to-transparent"
        }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black overflow-hidden flex items-center justify-center shadow-accent group-hover:shadow-glow transition-all duration-500 border border-white/10 relative group-hover:scale-105">
            <img
              src="/icon.png"
              alt="BNKhub Logo"
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen theme-icon scale-[1.3] group-hover:scale-[1.5] transition-transform duration-700"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-xl md:text-3xl tracking-tighter transition-colors group-hover:text-accent">
              BNK<span className="text-accent group-hover:text-foreground transition-colors">hub</span>
            </span>
            <span className="hidden sm:block font-decorative text-[11px] text-muted-foreground tracking-[0.2em] uppercase opacity-80">
              {t("tagline")}
            </span>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-300 relative ${isActive ? "text-accent" : "text-foreground/80 hover:text-foreground"
                } after:content-[''] after:absolute after:-bottom-1.5 after:start-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 ${""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 inset-x-0 h-[2px] bg-gradient-accent transition-transform duration-300 origin-center ${isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/search"
            className="p-2 rounded-full hover:bg-surface-card transition-colors"
            aria-label={t("nav_search")}
          >
            <Search className="w-5 h-5" />
          </Link>
          <div className="hidden lg:block">
            <ColorSwitcher compact />
          </div>
          <LanguageSwitcher />
          <InstallButton />

          <Link
            to={user ? "/profile" : "/auth"}
            className="flex items-center gap-2 p-1.5 pe-3 rounded-full hover:bg-surface-card transition-colors border border-transparent hover:border-border"
            aria-label={t("nav_profile")}
            title={t("nav_profile")}
          >
            <div className={`p-1.5 rounded-full ${user ? "bg-accent/20 text-accent" : "bg-surface-card"}`}>
              <UserIcon className="w-4 h-4" />
            </div>
            {user && (
              <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate">
                {user.user_metadata?.username || user.email?.split('@')[0]}
              </span>
            )}
          </Link>

          <button
            className="md:hidden p-2 rounded-full hover:bg-surface-card"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
