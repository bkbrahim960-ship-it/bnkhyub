import axios from 'axios';

/**
 * OpenSubtitles Free REST API (Basic search)
 */
export const searchOpenSubtitlesFree = async (imdb_id: string, lang = "en") => {
  try {
    const cleanId = imdb_id.startsWith('tt') ? imdb_id.replace('tt', '') : imdb_id;
    const url = `https://rest.opensubtitles.org/search/imdbid-${cleanId}/sublanguageid-${lang}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'TemporaryUserAgent'
      }
    });

    if (!Array.isArray(response.data) || response.data.length === 0) return null;

    // Pick the best match (highest rating or first)
    const bestMatch = response.data[0];
    return {
      source: 'opensubtitles',
      url: bestMatch.SubDownloadLink.replace('.gz', ''), // Usually we want the direct .srt
      lang: bestMatch.LanguageName,
      filename: bestMatch.SubFileName
    };
  } catch (error) {
    console.error("OpenSubtitles Free API Error:", error);
    return null;
  }
};

/**
 * Podnapisi.NET Search (Free)
 */
export const searchPodnapisi = async (imdb_id: string) => {
  try {
    const cleanId = imdb_id.startsWith('tt') ? imdb_id : `tt${imdb_id}`;
    const url = `https://www.podnapisi.net/subtitles/search/old?keywords=${cleanId}&language=en`;
    
    const response = await axios.get(url);
    // Podnapisi search results require parsing HTML (Cheerio)
    // This is a simplified version, ideally we parse the first download link
    return null; // Placeholder for full scraper implementation
  } catch (error) {
    return null;
  }
};
