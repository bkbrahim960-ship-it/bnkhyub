import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getLatestMovies, getLatestTVShows, VidAPIItem } from "@/services/vidapi";
import { MovieCard } from "./MovieCard";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface VidAPILatestRowProps {
  type: "movie" | "tv";
  title: string;
}

export const VidAPILatestRow = ({ type, title }: VidAPILatestRowProps) => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<VidAPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const data = type === "movie" ? await getLatestMovies(1) : await getLatestTVShows(1);
        setItems(data.items);
      } catch (err) {
        console.error("VidAPI Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [type]);

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="relative py-4 group/row">
      <div className="container flex items-end justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10 text-accent group-hover/row:scale-110 transition-transform duration-500 shadow-glow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white group-hover/row:text-accent transition-colors">
            {title}
          </h2>
        </div>
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

      <div className="container">
        <div
          ref={scrollRef}
          className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory pt-6"
        >
          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[100px] sm:w-[130px] md:w-[150px] lg:w-[170px] xl:w-[190px] aspect-[2/3] rounded-lg shimmer-gold animate-in fade-in"
              />
            ))
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.tmdb_id}-${idx}`}
                className="snap-start animate-in fade-in slide-in-from-right-8 duration-500"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <MovieCard
                  id={item.tmdb_id || item.imdb_id}
                  title={item.title}
                  posterPath={item.poster_url.replace('https://image.tmdb.org/t/p/original', '')}
                  year={item.year}
                  rating={parseFloat(item.rating)}
                  type={item.type}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
