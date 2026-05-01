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

export const fetchApiflixStream = async (id: string | number, type: "movie" | "tv", season?: number, episode?: number) => {
  try {
    const url = `https://apiflix.to/api/${type === "movie" ? "movie" : "tv"}?id=${id}${type === "tv" ? `&s=${season}&e=${episode}` : ""}&lang=ar`;
    const res = await fetch(url);
    const data = await res.json();
    return data.stream_url || data.url || null;
  } catch (error) {
    console.error("APIFLIX error:", error);
    return null;
  }
};

export const fetchStreamDBStream = async (imdb_id: string, type: "movie" | "tv", season?: number, episode?: number) => {
  try {
    const url = `https://streamdb.pro/api/v2/stream?imdb=${imdb_id}${type === "tv" ? `&s=${season}&e=${episode}` : ""}&lang=ar`;
    const res = await fetch(url);
    const data = await res.json();
    // StreamDB often returns an array of sources
    return data.streams?.[0]?.url || data.url || null;
  } catch (error) {
    console.error("StreamDB error:", error);
    return null;
  }
};

export const getMovieSources = (imdb_id: string, tmdb_id: number | string): string[] => {
  const color = safeGetAccentHex();
  const id = imdb_id || tmdb_id;
  return [
    `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?primaryColor=${color.replace('#','')}&lang=ar`, // S1: Original Primary
    `https://vidsrc-embed.ru/embed/movie?${imdb_id ? `imdb=${imdb_id}` : `tmdb=${tmdb_id}`}&ds_lang=ar`, // S2: Original S2
    `https://vidsrc.to/embed/movie/${id}`, // S3: Original S3
    "APIFLIX_API", // S4: New API
    "STREAMDB_API", // S5: New API
    `https://vidlink.pro/movie/${tmdb_id}?primaryColor=${color}`, // S6: Ad-Free
    `https://embed.su/embed/movie/${tmdb_id || imdb_id}`, // S7: Clean
    `https://superembed.stream/?video_id=${imdb_id || tmdb_id}&lang=ar`,
    `https://www.flixhq.to/embed/movie/${imdb_id || tmdb_id}`,
    `https://autoembed.co/movie/tmdb/${tmdb_id}`,
    `https://multiembed.mov/?video_id=${tmdb_id}`,
    `https://vidlux.xyz/embed/movie/${tmdb_id}?color=${color}`,
    `https://vidsrc.me/embed/movie/${id}`,
    `https://vidsrc.icu/embed/movie/${id}`,
    `https://vidsrc.net/embed/movie/${id}`,
    `https://vidsrc.xyz/embed/movie/${id}`,
    `https://www.2embed.cc/embed/${id}`,
    `https://www.2embed.to/embed/imdb/movie?id=${id}`,
    `https://player.embed-api.stream/?id=${tmdb_id}`,
    `https://vidsrc.cc/v2/embed/movie/${tmdb_id}`,
  ];
};

export const getTVSources = (
  imdb_id: string,
  tmdb_id: number | string,
  season: number,
  episode: number,
): string[] => {
  const color = safeGetAccentHex();
  const id = imdb_id || tmdb_id;
  return [
    `https://vaplayer.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?primaryColor=${color.replace('#','')}&lang=ar`, // S1: Original Primary
    `https://vidsrc-embed.ru/embed/tv?${imdb_id ? `imdb=${imdb_id}` : `tmdb=${tmdb_id}`}&season=${season}&episode=${episode}&ds_lang=ar`, // S2: Original S2
    `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`, // S3: Original S3
    "APIFLIX_API",
    "STREAMDB_API",
    `https://vidlink.pro/tv/${tmdb_id}/${season}/${episode}?primaryColor=${color}`, // S6: Ad-Free
    `https://embed.su/embed/tv/${tmdb_id || imdb_id}/${season}/${episode}`, // S7: Clean
    `https://superembed.stream/?video_id=${imdb_id || tmdb_id}&s=${season}&e=${episode}&lang=ar`,
    `https://www.flixhq.to/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}`,
    `https://autoembed.co/tv/tmdb/${tmdb_id}-${season}-${episode}`,
    `https://multiembed.mov/?video_id=${tmdb_id}&s=${season}&e=${episode}`,
    `https://vidlux.xyz/embed/tv/${tmdb_id}/${season}/${episode}`,
    `https://vidsrc.me/embed/tv/${id}/${season}/${episode}`,
    `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`,
    `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`,
    `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`,
    `https://www.2embed.cc/embed/${id}/${season}/${episode}`,
    `https://www.2embed.to/embed/imdb/tv?id=${id}&s=${season}&e=${episode}`,
    `https://player.embed-api.stream/?id=${tmdb_id}&s=${season}&e=${episode}`,
    `https://vidsrc.cc/v2/embed/tv/${tmdb_id}/${season}/${episode}`,
  ];
};

export const SOURCE_LABELS = [
  "S1 · VidAPI Premium",
  "S2 · vidsrc-embed (Arabic)",
  "S3 · vidsrc.to",
  "S4 · APIflix (Arabic API)",
  "S5 · StreamDB (Multi API)",
  "S6 · VidLink (Ad-Free)",
  "S7 · Embed.su (Clean)",
  "S8 · SuperEmbed",
  "S9 · FlixHQ",
  "S10 · AutoEmbed",
  "S11 · multiembed",
  "S12 · vidlux",
  "S13 · vidsrc.me",
  "S14 · vidsrc.icu",
  "S15 · vidsrc.net",
  "S16 · vidsrc.xyz",
  "S17 · 2embed.cc",
  "S18 · 2embed.to",
  "S19 · embed-api",
  "S20 · vidsrc.cc",
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
