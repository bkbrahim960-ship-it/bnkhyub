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

  const fetchFromWyzie = async (id: string | number, lang: string) => {
    try {
      const url = `${BASE_URL}/search?id=${id}&language=${lang}&key=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  // Priority: IMDB ID for Wyzie usually works better
  const searchId = imdbId || tmdbId;
  
  // Try Arabic first
  let data = await fetchFromWyzie(searchId, "ar");
  
  // If no Arabic, try English as fallback
  if (data.length === 0) {
    data = await fetchFromWyzie(searchId, "en");
  }

  // Final fallback with TMDB if IMDB was used and failed
  if (data.length === 0 && imdbId && tmdbId) {
    data = await fetchFromWyzie(tmdbId, "ar");
    if (data.length === 0) {
      data = await fetchFromWyzie(tmdbId, "en");
    }
  }

  return data.map((sub: any) => {
    let finalUrl = sub.url;
    if (finalUrl.includes('sub.wyzie.io') && !finalUrl.includes('key=')) {
      finalUrl += `&key=${API_KEY}`;
    }
    return {
      url: finalUrl,
      lang: sub.language || language,
      label: sub.release || sub.display || `${language.toUpperCase()} (Wyzie)`,
    };
  });
};
