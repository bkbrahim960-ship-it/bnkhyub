/**
 * BNKhub — Row "Continuer à regarder".
 * Reprise de la dernière lecture (film ou épisode TV + source mémorisée).
 */
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getRecentHistory,
  deleteHistoryEntry,
  WatchHistoryEntry,
} from "@/services/watchHistory";
import { IMG } from "@/services/tmdb";
import { toast } from "sonner";

export const ContinueWatchingRow = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<WatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getRecentHistory(user.id, 20)
      .then((data) => {
        // Deduplicate: keep only the most recent entry per tmdb_id
        const seen = new Set<number>();
        const unique = data.filter((entry) => {
          if (seen.has(entry.tmdb_id)) return false;
          seen.add(entry.tmdb_id);
          return true;
        });
        setItems(unique.slice(0, 5));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!user) return null;
  if (loading) return null;
  if (items.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  const remove = async (id: string) => {
    try {
      await deleteHistoryEntry(user.id, id);
      setItems((prev) => prev.filter((e) => e.id !== id));
    } catch {
      toast.error("Impossible de supprimer");
    }
  };

  return (
    <section className="relative py-8 group/row">
      <div className="container flex items-end justify-between mb-5">
        <h2 className="font-display text-2xl md:text-3xl">
          <span className="text-gradient-accent">{t("section_continue")}</span>
        </h2>
        <div className="hidden md:flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scroll(-1)}
            className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur border border-border hover:border-accent-subtle grid place-items-center"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur border border-border hover:border-accent-subtle grid place-items-center"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="container overflow-x-auto scrollbar-hide flex gap-4 md:gap-5 pb-4 snap-x snap-mandatory"
      >
        {items.map((e) => {
          const poster = IMG.poster(e.poster_path);
          const backdrop = IMG.backdrop(e.backdrop_path, "w780") ?? poster;
          const basePath = e.media_type === "tv" ? `/series/${e.tmdb_id}` : `/movie/${e.tmdb_id}`;
          const params = new URLSearchParams();
          params.set("resume", "1");
          if (e.season_number) params.set("s", String(e.season_number));
          if (e.episode_number) params.set("e", String(e.episode_number));
          if (e.source_id) params.set("src", e.source_id);
          const to = `${basePath}?${params.toString()}`;
          const subtitle =
            e.media_type === "tv" && e.season_number && e.episode_number
              ? `S${e.season_number}E${e.episode_number}`
              : "Film";

          return (
            <div key={e.id} className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px]">
              <Link to={to} className="group relative block transition-all duration-700 hover:-translate-y-2">
                {/* Glow effect on hover */}
                <div className="absolute -inset-2 bg-accent/10 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-card border border-white/5 group-hover:border-accent/40 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] transition-all duration-700 ease-luxe">
                  {backdrop ? (
                    <img 
                      src={backdrop} 
                      alt={e.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-card to-surface-elevated text-muted-foreground p-6 text-center font-display italic">
                      {e.title}
                    </div>
                  )}
                  
                  {/* Cinematic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  {/* Glossy Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Top Badges (Glass) */}
                  <div className="absolute top-3 start-3 flex gap-2">
                    <span className="backdrop-blur-xl bg-accent/20 text-accent text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-accent/30 shadow-lg">
                      {subtitle}
                    </span>
                    {e.source_id && (
                      <span className="backdrop-blur-xl bg-black/40 text-white/80 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 shadow-lg">
                        {e.source_id}
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      remove(e.id);
                    }}
                    className="absolute top-3 end-3 w-8 h-8 rounded-full bg-black/40 hover:bg-destructive/80 backdrop-blur-xl border border-white/10 grid place-items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                    aria-label="Retirer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Progress Bar (Sleek) */}
                  {e.duration_seconds && e.progress_seconds > 0 && (
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/10 backdrop-blur-sm">
                      <div 
                        className="h-full bg-accent relative overflow-hidden" 
                        style={{ width: `${Math.min(100, (e.progress_seconds / e.duration_seconds) * 100)}%` }} 
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent blur-md" />
                      </div>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/30 backdrop-blur-[2px]">
                    <div className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-[0_0_30px_hsl(var(--accent)/0.5)] scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Play className="w-7 h-7 fill-current" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 px-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-body font-bold text-sm text-foreground/90 line-clamp-1 group-hover:text-accent transition-colors duration-300">
                      {e.title}
                    </h3>
                    {e.duration_seconds && (
                      <span className="shrink-0 text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                        {Math.round((e.progress_seconds / e.duration_seconds) * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-[0.1em] opacity-60">
                    Continuer la lecture
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};
