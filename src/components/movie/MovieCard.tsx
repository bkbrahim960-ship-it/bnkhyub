import React, { useState, memo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Play, List, Share2 } from "lucide-react";
import { IMG } from "@/services/tmdb";
import { useAmbient } from "@/context/AmbientContext";
import { useLanguage } from "@/context/LanguageContext";
import { FavoriteButton } from "./FavoriteButton";

interface Props {
  id: string | number;
  title: string;
  posterPath: string | null;
  year?: string;
  rating?: number;
  type?: "movie" | "tv";
  className?: string;
  customUrl?: string;
}

export const MovieCard = memo(({ id, title, posterPath, year, rating, type = "movie", className = "", customUrl }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const { setAmbientColor } = useAmbient();
  const { lang, t, dir } = useLanguage();
  const poster = IMG.poster(posterPath, "w342");

  const playPath = `/${type === "tv" ? "series" : "movie"}/${id}`;
  const finalPath = customUrl ? `${playPath}?video_url=${encodeURIComponent(customUrl)}` : playPath;

  const handleActive = () => {
    try {
      setAmbientColor(`hsl(var(--accent) / 0.3)`);
    } catch (e) {}
  };
  const handleLeave = () => {
    try {
      setAmbientColor("transparent");
    } catch (e) {}
  };

  const handlePressStart = () => {
    setIsPressed(true);
    longPressTimer.current = window.setTimeout(() => {
      setIsContextMenuOpen(true);
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsPressed(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsContextMenuOpen(true);
  };

  const closeContextMenu = () => {
    setIsContextMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setIsContextMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`relative block shrink-0 w-[100px] sm:w-[130px] md:w-[150px] lg:w-[170px] xl:w-[190px] transition-all duration-300 ${className}`}
      onMouseEnter={handleActive}
      onMouseLeave={handleLeave}
      onContextMenu={handleContextMenu}
    >
      <Link
        to={finalPath}
        className="relative block"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        {/* Poster Container */}
        <div className={`relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-[#141414] via-[#1f1f1f] to-[#141414] transition-all duration-300 group ${isPressed ? 'scale-95' : ''}`}>
          {!loaded && <div className="absolute inset-0 shimmer-gold" />}

          {poster ? (
            <img
              src={poster}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                loaded ? "opacity-100" : "opacity-0"
              } group-hover:scale-110`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-muted-foreground text-[10px] p-2 text-center font-display italic">
              {title}
            </div>
          )}

          {/* Site Logo (Top Right - Raised Up) */}
          <div className="absolute -top-0.5 right-0.5 z-10 pointer-events-none">
            <img
              src="/logo.png"
              alt="BNK"
              className="h-5 sm:h-6 md:h-7 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* Rating Badge (Top Left - No Background) */}
          {typeof rating === "number" && rating > 0 && (
            <div className="absolute top-1 left-1 z-10 flex items-center gap-1">
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                alt="TMDB"
                className="w-6 h-6"
              />
              <span className="text-[10px] sm:text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Quality Badge (Bottom Right - No Background) */}
          <div className="absolute bottom-1 right-1 z-10">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-accent drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {type === "movie" ? "4K UHD" : "SÉRIE"}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Play className="w-4 h-4 fill-current" />
            </div>
          </div>
        </div>

        {/* Title and Info Below the Card */}
        <div className="mt-2 px-0.5">
          <h3 className="font-body font-bold text-[10px] sm:text-[11px] md:text-[12px] text-foreground line-clamp-2 mb-0.5
            transition-all duration-300 group-hover:text-accent group-hover:drop-shadow-[0_0_10px_rgba(255,0,200,0.3)]">
            {title}
          </h3>
          <div className="flex items-center gap-1.5">
            {year && (
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium
                transition-all duration-300 group-hover:text-white/80">
                {year}
              </span>
            )}
            <span className="text-[8px] sm:text-[9px] text-accent font-black uppercase tracking-widest
              transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,0,200,0.5)]">
              {type === "movie" ? t("card_type_movie") : t("card_type_series")}
            </span>
          </div>
        </div>
      </Link>

      {/* Context Menu (Long Press/Right Click) */}
      {isContextMenuOpen && (
        <div
          ref={contextMenuRef}
          dir={dir}
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-50 w-48 bg-surface-elevated border border-border/60 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Menu Header */}
          <div className="px-3 py-2 border-b border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              {t("card_context_title")}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Watch Now */}
            <Link
              to={finalPath}
              onClick={closeContextMenu}
              className="flex items-center gap-3 px-3 py-2 hover:bg-accent/10 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {t("card_context_watch")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("card_context_watch_desc")}
                </p>
              </div>
            </Link>

            {/* Add to Watch Later */}
            <div
              onClick={closeContextMenu}
              className="flex items-center gap-3 px-3 py-2 hover:bg-accent/10 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                <List className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {t("card_context_add_list")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("card_context_add_list_desc")}
                </p>
              </div>
            </div>

            {/* Share */}
            <div
              onClick={closeContextMenu}
              className="flex items-center gap-3 px-3 py-2 hover:bg-accent/10 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {t("card_context_share")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("card_context_share_desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={closeContextMenu}
            className="w-full px-3 py-2 text-center text-sm font-medium text-muted-foreground hover:text-white hover:bg-red-500/10 transition-colors border-t border-border/40"
          >
            {t("card_context_cancel")}
          </button>
        </div>
      )}
    </div>
  );
});
