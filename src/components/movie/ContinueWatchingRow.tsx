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
    getRecentHistory(user.id, 15)
      .then(setItems)
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
            <div key={e.id} className="snap-start shrink-0 w-[260px] sm:w-[300px]">
              <Link to={to} className="group relative block">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-card border border-border group-hover:border-accent-subtle group-hover:shadow-glow transition-all duration-500 ease-luxe">
                  {backdrop ? (
                    <img src={backdrop} alt={e.title} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground p-4 text-center">
                      {e.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Badge source + saison */}
                  <div className="absolute top-2 start-2 flex gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 border border-accent/40 text-accent">
                      {subtitle}
                    </span>
                    {e.source_id && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 border border-border text-foreground/80">
                        {e.source_id}
                      </span>
                    )}
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      remove(e.id);
                    }}
                    className="absolute top-2 end-2 w-7 h-7 rounded-full bg-black/70 hover:bg-destructive/80 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Retirer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Bouton lecture */}
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <div className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground font-semibold px-4 py-2 rounded-full shadow-accent text-sm">
                      <Play className="w-3.5 h-3.5 fill-accent-foreground" />
                      {t("continue_resume")}
                    </div>
                  </div>
                </div>
                <div className="pt-2 px-1">
                  <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                    {e.title}
                  </h3>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};
