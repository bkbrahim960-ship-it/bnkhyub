import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getLatestMovies, getLatestTVShows, VidAPIItem } from "@/services/vidapi";
import { LandscapeMovieCard } from "./LandscapeMovieCard";
import { Sparkles } from "lucide-react";

interface VidAPILatestRowProps {
  type: "movie" | "tv";
  title: string;
}

export const VidAPILatestRow = ({ type, title }: VidAPILatestRowProps) => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<VidAPIItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!loading && items.length === 0) return null;

  return (
    <section className="relative py-12 group/row">
      <div className="container mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-accent/10 text-accent group-hover/row:scale-110 transition-transform duration-500 shadow-glow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white group-hover/row:text-accent transition-colors">
              {title}
            </h2>
            <div className="h-1 w-12 bg-accent/40 rounded-full mt-1 group-hover/row:w-full transition-all duration-700" />
          </div>
        </div>
        <div className="px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-[10px] font-black text-accent uppercase tracking-[0.2em] animate-pulse">
          Premium Source
        </div>
      </div>

      <div className="container relative">
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-8 snap-x snap-mandatory pt-2">
          {loading ? (
            Array(7).fill(0).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px] aspect-video rounded-2xl shimmer-gold animate-in fade-in" />
            ))
          ) : (
            items.map((item, idx) => (
              <div key={`${item.tmdb_id}-${idx}`} className="snap-start animate-in fade-in slide-in-from-right-8 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <LandscapeMovieCard
                  id={item.tmdb_id || item.imdb_id}
                  title={item.title}
                  posterPath={item.poster_url.replace('https://image.tmdb.org/t/p/original', '')}
                  year={item.year}
                  rating={parseFloat(item.rating)}
                  type={item.type}
                  className="w-full"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
