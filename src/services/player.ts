/**
 * BNKhub — Player Configuration & Streaming Sources
 * Handles both Movies and TV Shows sources with Arabic localization priority.
 */

const safeGetAccentHex = () => {
  if (typeof window === "undefined") return "#D4AF37";
  const style = getComputedStyle(document.documentElement);
  const color = style.getPropertyValue("--accent").trim();
  if (color.startsWith("#")) return color;
  return "#D4AF37";
};

/**
 * Common Embed Utilities
 */
export const getVidsrcUrl = (type: 'movie' | 'tv', id: string, season?: number, episode?: number, domain = 'vidsrc.to') => {
  const base = `https://${domain}/embed`;
  if (type === 'movie') return `${base}/movie/${id}`;
  return `${base}/tv/${id}/${season}/${episode}`;
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
export const getMovieSources = (imdb_id: string, tmdb_id: number | string): string[] => {
  return [
    `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1`, // S1
    getVidsrcEmbedUrl('movie', imdb_id, tmdb_id), // S2
    `https://vidsrc.to/embed/movie/${id}`, // S3
    `https://vidsrc.me/embed/movie?imdb=${imdb_id || id}`, // S4
    `https://vidsrc.io/embed/movie/${id}`, // S5
    `https://vidsrc.stream/embed/movie/${id}`, // S6
    `https://vidsrc.tw/embed/movie/${id}`, // S7
    `https://vidsrc.pm/embed/movie/${id}`, // S8
    `https://vidsrc.net/embed/movie/${id}`, // S9
    `https://vidsrc.xyz/embed/movie/${id}`, // S10
    `https://vidsrc.cc/embed/movie/${id}`, // S11
    `https://vidsrc.icu/embed/movie/${id}`, // S12
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
    `https://vaplayer.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1`, // S1
    getVidsrcEmbedUrl('tv', imdb_id, tmdb_id, season, episode), // S2
    `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`, // S3
    `https://vidsrc.me/embed/tv?imdb=${imdb_id || id}&season=${season}&episode=${episode}`, // S4
    `https://vidsrc.io/embed/tv/${id}/${season}/${episode}`, // S5
    `https://vidsrc.stream/embed/tv/${id}/${season}/${episode}`, // S6
    `https://vidsrc.tw/embed/tv/${id}/${season}/${episode}`, // S11 (Re-mapped to S7)
    `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`, // S16 (Re-mapped to S8)
    `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`, // S17 (Re-mapped to S9)
    `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`, // S18 (Re-mapped to S10)
    `https://vidsrc.cc/embed/tv/${id}/${season}/${episode}`, // S19 (Re-mapped to S11)
    `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`, // S20 (Re-mapped to S12)
  ];
};

export const SOURCE_LABELS = [
  "S1 · VidAPI Premium",
  "S2 · vidsrc-embed (Arabic)",
  "S3 · vidsrc.to",
  "S4 · vidsrc.me",
  "S5 · vidsrc.io",
  "S6 · vidsrc.stream",
  "S7 · vidsrc.tw",
  "S8 · vidsrc.pm",
  "S9 · vidsrc.net",
  "S10 · vidsrc.xyz",
  "S11 · vidsrc.cc",
  "S12 · vidsrc.icu",
];
