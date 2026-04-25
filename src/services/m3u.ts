/**
 * BNKhub — M3U Playlist Parser Service.
 * Used to fetch and parse external M3U playlists for Live TV and custom categories.
 */

export interface M3UItem {
  name: string;
  url: string;
  logo?: string;
  group?: string;
  id?: string;
}

export const parseM3U = (content: string): M3UItem[] => {
  const lines = content.split('\n');
  const items: M3UItem[] = [];
  let currentItem: Partial<M3UItem> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Extract metadata
      const nameMatch = line.match(/,(.*)$/);
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const idMatch = line.match(/tvg-id="([^"]*)"/);

      currentItem = {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown Channel',
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : 'General',
        id: idMatch ? idMatch[1] : undefined
      };
    } else if (line.startsWith('http')) {
      // It's a URL
      if (currentItem.name) {
        items.push({
          ...(currentItem as M3UItem),
          url: line
        });
        currentItem = {};
      }
    }
  }

  return items;
};

export const fetchAndParseM3U = async (url: string): Promise<M3UItem[]> => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error('Failed to fetch M3U:', error);
    return [];
  }
};
