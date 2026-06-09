/**
 * BNKhub — Sidebar desktop/TV : masqué par défaut, affiché au survol/s glissement.
 */
import { useEffect, useRef } from "react";
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
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { SIDEBAR_WIDTH, useSidebar } from "@/context/SidebarContext";

const DRAG_THRESHOLD = 48;
const EDGE_ZONE = 14;

export const Sidebar = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { kidsMode, toggleKidsMode } = useSettings();
  const location = useLocation();
  const { isOpen, setIsOpen } = useSidebar();

  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setIsOpen(false), 400);
  };

  useEffect(() => {
    setIsOpen(true);
    const timer = setTimeout(() => setIsOpen(false), 1200);
    return () => clearTimeout(timer);
  }, [location.pathname, setIsOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIsOpen(true);
      else if (e.key === "ArrowLeft") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  const onDragStart = (clientX: number) => {
    dragStartX.current = clientX;
    isDragging.current = true;
  };

  const onDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    const delta = clientX - dragStartX.current;
    if (!isOpen && delta > DRAG_THRESHOLD) setIsOpen(true);
    if (isOpen && delta < -DRAG_THRESHOLD) setIsOpen(false);
  };

  const onDragEnd = () => {
    isDragging.current = false;
  };

  const navLinks = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/movies", label: t("nav_movies"), icon: Clapperboard },
    { to: "/series", label: t("nav_series"), icon: Tv2 },
    { to: "/my-list", label: lang === "ar" ? "قائمتي" : "Ma Liste", icon: List },
    { to: "/coming-soon", label: lang === "ar" ? "قريباً" : "Bientôt", icon: CalendarClock },
    { to: "/search", label: t("nav_search"), icon: Search },
  ];

  if (user?.email === "bkbrahim960@gmail.com") {
    navLinks.push({ to: "/admin", label: t("nav_admin"), icon: Settings });
  }

  const bottomItems = [
    {
      type: "button" as const,
      key: "kids",
      label: kidsMode
        ? lang === "ar"
          ? "إيقاف وضع الأطفال"
          : "Désactiver Enfants"
        : lang === "ar"
          ? "وضع الأطفال"
          : "Mode Enfants",
      icon: Baby,
      active: kidsMode,
      onClick: toggleKidsMode,
    },
    ...(!user
      ? [
          {
            type: "link" as const,
            key: "signin",
            to: "/auth-desktop",
            label: t("auth_signin"),
            icon: LogIn,
          },
        ]
      : []),
    {
      type: "link" as const,
      key: "profile",
      to: "/profile",
      label: t("nav_profile"),
      icon: User,
      end: true,
    },
  ];

  const itemClass = (isActive: boolean) => {
    const base =
      "group relative flex flex-1 items-center gap-4 w-full px-5 font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50 min-h-0";
    if (isActive) {
      return kidsMode
        ? `${base} bg-sky-500/20 text-sky-200`
        : `${base} bg-accent/20 text-accent`;
    }
    return `${base} text-foreground/70 hover:text-foreground hover:bg-white/[0.05]`;
  };

  const iconClass = (isActive: boolean) =>
    `w-7 h-7 lg:w-8 lg:h-8 shrink-0 ${
      isActive
        ? kidsMode
          ? "text-sky-200"
          : "text-accent"
        : "text-foreground/50 group-hover:text-foreground/90"
    }`;

  const sidebarBg = kidsMode
    ? "bg-[#0c1520]/98 border-sky-500/15"
    : "bg-[#07070a]/98 border-white/[0.07]";

  return (
    <>
      {/* Zone de déclenchement gauche — survol & glissement pour ouvrir */}
      {!isOpen && (
        <div
          className="hidden md:block fixed left-0 top-0 bottom-0 z-[91] cursor-e-resize"
          style={{ width: EDGE_ZONE }}
          onMouseEnter={() => {
            cancelClose();
            setIsOpen(true);
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            onDragStart(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) onDragMove(e.clientX);
          }}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 rounded-r-full ${
              kidsMode ? "bg-sky-400/60" : "bg-accent/50"
            }`}
          />
        </div>
      )}

      <aside
        style={{ width: SIDEBAR_WIDTH }}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          onDragStart(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) onDragMove(e.clientX);
        }}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        className={`hidden md:flex fixed left-0 top-0 bottom-0 z-[90] flex-col border-r backdrop-blur-2xl transition-transform duration-300 ease-out touch-none ${sidebarBg} ${
          isOpen ? "translate-x-0 shadow-[4px_0_40px_rgba(0,0,0,0.5)]" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="shrink-0 flex items-center justify-center h-[88px] border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors"
        >
          <img
            src="/logo.png"
            alt="BNKhub"
            className="h-[72px] lg:h-[80px] w-auto object-contain drop-shadow-[0_0_24px_rgba(var(--accent-rgb),0.4)]"
          />
        </Link>

        {/* Tous les éléments — hauteur égale, sans espaces */}
        <div className="flex-1 flex flex-col min-h-0">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-tv-nav="main"
              tabIndex={0}
              className={({ isActive }) => itemClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 ${kidsMode ? "bg-sky-400" : "bg-accent"}`}
                    />
                  )}
                  <l.icon className={iconClass(isActive)} />
                  <span className="text-base lg:text-lg truncate">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="flex flex-col flex-1 min-h-0 border-t border-white/[0.06]">
            {bottomItems.map((item) =>
              item.type === "button" ? (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className={itemClass(!!item.active)}
                >
                  <item.icon className={iconClass(!!item.active)} />
                  <span className="text-base lg:text-lg truncate">{item.label}</span>
                </button>
              ) : (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.end}
                  data-tv-nav="main"
                  tabIndex={0}
                  className={({ isActive }) => itemClass(isActive)}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className={`absolute left-0 top-0 bottom-0 w-1 ${kidsMode ? "bg-sky-400" : "bg-accent"}`}
                        />
                      )}
                      <item.icon className={iconClass(isActive)} />
                      <span className="text-base lg:text-lg truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
