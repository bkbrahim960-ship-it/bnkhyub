import { useEffect, useRef, useState } from "react";
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
  Tv,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

export const Sidebar = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { kidsMode, toggleKidsMode } = useSettings();
  const location = useLocation();

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

  const iconClass = (isActive: boolean) =>
    `w-[22px] h-[22px] shrink-0 transition-colors ${
      isActive
        ? kidsMode ? "text-sky-300" : "text-accent"
        : "text-foreground/35 group-hover:text-foreground/80"
    }`;

  const tooltipClass =
    "absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-surface-elevated/95 backdrop-blur-xl border border-border/50 text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 shadow-lg z-50";

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 bottom-0 z-[40] flex-col items-center py-3 w-[60px]"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="shrink-0 mb-3">
        <Link to="/" className="flex items-center justify-center group">
          <img
            src="/logo.png"
            alt="BNKhub"
            className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto gap-0.5 w-full px-2">
        <nav className="flex flex-col items-center gap-0.5 w-full">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-tv-nav="main"
              tabIndex={0}
              className={({ isActive }) =>
                `group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  isActive
                    ? kidsMode
                      ? "bg-sky-500/15 text-sky-300"
                      : "bg-accent/15 text-accent"
                    : "text-foreground/55 hover:bg-white/[0.04]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <l.icon className={iconClass(isActive)} />
                  <span className={tooltipClass}>{l.label}</span>
                  {isActive && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${kidsMode ? "bg-sky-400" : "bg-accent"}`} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="shrink-0 flex flex-col items-center gap-0.5 w-full px-2 pt-2">
        <button
          type="button"
          onClick={toggleKidsMode}
          className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
            kidsMode
              ? "bg-sky-500/15 text-sky-300"
              : "text-foreground/55 hover:bg-white/[0.04]"
          }`}
        >
          <Baby className={`w-[22px] h-[22px] shrink-0 transition-colors ${
            kidsMode ? "text-sky-300" : "text-foreground/35 group-hover:text-foreground/80"
          }`} />
          <span className={tooltipClass}>
            {kidsMode
              ? lang === "ar" ? "إيقاف وضع الأطفال" : "Désactiver Enfants"
              : lang === "ar" ? "وضع الأطفال" : "Mode Enfants"}
          </span>
        </button>

        {!user && (
          <NavLink
            to="/auth-desktop"
            className={({ isActive }) =>
              `group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-foreground/55 hover:bg-white/[0.04]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LogIn className={iconClass(isActive)} />
                <span className={tooltipClass}>{t("auth_signin")}</span>
              </>
            )}
          </NavLink>
        )}

        <NavLink
          to="/profile"
          end
          data-tv-nav="main"
          tabIndex={0}
          className={({ isActive }) =>
            `group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              isActive
                ? "bg-accent/15 text-accent"
                : "text-foreground/55 hover:bg-white/[0.04]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User className={iconClass(isActive)} />
              <span className={tooltipClass}>{t("nav_profile")}</span>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
