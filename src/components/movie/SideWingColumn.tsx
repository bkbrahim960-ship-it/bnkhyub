/**
 * Colonnes latérales — remplissent les marges gauche/droite sur desktop/TV.
 */
import { MovieCard } from "./MovieCard";
import { WING_CARD } from "./rowLayout";
import { TMDBMovie, TMDBSeries } from "@/services/tmdb";

type WingItem = (TMDBMovie | TMDBSeries) & { media_type?: "movie" | "tv" };

interface Props {
  items: WingItem[];
  loading?: boolean;
  side: "left" | "right";
}

function itemType(m: WingItem): "movie" | "tv" {
  if (m.media_type === "tv") return "tv";
  if ("first_air_date" in m && m.first_air_date && !("release_date" in m && (m as TMDBMovie).release_date)) return "tv";
  if ("name" in m && (m as TMDBSeries).name && !(m as TMDBMovie).title) return "tv";
  return "movie";
}

export const SideWingColumn = ({ items, loading, side }: Props) => {
  return (
    <aside
      className={`hidden lg:flex flex-col gap-2 py-2 sticky top-0 self-start max-h-screen overflow-y-auto scrollbar-hide ${
        side === "left" ? "pl-1 xl:pl-2" : "pr-1 xl:pr-2"
      }`}
      aria-hidden={items.length === 0 && !loading}
    >
      {loading
        ? Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className={`${WING_CARD} aspect-[2/3] rounded-lg shimmer-gold shrink-0`} />
          ))
        : items.map((m) => (
            <MovieCard
              key={`wing-${side}-${m.id}`}
              id={m.id}
              title={(m as TMDBMovie).title ?? (m as TMDBSeries).name ?? ""}
              posterPath={m.poster_path}
              year={((m as TMDBMovie).release_date ?? (m as TMDBSeries).first_air_date ?? "").slice(0, 4)}
              rating={m.vote_average}
              type={itemType(m)}
              className={WING_CARD}
            />
          ))}
    </aside>
  );
};

/** Fusionne plusieurs pages TMDB sans doublons. */
export function mergeTMDBPages(...pages: { results: (TMDBMovie | TMDBSeries)[] }[]): WingItem[] {
  const seen = new Set<number>();
  const merged: WingItem[] = [];
  for (const page of pages) {
    for (const item of page.results) {
      if (!item.poster_path || seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

/** Répartit une liste en deux colonnes latérales. */
export function splitWingColumns(items: WingItem[]): { left: WingItem[]; right: WingItem[] } {
  const mid = Math.ceil(items.length / 2);
  return { left: items.slice(0, mid), right: items.slice(mid) };
}
