/**
 * BNKhub — OpenSubtitles Service.
 * Uses the API Key provided by the user to search for and retrieve subtitles.
 */

const API_KEY = "91i9bLMhOrUs8Iqqz233TzBoPzvGZ7Oq";
const BASE_URL = "https://api.opensubtitles.com/api/v1";

export interface SubtitleResult {
  id: string;
  attributes: {
    language: string;
    release: string;
    display_name: string;
    url: string;
    file_id: number;
  };
}

export const searchSubtitles = async (imdb_id?: string, lang = "ar", query?: string, tmdb_id?: string | number) => {
  try {
    let url = `${BASE_URL}/subtitles?languages=${lang}`;
    
    if (imdb_id && imdb_id.trim() !== "" && imdb_id !== "undefined") {
      const cleanId = imdb_id.startsWith("tt") ? imdb_id.replace("tt", "") : imdb_id;
      url += `&imdb_id=${cleanId}`;
    } else if (tmdb_id && String(tmdb_id).trim() !== "" && tmdb_id !== "undefined") {
      url += `&tmdb_id=${tmdb_id}`;
    } else if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    } else {
      return [];
    }

    const response = await fetch(url, {
      headers: {
        "Api-Key": API_KEY,
        "Content-Type": "application/json",
        "User-Agent": "BNKhub v1.0"
      }
    });

    if (!response.ok) {
      console.error("OpenSubtitles API error:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.data as SubtitleResult[];
  } catch (error) {
    console.error("Failed to search subtitles:", error);
    return [];
  }
};

export const getDownloadUrl = async (file_id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/download`, {
      method: "POST",
      headers: {
        "Api-Key": API_KEY,
        "Content-Type": "application/json",
        "User-Agent": "BNKhub v1.0"
      },
      body: JSON.stringify({ file_id })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.link as string;
  } catch (error) {
    console.error("Failed to get download URL:", error);
    return null;
  }
};
