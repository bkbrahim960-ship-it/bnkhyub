/**
 * BNKhub — Script لجلب روابط حلقات المسلسلات الجزائرية
 * يبحث في: YouTube, Dailymotion, archive.org لكل حلقة على حدة
 * الاستعمال: node scripts/fetch-algerian-series.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SERIES = [
  { id: "s-sultan-achour-10",  title: "Sultan Achour 10",   year: "2015", cat: "دراما",   thumbnail: "", episodes: 30 },
  { id: "s-bnat-el-mahrousa",  title: "بنات المحروسة",       year: "2025", cat: "دراما",   thumbnail: "", episodes: 30 },
  { id: "s-el-harik",          title: "L'Incendie (El Harik)",year: "1974", cat: "دراما",   thumbnail: "", episodes: 15 },
  { id: "s-boudaw",            title: "BOUDAW",               year: "2013", cat: "كوميديا", thumbnail: "", episodes: 30 },
  { id: "s-el-barrani",        title: "البرّاني",             year: "2024", cat: "دراما",   thumbnail: "", episodes: 30 },
  { id: "s-el-ikhwa",          title: "الإخوة",               year: "2014", cat: "دراما",   thumbnail: "", episodes: 30 },
  { id: "s-dakious-makious",   title: "دقيوس ومقيوس",         year: "2018", cat: "كوميديا", thumbnail: "", episodes: 30 },
  { id: "s-fatima",            title: "فاطمة",                year: "2026", cat: "دراما",   thumbnail: "", episodes: 30 },
  { id: "s-nass-mlah-city",    title: "Nass Mlah City",       year: "2003", cat: "كوميديا", thumbnail: "", episodes: 30 },
  { id: "s-da-meziane",        title: "Da meziane",           year: "2010", cat: "كوميديا", thumbnail: "", episodes: 16 },
  { id: "s-hdach-hdach",       title: "حداش حداش",            year: "2023", cat: "دراما",   thumbnail: "", episodes: 30 },
  { id: "s-bled-music",        title: "Bled Music",           year: "1991", cat: "كوميديا", thumbnail: "", episodes: 15 },
  { id: "s-rebaa",             title: "Rebaa",                year: "2025", cat: "دراما",   thumbnail: "", episodes: 30 },
  { id: "s-bila-houdoud",      title: "Bila Houdoud",         year: "1990", cat: "دراما",   thumbnail: "", episodes: 15 },
  { id: "s-les-dz-in-dubai",   title: "Les DZ in Dubaï",      year: "2021", cat: "كوميديا", thumbnail: "", episodes: 30 },
  { id: "s-ayech-balahf",      title: "عــايــــش بالــهـــــــف", year: "1992", cat: "دراما",   thumbnail: "", episodes: 15 },
  { id: "s-jouhouh-el-hayat",  title: "جروح الحياة",          year: "2009", cat: "دراما",   thumbnail: "", episodes: 30 },
  { id: "s-el-batha",          title: "El Batha",             year: "2023", cat: "دراما",   thumbnail: "", episodes: 30 },
];

const YT_KEY = "AIzaSyAmZgg4KJBIBLdItj8OqTge2hnzx8hUJ4g";
const DM_API = "https://api.dailymotion.com/videos?fields=id,title,url&limit=3&search=";

function q(s) { return encodeURIComponent(s); }
function dmEmbed(id) { return `https://geo.dailymotion.com/player.html?video=${id}`; }
function ytEmbed(id) { return `https://www.youtube.com/embed/${id}`; }
function arEmbed(id) { return `https://archive.org/embed/${id}`; }

async function searchDailymotion(query) {
  try {
    const res = await fetch(`${DM_API}${q(query)}`);
    const data = await res.json();
    return (data.list || []).map(v => ({ p: "dailymotion", title: v.title, url: dmEmbed(v.id) }));
  } catch { return []; }
}

async function searchArchive(query) {
  try {
    const res = await fetch(`https://archive.org/advancedsearch.php?output=json&fl[]=identifier,title&rows=3&q=${q(query)}`);
    const data = await res.json();
    return (data.response?.docs || []).map(d => ({ p: "archive", title: d.title, url: arEmbed(d.identifier) }));
  } catch { return []; }
}

async function searchYoutube(query) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q(query)}&key=${YT_KEY}&maxResults=5&type=video`;
    const res = await fetch(url);
    if (!res.ok) { console.error(`   YouTube API error: ${res.status}`); return []; }
    const data = await res.json();
    return (data.items || []).map(v => ({
      p: "youtube",
      title: v.snippet.title,
      url: ytEmbed(v.id.videoId),
    }));
  } catch (e) { console.error(`   YouTube fetch error: ${e.message}`); return []; }
}

async function searchAll(query) {
  const results = [];
  for (const searchFn of [searchYoutube, searchDailymotion, searchArchive]) {
    const res = await searchFn(query);
    results.push(...res);
  }
  return results;
}

async function main() {
  const totalSeries = SERIES.length;
  let totalEpisodes = 0;
  let foundEpisodes = 0;

  const fullResults = [];

  for (const s of SERIES) {
    process.stdout.write(`\n📺 ${s.title} (${s.episodes} حلقة)...\n`);
    const episodeResults = [];

    for (let ep = 1; ep <= s.episodes; ep++) {
      totalEpisodes++;
      const queries = [
        `${s.title} الحلقة ${ep}`,
        `${s.title} الجزء ${ep}`,
        `${s.title} ep ${ep}`,
      ];

      let bestUrl = "";
      let bestSource = "";
      let foundTitle = "";

      for (const query of queries) {
        const results = await searchAll(query);
        for (const r of results) {
          if (r.url) {
            bestUrl = r.url;
            bestSource = r.p;
            foundTitle = r.title;
            break;
          }
        }
        if (bestUrl) break;
      }

      const status = bestUrl ? "✓" : "✗";
      process.stdout.write(`   الحلقة ${ep}: ${status} `);

      episodeResults.push({
        id: ep,
        title: `الحلقة ${ep}`,
        videoUrl: bestUrl,
        source: bestSource,
        foundTitle,
      });

      if (bestUrl) foundEpisodes++;
    }

    fullResults.push({
      id: s.id,
      title: s.title,
      year: s.year,
      category: s.cat,
      thumbnail: s.thumbnail,
      episodes: s.episodes,
      episodeResults,
    });
  }

  // Generate TypeScript file
  let ts = `// Generated by scripts/fetch-algerian-series.mjs\n`;
  ts += `// تم البحث عن ${totalEpisodes} حلقة، وجد ${foundEpisodes} رابط\n\n`;

  ts += `export interface AlgerianEpisode {\n`;
  ts += `  id: number;\n`;
  ts += `  title: string;\n`;
  ts += `  videoUrl: string;\n`;
  ts += `}\n\n`;
  ts += `export interface AlgerianSeries {\n`;
  ts += `  id: string;\n`;
  ts += `  title: string;\n`;
  ts += `  description: string;\n`;
  ts += `  thumbnail: string;\n`;
  ts += `  category: string;\n`;
  ts += `  year: string;\n`;
  ts += `  rating: number;\n`;
  ts += `  episodes: AlgerianEpisode[];\n`;
  ts += `}\n\n`;
  ts += `export const ALGERIAN_SERIES: AlgerianSeries[] = [\n`;

  for (const r of fullResults) {
    ts += `  {\n`;
    ts += `    id: "${r.id}",\n`;
    ts += `    title: "${r.title}",\n`;
    ts += `    description: "مسلسل جزائري ${r.category} من سنة ${r.year}",\n`;
    ts += `    thumbnail: "${r.thumbnail}",\n`;
    ts += `    category: "${r.category}",\n`;
    ts += `    year: "${r.year}",\n`;
    ts += `    rating: 0,\n`;
    ts += `    episodes: [\n`;

    for (const ep of r.episodeResults) {
      const url = ep.videoUrl || "";
      ts += `      { id: ${ep.id}, title: "${ep.title}", videoUrl: "${url}" },\n`;
    }

    ts += `    ],\n`;
    ts += `  },\n`;
  }

  ts += `];\n`;

  const outputPath = join(__dirname, "..", "src", "services", "algerianSeries.ts");
  writeFileSync(outputPath, ts);

  // Print summary
  console.log(`\n\n========================================`);
  console.log(`✅ تم البحث في ${totalSeries} مسلسل`);
  console.log(`📊 ${totalEpisodes} حلقة`);
  console.log(`🔗 وجد ${foundEpisodes} رابط embed`);
  console.log(`❌ ${totalEpisodes - foundEpisodes} حلقة بدون رابط`);
  console.log(`📁 الملف: src/services/algerianSeries.ts`);
  console.log(`========================================`);
}

main().catch(console.error);
