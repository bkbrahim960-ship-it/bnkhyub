/**
 * BNKhub — Row de films/séries avec scroll horizontal + boutons.
 */
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { TMDBMovie, TMDBSeries } from "@/services/tmdb";

interface Item {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

interface Props {
  title: string;
  items: (TMDBMovie | TMDBSeries | Item)[];
  type?: "movie" | "tv";
  loading?: boolean;
}

export const MovieRow = ({ title, items, type = "movie", loading }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="relative py-8 group/row">
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
        className="container overflow-x-auto scrollbar-hide flex gap-4 md:gap-5 pb-4 snap-x snap-mandatory"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[150px] sm:w-[170px] md:w-[190px] aspect-[2/3] rounded-xl shimmer-gold"
              />
            ))
          : items.map((m: any) => (
              <div key={`${type}-${m.id}`} className="snap-start">
                <MovieCard
                  id={m.id}
                  title={m.title ?? m.name ?? ""}
                  posterPath={m.poster_path}
                  year={(m.release_date ?? m.first_air_date ?? "").slice(0, 4)}
                  rating={m.vote_average}
                  type={type}
                />
              </div>
            ))}
      </div>
    </section>
  );
};
