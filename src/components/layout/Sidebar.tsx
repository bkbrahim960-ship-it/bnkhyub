import { Link, NavLink } from "react-router-dom";
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
  Tv,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

export const Sidebar = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { kidsMode, toggleKidsMode } = useSettings();

  const mainLinks = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/movies", label: t("nav_movies"), icon: Clapperboard },
    { to: "/series", label: t("nav_series"), icon: Tv2 },
    { to: "/my-list", label: lang === "ar" ? "قائمتي" : "Ma Liste", icon: List },
    { to: "/coming-soon", label: lang === "ar" ? "قريباً" : "Bientôt", icon: CalendarClock },
    { to: "/matches", label: lang === "ar" ? "مباريات" : "Matches", icon: Tv },
    { to: "/search", label: t("nav_search"), icon: Search },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    mainLinks.push({ to: "/admin", label: t("nav_admin"), icon: Settings });
  }

  const bottomLinks: { to?: string; label: string; icon: any; onClick?: () => void }[] = [
    {
      label: kidsMode
        ? lang === "ar" ? "إيقاف وضع الأطفال" : "Désactiver Enfants"
        : lang === "ar" ? "وضع الأطفال" : "Mode Enfants",
      icon: Baby,
      onClick: toggleKidsMode,
    },
  ];

  if (!user) {
    bottomLinks.push({ to: "/auth-desktop", label: t("auth_signin"), icon: LogIn });
  }

  bottomLinks.push({ to: "/profile", label: t("nav_profile"), icon: User });

  const activeBg = kidsMode ? "bg-sky-500/20" : "bg-accent/20";

  return (
    <aside
      className="hidden md:flex fixed left-0 inset-y-0 z-[40] flex-col items-center py-3 w-[76px]"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center justify-center w-16 h-16 mb-1 group">
        <img
          src="/logo.png"
          alt="BNKhub"
          className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center justify-between w-full px-2 py-1">
        <div className="flex flex-col items-center gap-1.5">
          {mainLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-tv-nav="main"
              tabIndex={0}
              title={l.label}
              className={({ isActive }) =>
                `relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  isActive
                    ? `${activeBg} ${kidsMode ? "text-sky-300" : "text-accent"}`
                    : "text-foreground/40 hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <l.icon className="w-9 h-9 shrink-0" />
                  {isActive && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full ${kidsMode ? "bg-sky-400" : "bg-accent"}`} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          {bottomLinks.map((l) =>
            l.onClick ? (
              <button
                key={l.label}
                type="button"
                onClick={l.onClick}
                title={l.label}
                className="flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 text-foreground/40 hover:text-foreground"
              >
                <l.icon className="w-9 h-9 shrink-0" />
              </button>
            ) : (
              <NavLink
                key={l.to}
                to={l.to!}
                end
                data-tv-nav="main"
                tabIndex={0}
                title={l.label}
                className={({ isActive }) =>
                  `relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    isActive
                      ? `${activeBg} ${kidsMode ? "text-sky-300" : "text-accent"}`
                      : "text-foreground/40 hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <l.icon className="w-9 h-9 shrink-0" />
                )}
              </NavLink>
            )
          )}
        </div>
      </nav>
    </aside>
  );
};
