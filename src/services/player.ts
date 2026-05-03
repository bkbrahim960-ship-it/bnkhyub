/**
 * BNKhub — Service Player & 10 sources de fallback.
 * Les iframes sont chargées dans un ordre précis avec bascule automatique
 * en cas d'échec (timeout 5s ou erreur onError).
 */
import { getAccentHex } from "@/context/ThemeContext";

export type PlayerType = "movie" | "tv";

export interface PlayerConfig {
  imdb_id?: string | null;
  tmdb_id: number | string;
  type: PlayerType;
  season?: number;
  episode?: number;
  lang?: "fr" | "ar" | "en" | "es" | "de";
  subUrl?: string;
  autoplay?: 0 | 1;
  autonext?: 0 | 1;
  sourceIndex?: number;
}

/** Source principale (S1) — utilisée comme url officielle. */
export const getPrimaryPlayerUrl = (c: PlayerConfig): string => {
  const base = "https://vaplayer.ru/embed";
  const lang = c.lang ?? "ar";
  const ap = c.autoplay ?? 1;
  const idParam = c.imdb_id ? `imdb=${c.imdb_id}` : `tmdb=${c.tmdb_id}`;

  if (c.type === "movie") {
    let url = `${base}/movie?${idParam}&ds_lang=${lang}&autoplay=${ap}`;
    if (c.subUrl) url += `&sub_url=${encodeURIComponent(c.subUrl)}`;
    return url;
  }

  if (c.season && c.episode) {
    let url = `${base}/tv?${idParam}&season=${c.season}&episode=${c.episode}&ds_lang=${lang}&autoplay=${ap}&autonext=${c.autonext ?? 0}`;
    if (c.subUrl) url += `&sub_url=${encodeURIComponent(c.subUrl)}`;
    return url;
  }

  return `${base}/tv?${idParam}&ds_lang=${lang}`;
};

export const getMovieSources = (imdb_id: string, tmdb_id: number | string, subUrl?: string): string[] => {
  const color = safeGetAccentHex();
  const id = imdb_id || tmdb_id;
  
  let s1 = `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1`;
  let s2 = `https://vidsrc-embed.ru/embed/movie?${imdb_id ? `imdb=${imdb_id}` : `tmdb=${tmdb_id}`}&ds_lang=ar`;
  
  if (subUrl) {
    s1 += `&sub_url=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent("Arabic (Clean)")}`;
    s2 += `&sub_url=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent("Arabic (Clean)")}`;
  }

  return [
    s1, // S1: Primary — Arabic subs auto-selected
    s2, // S2: Arabic subs
    `https://vidsrc.to/embed/movie/${id}`, // S3
  ];
};

export const getTVSources = (
  imdb_id: string,
  tmdb_id: number | string,
  season: number,
  episode: number,
  subUrl?: string
): string[] => {
  const color = safeGetAccentHex();
  const id = imdb_id || tmdb_id;

  let s1 = `https://vaplayer.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1`;
  let s2 = `https://vidsrc-embed.ru/embed/tv?${imdb_id ? `imdb=${imdb_id}` : `tmdb=${tmdb_id}`}&season=${season}&episode=${episode}&ds_lang=ar`;

  if (subUrl) {
    s1 += `&sub_url=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent("Arabic (Clean)")}`;
    s2 += `&sub_url=${encodeURIComponent(subUrl)}&sub_label=${encodeURIComponent("Arabic (Clean)")}`;
  }

  return [
    s1, // S1: Primary — Arabic subs auto-selected
    s2, // S2: Arabic subs
    `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`, // S3
  ];
};

export const SOURCE_LABELS = [
  "S1 · VidAPI Premium",
  "S2 · vidsrc-embed (Arabic)",
  "S3 · vidsrc.to",
];

// ───── Nouveautés vidsrc-embed ─────
export interface VidsrcItem {
  imdb_id?: string;
  tmdb_id?: number;
  title?: string;
  poster?: string;
  [k: string]: unknown;
}

export const getLatestMovies = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const res = await fetch(`https://vidapi.ru/movies/latest/page-${page}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
};

export const getLatestTVShows = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const res = await fetch(`https://vidapi.ru/tvshows/latest/page-${page}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
};

export const getLatestEpisodes = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const res = await fetch(`https://vidapi.ru/episodes/latest/page-${page}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
};

/** getAccentHex est DOM-dépendant ; fallback sur or classique si non dispo. */
function safeGetAccentHex(): string {
  try {
    return getAccentHex();
  } catch {
    return "D4A843";
  }
}
