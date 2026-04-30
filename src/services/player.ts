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
  const base = "https://vidsrc-embed.ru/embed";
  const lang = c.lang ?? "fr";
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

export const getMovieSources = (imdb_id: string, tmdb_id: number | string): string[] => {
  const color = safeGetAccentHex();
  return [
    `https://vidlink.pro/movie/${tmdb_id}?primaryColor=${color}&autoplay=false`,
    `https://vidsrc.in/embed/movie?tmdb=${tmdb_id}`,
    `https://vidsrc.pm/embed/movie/${imdb_id}`,
    `https://autoembed.co/movie/tmdb/${tmdb_id}`,
    `https://embed.smashystream.com/playere.php?tmdb=${tmdb_id}`,
    `https://vidsrc-embed.ru/embed/movie?imdb=${imdb_id}&ds_lang=ar`,
    `https://multiembed.mov/?video_id=${tmdb_id}`,
    `https://vidsrc.me/embed/movie/${imdb_id}`,
    `https://www.2embed.cc/embed/${imdb_id}`,
    `https://vidlux.xyz/embed/movie/${tmdb_id}?color=${color}`,
  ];
};

export const getTVSources = (
  imdb_id: string,
  tmdb_id: number | string,
  season: number,
  episode: number,
): string[] => {
  const color = safeGetAccentHex();
  return [
    `https://vidlink.pro/tv/${tmdb_id}/${season}/${episode}?primaryColor=${color}&autoplay=false`,
    `https://vidsrc.in/embed/tv?tmdb=${tmdb_id}&season=${season}&episode=${episode}`,
    `https://vidsrc.pm/embed/tv/${imdb_id}/${season}/${episode}`,
    `https://autoembed.co/tv/tmdb/${tmdb_id}-${season}-${episode}`,
    `https://embed.smashystream.com/playere.php?tmdb=${tmdb_id}&season=${season}&episode=${episode}`,
    `https://vidsrc-embed.ru/embed/tv?imdb=${imdb_id}&season=${season}&episode=${episode}&ds_lang=ar`,
    `https://multiembed.mov/?video_id=${tmdb_id}&s=${season}&e=${episode}`,
    `https://vidsrc.me/embed/tv/${imdb_id}/${season}/${episode}`,
    `https://www.2embed.cc/embed/${imdb_id}/${season}/${episode}`,
    `https://vidlux.xyz/embed/tv/${tmdb_id}/${season}/${episode}?color=${color}`,
  ];
};

export const SOURCE_LABELS = [
  "VIP · VidLink (Ad-Free, Fast)",
  "VIP · VidSrc IN (Multi-Sub)",
  "VIP · VidSrc PM (Stable)",
  "VIP · AutoEmbed (No Buffering)",
  "S5 · SmashyStream (Arabic Subs)",
  "S6 · vidsrc-embed (Arabic Dub/Sub)",
  "S7 · multiembed",
  "S8 · vidsrc.me",
  "S9 · 2embed.cc",
  "S10 · vidlux",
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
    const res = await fetch(`https://vidsrc-embed.ru/movies/latest/page-${page}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.result ?? [];
  } catch {
    return [];
  }
};

export const getLatestTVShows = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const res = await fetch(`https://vidsrc-embed.ru/tvshows/latest/page-${page}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.result ?? [];
  } catch {
    return [];
  }
};

export const getLatestEpisodes = async (page = 1): Promise<VidsrcItem[]> => {
  try {
    const res = await fetch(`https://vidsrc-embed.ru/episodes/latest/page-${page}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.result ?? [];
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
