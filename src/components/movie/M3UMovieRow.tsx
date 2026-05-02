import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { fetchAndParseM3U, M3UItem } from "@/services/m3u";

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
    <section className="relative py-8 group/row animate-fade-in">
      <div className="container flex items-end justify-between mb-5">
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
        className="container overflow-x-auto scrollbar-hide flex gap-4 md:gap-5 pt-20 pb-16 snap-x snap-mandatory"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[150px] sm:w-[170px] md:w-[190px] aspect-[2/3] rounded-xl shimmer-gold"
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
