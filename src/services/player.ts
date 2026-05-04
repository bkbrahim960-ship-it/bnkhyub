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
export const getMovieSources = (imdb_id: string, tmdb_id: number | string, resumeAt?: number): string[] => {
  const color = safeGetAccentHex();
  const id = imdb_id || tmdb_id;
  const resumeParam = resumeAt ? `&resumeAt=${resumeAt}` : '';
  
  return [
    `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?primaryColor=${color.replace('#','')}&lang=ar&ds_lang=ar&autoplay=1${resumeParam}`, // S1: Primary
    getVidsrcEmbedUrl('movie', imdb_id, tmdb_id), // S2
    `https://vidapi.xyz/embed/movie/${imdb_id || tmdb_id}`, // S3: VidAPI.xyz
    `https://vidsrc.to/embed/movie/${id}`, // S4: Vidsrc.to
    `https://embed.su/embed/movie/${id}`, // S5: Embed.su
    `https://autoembed.to/movie/tmdb/${tmdb_id}`, // S6: AutoEmbed
    `https://embed.filmu.in/movie/${id}`, // S7: Filmu
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
    `https://vidapi.xyz/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}`, // S3: VidAPI.xyz
    `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`, // S4: Vidsrc.to
    `https://embed.su/embed/tv/${id}/${season}/${episode}`, // S5: Embed.su
    `https://autoembed.to/tv/tmdb/${tmdb_id}/${season}/${episode}`, // S6: AutoEmbed
    `https://embed.filmu.in/tv/${id}/${season}/${episode}`, // S7: Filmu
  ];
};

export const SOURCE_LABELS = [
  "S1 · BNKhub serveur",
  "S2 · vidsrc-embed (Arabic)",
  "S3 · VidAPI.xyz (Global)",
  "S4 · Vidsrc.to (Fast)",
  "S5 · Embed.su (4K)",
  "S6 · AutoEmbed (Clean)",
  "S7 · Filmu (Premium)",
];
