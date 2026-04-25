export interface M3UChannel {
  name: string;
  url: string;
  logo: string | null;
  category: string;
}

export const parseM3U = (content: string): M3UChannel[] => {
  const lines = content.split('\n');
  const channels: M3UChannel[] = [];
  let currentCategory = "Général";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF')) {
      // Extract name (text after the last comma)
      const nameMatch = line.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : "Chaîne inconnue";

      // Extract logo
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const logo = logoMatch ? logoMatch[1] : null;

      // Extract category (group-title)
      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch && groupMatch[1]) {
        currentCategory = groupMatch[1];
      }

      // If name is a country flag placeholder (0.0.0.0 below it), update currentCategory
      const nextLine = lines[i + 1]?.trim();
      if (nextLine === '0.0.0.0') {
        currentCategory = name;
        i++; // skip 0.0.0.0 line
        continue;
      }

      // Find the URL (first non-empty line starting with http)
      let url = "";
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith('http')) {
          url = nextLine;
          i = j; // Move index forward
          break;
        }
        if (nextLine.startsWith('#EXTINF')) break; // Next channel started without URL
      }

      if (url) {
        channels.push({
          name,
          url,
          logo,
          category: currentCategory
        });
      }
    }
  }

  return channels;
};
