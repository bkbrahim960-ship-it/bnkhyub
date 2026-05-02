/**
 * BNKhub — YTS Subtitles Service.
 * Fetches subtitles from YTS API which is free and requires no key.
 */

export interface YTSSubtitle {
  language: string;
  url: string;
  rating: number;
}

export const searchYTSSubtitles = async (imdb_id: string) => {
  try {
    // YTS API for subtitles
    const response = await fetch(`https://yts-subs.com/api/v1/movie/${imdb_id}`);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.subtitles) return [];

    // Filter for Arabic
    const arabicSubs = data.subtitles.filter((s: any) => s.language === "arabic");
    
    return arabicSubs.map((s: any) => ({
      language: "Arabic",
      url: `https://yts-subs.com${s.url}`,
      rating: s.rating
    }));
  } catch (error) {
    console.error("YTS Subtitles fetch failed:", error);
    return [];
  }
};
