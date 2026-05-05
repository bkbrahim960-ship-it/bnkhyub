import axios from 'axios';
import { load } from 'cheerio';

/**
 * Video Scraper Service
 * BNKhub Native Scraper Engine
 */

export interface StreamSource {
  url: string;
  quality: string;
  provider: string;
  type: 'hls' | 'mp4';
}

/**
 * Scrapes Vidsrc.icu (Example of a cleaner provider)
 */
export const scrapeVidsrcIcu = async (type: 'movie' | 'tv', id: string, s?: number, e?: number): Promise<StreamSource[]> => {
  try {
    const baseUrl = "https://vidsrc.icu/embed";
    const url = type === 'movie' ? `${baseUrl}/movie/${id}` : `${baseUrl}/tv/${id}/${s}/${e}`;
    
    // In a real scenario, we might need a browser-like request or a specific API call
    // Most of these sites use obfuscated JS. 
    // For this demonstration, we'll return a formatted proxy URL that our backend will resolve
    
    return [{
      url: `${url}?autoplay=1`, 
      quality: "1080p",
      provider: "BNKhub Internal S1",
      type: "hls"
    }];
  } catch (error) {
    console.error("Scrape Error:", error);
    return [];
  }
};

/**
 * Scrapes Sudo-flix (Self-hosted API)
 */
export const scrapeSudoFlix = async (type: 'movie' | 'tv', id: string): Promise<StreamSource[]> => {
  try {
    // This assumes the sudo-flix API is running on localhost or a known URL
    // For this implementation, we point to the /api/stream endpoint
    const url = `http://localhost:4000/api/sudo-flix/stream?id=${id}`;
    
    return [{
      url: url,
      quality: "Auto",
      provider: "Sudo-flix (Internal)",
      type: "hls"
    }];
  } catch (error) {
    return [];
  }
};

/**
 * Main function to aggregate sources from internal scrapers
 */
export const getInternalSources = async (type: 'movie' | 'tv', id: string, s?: number, e?: number): Promise<StreamSource[]> => {
  const sources: StreamSource[] = [];
  
  // Try multiple providers
  const vidsrc = await scrapeVidsrcIcu(type, id, s, e);
  sources.push(...vidsrc);

  const sudo = await scrapeSudoFlix(type, id);
  sources.push(...sudo);
  
  return sources;
};
