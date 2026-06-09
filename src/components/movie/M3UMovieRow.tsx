import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { fetchAndParseM3U, M3UItem } from "@/services/m3u";
import { ROW_HEADER, ROW_TRACK, CARD_SKELETON } from "./rowLayout";

interface Props {
  title: string;
  m3uUrl: string;
  type?: "movie" | "tv";
}

export const M3UMovieRow = ({ title, m3uUrl, type = "movie" }: Props) => {
  const [items, setItems] = useState<M3UItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAndParseM3U(m3uUrl)
      .then((data) => {
        if (mounted) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [m3uUrl]);

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="relative py-4 group/row">
      <div className={ROW_HEADER}>
        <h2 className="font-display text-2xl md:text-3xl">
          <span className="text-gradient-accent">{title}</span>
        </h2>
        <div className="hidden md:flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scroll(-1)}
            className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur border border-border hover:border-accent-subtle grid place-items-center"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-10 h-10 rounded-full bg-surface-elevated/80 backdrop-blur border border-border hover:border-accent-subtle grid place-items-center"
            aria-label="Suivant"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={ROW_TRACK}
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={CARD_SKELETON}
              />
            ))
          : items.map((m, idx) => (
              <div key={`m3u-${idx}`} className="snap-start">
                <MovieCard
                  id={`m3u-${idx}`}
                  title={m.name}
                  posterPath={m.logo || null}
                  year="2024"
                  rating={10}
                  type={type}
                  customUrl={m.url}
                />
              </div>
            ))}
      </div>
    </section>
  );
};
