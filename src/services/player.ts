/**
 * BNKhub — Player Configuration & Streaming Sources
 * Handles both Movies and TV Shows sources with Arabic localization priority.
 */
import axios from 'axios';

const BACKEND_URL = "http://localhost:4000/api/stream/sources";

export const getInternalBackendSources = async (type: 'movie' | 'tv', id: string, s?: number, e?: number) => {
  try {
    const res = await axios.post(BACKEND_URL, { type, id, season: s, episode: e });
    return res.data.sources || [];
  } catch (error) {
    console.error("Backend Source Error:", error);
    return [];
  }
};

const safeGetAccentHex = () => {
  if (typeof window === "undefined") return "#D4AF37";
  const style = getComputedStyle(document.documentElement);
  const color = style.getPropertyValue("--accent").trim();
  if (color.startsWith("#")) return color;
  return "#D4AF37";
};

/**
 * vidsrc-embed.ru (S2) helper
 */
export const getVidsrcEmbedUrl = (type: 'movie' | 'tv', imdb_id: string, tmdb_id: number | string, season?: number, episode?: number) => {
  const base = "https://vidsrc-embed.ru/embed";
  const idParam = imdb_id ? `imdb=${imdb_id}` : `tmdb=${tmdb_id}`;
  const lang = "ar";
  
  if (type === 'movie') {
    return `${base}/movie?${idParam}&ds_lang=${lang}`;
  }
  return `${base}/tv?${idParam}&season=${season}&episode=${episode}&ds_lang=${lang}`;
};

/**
 * Main Source Fetchers
 */
export const getMovieSources = (imdb_id: string, tmdb_id: number | string, resumeAt?: number): string[] => {
  const color = safeGetAccentHex();
  const id = imdb_id || tmdb_id;
  const resumeParam = resumeAt ? `&resumeAt=${resumeAt}` : '';
  
  return [
    `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1${resumeParam}`, // S1: Primary
    getVidsrcEmbedUrl('movie', imdb_id, tmdb_id), // S2
    `https://vidzen.fun/movie/${id}`, // S3: VidZen
    `https://vidnest.fun/movie/${id}`, // S4: VidNest
    `https://moviehub.dev/watch/movie/${id}`, // S5: MovieHub
    `https://streamsrc.cc/watch/movie/tmdbid=${tmdb_id}`, // S6: Streamsrc
  ];
};

export const getTVSources = (
  imdb_id: string,
  tmdb_id: number | string,
  season: number,
  episode: number,
  resumeAt?: number,
): string[] => {
  const color = safeGetAccentHex();
  const id = imdb_id || tmdb_id;
  const resumeParam = resumeAt ? `&resumeAt=${resumeAt}` : '';
  
  return [
    `https://vaplayer.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1${resumeParam}`, // S1: Primary
    getVidsrcEmbedUrl('tv', imdb_id, tmdb_id, season, episode), // S2
    `https://vidzen.fun/tv/${id}`, // S3: VidZen
    `https://vidnest.fun/tv/${id}`, // S4: VidNest
    `https://moviehub.dev/watch/series/${id}`, // S5: MovieHub
    `https://streamsrc.cc/watch/series/tmdbid=${tmdb_id}`, // S6: Streamsrc
  ];
};

export const SOURCE_LABELS = [
  "S1 · BNKhub serveur",
  "S2 · vidsrc-embed (Arabic)",
  "S3 · VidZen (Global)",
  "S4 · VidNest (Global)",
  "S5 · MovieHub (Dev)",
  "S6 · Streamsrc (TMDB)",
];
