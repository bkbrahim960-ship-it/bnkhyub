/**
 * BNKhub — Algerian Series Episode Link Finder
 * Smart search: 1 YouTube call/series + Dailymotion per episode fallback
 * Usage: node scripts/fetch-algerian-series.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const YT_KEY = "AIzaSyAmZgg4KJBIBLdItj8OqTge2hnzx8hUJ4g";

const SERIES = [
  { id: "s-sultan-achour-10",  title: "Sultan Achour 10",     year: "2015", cat: "دراما",   eps: 30 },
  { id: "s-bnat-el-mahrousa",  title: "بنات المحروسة",         year: "2025", cat: "دراما",   eps: 30 },
  { id: "s-el-harik",          title: "L'Incendie (El Harik)", year: "1974", cat: "دراما",   eps: 15 },
  { id: "s-boudaw",            title: "BOUDAW",                 year: "2013", cat: "كوميديا", eps: 30 },
  { id: "s-el-barrani",        title: "البرّاني",               year: "2024", cat: "دراما",   eps: 30 },
  { id: "s-el-ikhwa",          title: "الإخوة",                 year: "2014", cat: "دراما",   eps: 30 },
  { id: "s-dakious-makious",   title: "دقيوس ومقيوس",           year: "2018", cat: "كوميديا", eps: 30 },
  { id: "s-fatima-2026",       title: "فاطمة",                  year: "2026", cat: "دراما",   eps: 30 },
  { id: "s-nass-mlah-city",    title: "Nass Mlah City",         year: "2003", cat: "كوميديا", eps: 30 },
  { id: "s-da-meziane",        title: "Da meziane",             year: "2010", cat: "كوميديا", eps: 16 },
  { id: "s-hdach-hdach",       title: "حداش حداش",              year: "2023", cat: "دراما",   eps: 30 },
  { id: "s-bled-music",        title: "Bled Music",             year: "1991", cat: "كوميديا", eps: 15 },
  { id: "s-rebaa",             title: "Rebaa",                  year: "2025", cat: "دراما",   eps: 30 },
  { id: "s-bila-houdoud",      title: "Bila Houdoud",           year: "1990", cat: "دراما",   eps: 15 },
  { id: "s-les-dz-in-dubai",   title: "Les DZ in Dubaï",        year: "2021", cat: "كوميديا", eps: 30 },
  { id: "s-ayech-balahf",      title: "عايش بالهف",             year: "1992", cat: "دراما",   eps: 15 },
  { id: "s-jouhouh-el-hayat",  title: "جروح الحياة",            year: "2009", cat: "دراما",   eps: 30 },
  { id: "s-el-batha",          title: "El Batha",               year: "2023", cat: "دراما",   eps: 30 },
];

const DM_API = "https://api.dailymotion.com/videos?fields=id,title,url&limit=3&search=";
const ARCH_API = "https://archive.org/advancedsearch.php?output=json&fl[]=identifier,title&rows=3&q=";

function esc(s) { return encodeURIComponent(s); }
function ytE(id) { return `https://www.youtube.com/embed/${id}`; }
function dmE(id) { return `https://geo.dailymotion.com/player.html?video=${id}`; }
function arE(id) { return `https://archive.org/embed/${id}`; }

function extractEp(title) {
  const patterns = [
    /الحلقة\s*(\d+)/, /الحلقه\s*(\d+)/, /حلقة\s*(\d+)/,
    /ep(?:isode)?\s*[#:]?\s*(\d+)/i, /E(\d+)/i, /\bP(\d+)\b/,
  ];
  for (const p of patterns) {
    const m = title.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

async function getYouTubeEpisodes(seriesTitle) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${esc(seriesTitle + " الحلقة")}&key=${YT_KEY}&maxResults=50&type=video`;
    const res = await fetch(url);
    if (!res.ok) { if (res.status !== 429) console.error(`   YT ${res.status}`); return {}; }
    const data = await res.json();
    const map = {};
    for (const v of (data.items || [])) {
      const ep = extractEp(v.snippet.title);
      if (ep) {
        if (!map[ep]) map[ep] = [];
        map[ep].push(v.id.videoId);
      }
    }
    if (data.nextPageToken) {
      try {
        const url2 = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${esc(seriesTitle + " الحلقة")}&key=${YT_KEY}&maxResults=50&type=video&pageToken=${data.nextPageToken}`;
        const r2 = await fetch(url2);
        if (r2.ok) {
          const d2 = await r2.json();
          for (const v of (d2.items || [])) {
            const ep = extractEp(v.snippet.title);
            if (ep) {
              if (!map[ep]) map[ep] = [];
              map[ep].push(v.id.videoId);
            }
          }
        }
      } catch {}
    }
    return map;
  } catch { return {}; }
}

async function searchDM(query) {
  try {
    const r = await fetch(`${DM_API}${esc(query)}`);
    const d = await r.json();
    return (d.list || []).map(v => ({ p: "dm", title: v.title, url: dmE(v.id) }));
  } catch { return []; }
}

async function searchAR(query) {
  try {
    const r = await fetch(`${ARCH_API}${esc(query)}`);
    const d = await r.json();
    return (d.response?.docs || []).map(x => ({ p: "ar", title: x.title, url: arE(x.identifier) }));
  } catch { return []; }
}

async function main() {
  let total = 0, found = 0;
  const all = [];

  for (const s of SERIES) {
    process.stdout.write(`\n📺 ${s.title}... `);

    const ytMap = await getYouTubeEpisodes(s.title);
    const ytCount = Object.keys(ytMap).length;
    process.stdout.write(`[YT:${ytCount}] `);

    const eps = [];
    for (let e = 1; e <= s.eps; e++) {
      total++;
      let url = "";
      if (ytMap[e] && ytMap[e].length > 0) {
        url = ytE(ytMap[e][0]);
      }
      if (!url) {
        const results = [...await searchDM(`${s.title} الحلقة ${e}`), ...await searchAR(`${s.title} الحلقة ${e}`)];
        if (results.length > 0) url = results[0].url;
      }
      if (url) found++;
      eps.push(`      { id: ${e}, title: "الحلقة ${e}", videoUrl: "${url}" }`);
    }

    all.push({
      id: s.id, title: s.title, year: s.year, cat: s.cat,
      eps: `    episodes: [\n${eps.join(",\n")}\n    ]`
    });
  }

  // Generate TS
  let ts = `// Generated by scripts/fetch-algerian-series.mjs\n`;
  ts += `// وجد ${found}/${total} حلقة\n\n`;
  ts += `export interface AlgerianEpisode {\n`;
  ts += `  id: number;\n  title: string;\n  videoUrl: string;\n}\n\n`;
  ts += `export interface AlgerianSeries {\n`;
  ts += `  id: string;\n  title: string;\n  description: string;\n  thumbnail: string;\n`;
  ts += `  category: string;\n  year: string;\n  rating: number;\n  episodes: AlgerianEpisode[];\n}\n\n`;
  ts += `export const ALGERIAN_SERIES: AlgerianSeries[] = [\n`;

  for (const a of all) {
    ts += `  {\n`;
    ts += `    id: "${a.id}",\n    title: "${a.title}",\n`;
    ts += `    description: "مسلسل جزائري ${a.cat} من سنة ${a.year}",\n`;
    ts += `    thumbnail: "",\n    category: "${a.cat}",\n    year: "${a.year}",\n    rating: 0,\n`;
    ts += `${a.eps},\n  },\n`;
  }
  ts += `];\n`;

  const out = join(__dirname, "..", "src", "services", "algerianSeries.ts");
  writeFileSync(out, ts);
  console.log(`\n\n✅ ${found}/${total} حلقة → ${out}`);
}

main().catch(console.error);
