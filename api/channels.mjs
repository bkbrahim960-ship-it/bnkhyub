const M3U_URL = "https://raw.githubusercontent.com/abusaeeidx/IPTV-Scraper-Zilla/main/combined-playlist.m3u";
const PAGE_SIZE = 50;

let parsedCache = null;
let cacheTime = 0;

async function fetchAndParse() {
  const now = Date.now();
  if (parsedCache && now - cacheTime < 120000) return parsedCache;

  const res = await fetch(M3U_URL);
  const text = await res.text();
  const lines = text.split("\n");
  const channels = [];
  let current = null;

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("#EXTINF:")) {
      const groupMatch = t.match(/group-title="([^"]*)"/);
      const logoMatch = t.match(/tvg-logo="([^"]*)"/);
      const commaIdx = t.lastIndexOf(",");
      const name = commaIdx >= 0 ? t.slice(commaIdx + 1).trim() : "";
      current = {
        name,
        group: groupMatch ? groupMatch[1] : "Uncategorized",
        logo: logoMatch ? logoMatch[1] : "",
      };
    } else if (t.startsWith("http") && current) {
      current.url = t;
      channels.push(current);
      current = null;
    }
  }

  const groups = {};
  for (const c of channels) {
    const g = c.group;
    if (!groups[g]) groups[g] = 0;
    groups[g]++;
  }

  const result = { channels, groups };
  parsedCache = result;
  cacheTime = now;
  return result;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { channels, groups } = await fetchAndParse();
    const { page = "1", group, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);

    let filtered = channels;

    if (group) {
      filtered = filtered.filter((c) => c.group === group);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const start = (pageNum - 1) * PAGE_SIZE;
    const items = filtered.slice(start, start + PAGE_SIZE);

    res.json({
      channels: items,
      groups: Object.keys(groups).sort(),
      total,
      page: pageNum,
      totalPages,
      pageSize: PAGE_SIZE,
    });
  } catch (err) {
    console.error("channels error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
