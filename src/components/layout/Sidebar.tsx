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

  const bottomLinks: { to?: string; label: string; icon: any; onClick?: () => void; }[] = [
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

  const btnClass = (isActive: boolean) =>
    `flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
      isActive
        ? kidsMode ? "bg-sky-500/15 text-sky-300" : "bg-accent/15 text-accent"
        : "text-foreground/45 hover:text-foreground hover:bg-white/[0.06]"
    }`;

  const iconClass = (isActive: boolean) =>
    `w-8 h-8 shrink-0 ${
      isActive
        ? kidsMode ? "text-sky-300" : "text-accent"
        : "text-foreground/40"
    }`;

  const allLinks = [...mainLinks, ...bottomLinks.map(l => ({ to: l.to || "#", label: l.label, icon: l.icon, onClick: l.onClick }))];

  return (
    <>
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-[40] flex-col items-center py-3 w-[76px]"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center w-12 h-12 mb-1 group">
          <img
            src="/logo.png"
            alt="BNKhub"
            className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Navigation - spread to fill full height */}
        <nav className="flex flex-col items-center justify-between flex-1 w-full px-2 py-1">
          <div className="flex flex-col items-center gap-2">
            {mainLinks.map((l) => (
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
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${kidsMode ? "bg-sky-400" : "bg-accent"}`} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            {bottomLinks.map((l) =>
              l.onClick ? (
                <button
                  key={l.label}
                  type="button"
                  onClick={l.onClick}
                  onMouseEnter={(e) => showTooltip(l.label, e)}
                  onMouseLeave={hideTooltip}
                  className={btnClass(false)}
                >
                  <l.icon className="w-8 h-8 shrink-0 text-foreground/40" />
                </button>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to!}
                  end
                  data-tv-nav="main"
                  tabIndex={0}
                  onMouseEnter={(e) => showTooltip(l.label, e)}
                  onMouseLeave={hideTooltip}
                  onFocus={(e) => showTooltip(l.label, e as any)}
                  onBlur={hideTooltip}
                  className={({ isActive }) => `relative ${btnClass(isActive)}`}
                >
                  {({ isActive }) => (
                    <l.icon className={iconClass(isActive)} />
                  )}
                </NavLink>
              )
            )}
          </div>
        </nav>
      </aside>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-[60] px-4 py-2.5 rounded-xl text-base font-semibold whitespace-nowrap pointer-events-none"
          style={{
            left: `${tooltip.rect.right + 14}px`,
            top: `${tooltip.rect.top + tooltip.rect.height / 2}px`,
            transform: "translateY(-50%)",
            color: "hsl(var(--foreground))",
            backgroundColor: "hsl(var(--bg-elevated) / 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid hsl(var(--border) / 0.3)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
};
