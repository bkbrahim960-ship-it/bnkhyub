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
  const color = safeGetAccentHex();
  const id = imdb_id || tmdb_id;
  
  return [
    `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1`, // S1: Primary
    getVidsrcEmbedUrl('movie', imdb_id, tmdb_id), // S2
    `https://vidsrc.to/embed/movie/${id}`, // S3
    `https://embed.filmu.in/movie/${id}`, // S4: Filmu
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
    `https://vaplayer.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1`, // S1: Primary
    getVidsrcEmbedUrl('tv', imdb_id, tmdb_id, season, episode), // S2
    `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`, // S3
    `https://embed.filmu.in/tv/${id}/${season}/${episode}`, // S4: Filmu
  ];
};

export const SOURCE_LABELS = [
  "S1 · BNKhub serveur",
  "S2 · vidsrc-embed (Arabic)",
  "S3 · vidsrc.to",
  "S4 · Filmu (Premium)",
];
