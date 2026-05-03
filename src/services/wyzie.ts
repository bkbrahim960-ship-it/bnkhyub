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

/**
 * Search for subtitles on Wyzie Subs
 * @param id TMDB or IMDB ID
 * @param language Language code (e.g. 'ar', 'en', 'fr')
 */
export const searchWyzieSubtitles = async (id: string | number, language: string = "ar"): Promise<WyzieSubtitle[]> => {
  if (!API_KEY) {
    console.warn("Wyzie API Key is missing");
    return [];
  }

  try {
    const url = `${BASE_URL}/search?id=${id}&language=${language}&key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Wyzie API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Adjust mapping based on actual API response structure
    // Typically it's an array of objects with 'url' and 'lang'
    if (Array.isArray(data)) {
      return data.map((sub: any) => ({
        url: sub.url,
        lang: sub.lang || language,
        label: sub.label || `${language.toUpperCase()} (Wyzie)`,
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching Wyzie subtitles:", error);
    return [];
  }
};
