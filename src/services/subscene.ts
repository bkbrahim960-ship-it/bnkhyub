/**
 * BNKhub — Subscene Scraper Service.
 * Attempts to scrape Subscene via a CORS proxy.
 */

export const searchSubscene = async (title: string) => {
  try {
    const query = encodeURIComponent(title);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://subscene.com/subtitles/searchbytitle?query=${query}`)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) return [];
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Find search results
    const results: any[] = [];
    const searchResultLinks = doc.querySelectorAll(".search-result ul li a");
    
    searchResultLinks.forEach(link => {
      const text = link.textContent?.trim();
      const href = (link as HTMLAnchorElement).getAttribute("href");
      if (text && href) {
        results.push({ title: text, url: `https://subscene.com${href}` });
      }
    });
    
    return results;
  } catch (error) {
    console.error("Subscene scraping failed:", error);
    return [];
  }
};
