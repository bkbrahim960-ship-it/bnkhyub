/**
 * BNKhub — Player Configuration & Streaming Sources
 * Handles both Movies and TV Shows sources with Arabic localization priority.
 */
import axios from 'axios';
import { KABYLE_CONTENT } from './customContent';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api/stream/sources";

export const getInternalBackendSources = async (type: 'movie' | 'tv', id: string, query?: string, s?: number, e?: number) => {
  try {
    const res = await axios.post(BACKEND_URL, { type, id: query || id, season: s, episode: e });
    return res.data.sources || [];
  } catch (error) {
    console.error("Backend Source Error:", error);
    return [];
  }
};

/* =========================================================================
 * 🎨 BNKhub Theme Bridge for VidAPI / vaplayer.ru
 * Reads live HSL CSS variables from the active theme and converts them to HEX
 * so the embedded player visually matches the website (skin, colors, icons).
 * ========================================================================= */

/** Convert HSL (h s% l%) to HEX (#RRGGBB) */
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

/** Read a CSS variable expressed as `H S% L%` and return HEX (no #) */
const readCssHsl = (varName: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!raw) return fallback;
    if (raw.startsWith("#")) return raw.toUpperCase();
    // Expected format: "312 69% 45%" (with possible commas / extra spaces)
    const parts = raw.replace(/,/g, " ").split(/\s+/).filter(Boolean);
    if (parts.length < 3) return fallback;
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
    if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) return fallback;
    return hslToHex(h, s, l);
  } catch {
    return fallback;
  }
};

interface PlayerTheme {
  primary: string;   // accent color
  secondary: string; // dark surface (bg)
  icon: string;      // foreground/icons
  font: string;      // text color
}

/** Builds the live theme palette used to skin the embedded VidAPI player */
const getPlayerTheme = (): PlayerTheme => {
  if (typeof window === "undefined") {
    return {
      primary: "#C124A0",
      secondary: "#050505",
      icon: "#F5F5F0",
      font: "#F5F5F0",
    };
  }
  
  const style = getComputedStyle(document.documentElement);
  const h = parseFloat(style.getPropertyValue("--accent-h").trim());
  const s = parseFloat(style.getPropertyValue("--accent-s").trim());
  const l = parseFloat(style.getPropertyValue("--accent-l").trim());
  
  let primaryHex = "#C124A0"; // fallback
  if (!Number.isNaN(h) && !Number.isNaN(s) && !Number.isNaN(l)) {
    primaryHex = hslToHex(h, s, l);
  }

  return {
    primary: primaryHex,
    secondary: readCssHsl("--bg-card", "#050505"),    // Sleek dark surface
    icon: readCssHsl("--foreground", "#F5F5F0"),      // Off-white icons
    font: readCssHsl("--foreground", "#F5F5F0"),
  };
};

/** Builds the VidAPI/vaplayer customization query string */
const buildVidApiThemeParams = (): string => {
  const theme = getPlayerTheme();
  
  // Some players need the # encoded, some need it without. 
  // We provide variations to ensure it catches on any vidapi/vaplayer version.
  const hex = theme.primary;
  const hexNoHash = theme.primary.replace("#", "");

  const params = new URLSearchParams({
    // Visual customization (matches BNKhub site theme)
    color: hex, // Many players use `color=%23C124A0`
    colors: hex, 
    primaryColor: hex,
    primarycolor: hexNoHash, // Original used no hash
    secondarycolor: theme.secondary.replace("#", ""),
    iconcolor: theme.icon.replace("#", ""),
    fontcolor: theme.font.replace("#", ""),
    // Hide skin/color pickers in the player UI for a clean branded look
    hideprimarycolor: "true",
    hidesecondarycolor: "true",
    hideiconcolor: "true",
    hideiconset: "true",
    // Localization & playback
    lang: "ar",
    ds_lang: "ar",
    autoplay: "1",
    poster: "true",
    title: "true",
  });
  return params.toString();
};

/**
 * vidsrc-embed.ru (S2) helper
 */
export const getVidsrcEmbedUrl = (type: 'movie' | 'tv', imdb_id: string, tmdb_id: number | string, season?: number, episode?: number) => {
  const base = "https://vidsrc-embed.ru/embed";
  const idParam = imdb_id ? `imdb=${imdb_id}` : `tmdb=${tmdb_id}`;
  const lang = "ar";
  const themeParams = buildVidApiThemeParams(); // apply same theme to vidsrc
  
  if (type === 'movie') {
    return `${base}/movie?${idParam}&ds_lang=${lang}&${themeParams}`;
  }
  return `${base}/tv?${idParam}&season=${season}&episode=${episode}&ds_lang=${lang}&${themeParams}`;
};

/**
 * Main Source Fetchers
 */
export const getMovieSources = (imdb_id: string, tmdb_id: number | string, resumeAt?: number): string[] => {
  if (typeof tmdb_id === 'string' && tmdb_id.startsWith('m-')) {
    const custom = KABYLE_CONTENT.find(c => c.id === tmdb_id);
    if (custom && custom.video_url) return [custom.video_url];
  }

  const themeParams = buildVidApiThemeParams();
  const id = imdb_id || tmdb_id;
  const resumeParam = resumeAt ? `&resumeAt=${resumeAt}` : '';

  return [
    `https://vaplayer.ru/embed/movie/${imdb_id || tmdb_id}?${themeParams}${resumeParam}`, // S1: Primary (themed)
    getVidsrcEmbedUrl('movie', imdb_id, tmdb_id), // S2
    `https://vidzen.fun/movie/${id}?${themeParams}`, // S3: VidZen
  ];
};

export const getTVSources = (
  imdb_id: string,
  tmdb_id: number | string,
  season: number,
  episode: number,
  resumeAt?: number,
): string[] => {
  if (typeof tmdb_id === 'string' && tmdb_id.startsWith('s-')) {
    const custom = KABYLE_CONTENT.find(c => c.id === tmdb_id);
    if (custom && custom.episodes) {
      const ep = custom.episodes.find(e => e.id === episode);
      if (ep && ep.videoUrl) return [ep.videoUrl];
    }
  }

  const themeParams = buildVidApiThemeParams();
  const id = imdb_id || tmdb_id;
  const resumeParam = resumeAt ? `&resumeAt=${resumeAt}` : '';

  return [
    `https://vaplayer.ru/embed/tv/${imdb_id || tmdb_id}/${season}/${episode}?${themeParams}${resumeParam}`, // S1: Primary (themed)
    getVidsrcEmbedUrl('tv', imdb_id, tmdb_id, season, episode), // S2
    `https://vidzen.fun/tv/${id}?${themeParams}`, // S3: VidZen
  ];
};

export const SOURCE_LABELS = [
  "S1 · BNKhub serveur",
  "S2 · vidsrc-embed (Arabic)",
  "S3 · VidZen (Global)",
];
