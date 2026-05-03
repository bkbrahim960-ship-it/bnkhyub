/**
 * BNKhub — Wyzie Subs Service
 * Integrated subtitle provider using sub.wyzie.io API.
 */

const API_KEY = import.meta.env.VITE_WYZIE_KEY;
const BASE_URL = "https://sub.wyzie.io";

export interface WyzieSubtitle {
  url: string;
  lang: string;
  label: string;
}

export const searchWyzieSubtitles = async (tmdbId: string | number, imdbId?: string, language: string = "ar"): Promise<WyzieSubtitle[]> => {
  if (!API_KEY) {
    console.warn("Wyzie API Key is missing");
    return [];
  }

  const fetchFromWyzie = async (id: string | number) => {
    try {
      const url = `${BASE_URL}/search?id=${id}&language=${language}&key=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  // Try TMDB first, then IMDB as fallback
  let data = await fetchFromWyzie(tmdbId);
  if (data.length === 0 && imdbId) {
    data = await fetchFromWyzie(imdbId);
  }

  return data.map((sub: any) => ({
    url: sub.url,
    lang: sub.language || language,
    label: sub.release || sub.display || `${language.toUpperCase()} (Wyzie)`,
  }));
};
