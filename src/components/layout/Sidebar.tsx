import { useState } from "react";
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
  const [tooltip, setTooltip] = useState<{ text: string; rect: DOMRect } | null>(null);

  const showTooltip = (text: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ text, rect });
  };
  const hideTooltip = () => setTooltip(null);

  const navLinks = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/movies", label: t("nav_movies"), icon: Clapperboard },
    { to: "/series", label: t("nav_series"), icon: Tv2 },
    { to: "/my-list", label: lang === "ar" ? "قائمتي" : "Ma Liste", icon: List },
    { to: "/coming-soon", label: lang === "ar" ? "قريباً" : "Bientôt", icon: CalendarClock },
    { to: "/matches", label: lang === "ar" ? "مباريات" : "Matches", icon: Tv },
    { to: "/search", label: t("nav_search"), icon: Search },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin"), icon: Settings });
  }

  const btnClass = (isActive: boolean) =>
    `flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
      isActive
        ? kidsMode ? "bg-sky-500/15 text-sky-300" : "bg-accent/15 text-accent"
        : "text-foreground/40 hover:text-foreground hover:bg-white/[0.04]"
    }`;

  const iconClass = (isActive: boolean) =>
    `w-6 h-6 shrink-0 ${
      isActive
        ? kidsMode ? "text-sky-300" : "text-accent"
        : "text-foreground/35"
    }`;

  return (
    <>
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-[40] flex-col items-center py-4 gap-1 w-[68px]"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center w-12 h-12 mb-2 group">
          <img
            src="/logo.png"
            alt="BNKhub"
            className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-tv-nav="main"
              tabIndex={0}
              onMouseEnter={(e) => showTooltip(l.label, e)}
              onMouseLeave={hideTooltip}
              onFocus={(e) => showTooltip(l.label, e as any)}
              onBlur={hideTooltip}
              className={({ isActive }) => `relative ${btnClass(isActive)}`}
            >
              {({ isActive }) => (
                <>
                  <l.icon className={iconClass(isActive)} />
                  {isActive && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${kidsMode ? "bg-sky-400" : "bg-accent"}`} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom items */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={toggleKidsMode}
            onMouseEnter={(e) => showTooltip(
              kidsMode
                ? lang === "ar" ? "إيقاف وضع الأطفال" : "Désactiver Enfants"
                : lang === "ar" ? "وضع الأطفال" : "Mode Enfants",
              e
            )}
            onMouseLeave={hideTooltip}
            className={`${btnClass(kidsMode)}`}
          >
            <Baby className={`w-6 h-6 shrink-0 ${kidsMode ? "text-sky-300" : "text-foreground/35"}`} />
          </button>

          {!user && (
            <NavLink
              to="/auth-desktop"
              onMouseEnter={(e) => showTooltip(t("auth_signin"), e)}
              onMouseLeave={hideTooltip}
              onFocus={(e) => showTooltip(t("auth_signin"), e as any)}
              onBlur={hideTooltip}
              className={({ isActive }) => btnClass(isActive)}
            >
              {({ isActive }) => (
                <LogIn className={iconClass(isActive)} />
              )}
            </NavLink>
          )}

          <NavLink
            to="/profile"
            end
            data-tv-nav="main"
            tabIndex={0}
            onMouseEnter={(e) => showTooltip(t("nav_profile"), e)}
            onMouseLeave={hideTooltip}
            onFocus={(e) => showTooltip(t("nav_profile"), e as any)}
            onBlur={hideTooltip}
            className={({ isActive }) => btnClass(isActive)}
          >
            {({ isActive }) => (
              <User className={iconClass(isActive)} />
            )}
          </NavLink>
        </div>
      </aside>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-[60] px-3.5 py-2 rounded-xl bg-surface-elevated/95 backdrop-blur-xl border border-border/50 text-sm font-medium whitespace-nowrap shadow-xl pointer-events-none"
          style={{
            left: `${tooltip.rect.right + 14}px`,
            top: `${tooltip.rect.top + tooltip.rect.height / 2}px`,
            transform: "translateY(-50%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
};
