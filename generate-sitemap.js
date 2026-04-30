import fs from 'fs';
import https from 'https';

const API_KEY = "b4324b67a08420e0a1d85a6c90314211";
const BASE_URL = "https://bnk-huub.vercel.app";

const staticPages = [
  { url: "/", priority: 1.0, changefreq: "daily" },
  { url: "/movies", priority: 0.9, changefreq: "daily" },
  { url: "/series", priority: 0.9, changefreq: "daily" },
  { url: "/channels", priority: 0.8, changefreq: "weekly" },
  { url: "/search", priority: 0.7, changefreq: "monthly" }
];

const fetchTMDB = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

const delay = ms => new Promise(r => setTimeout(r, ms));

async function generateSitemap() {
  console.log("Fetching data from TMDB...");
  
  const movieUrls = [];
  const seriesUrls = [];
  
  // Fetch Top 5 pages of popular movies (100 movies)
  for (let page = 1; page <= 5; page++) {
    const data = await fetchTMDB(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`);
    if (data && data.results) {
      data.results.forEach(m => {
        movieUrls.push({ url: `/movie/${m.id}`, priority: 0.8, changefreq: "weekly" });
      });
    }
    await delay(100);
  }

  // Fetch Top 5 pages of popular series (100 series)
  for (let page = 1; page <= 5; page++) {
    const data = await fetchTMDB(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&page=${page}`);
    if (data && data.results) {
      data.results.forEach(s => {
        seriesUrls.push({ url: `/series/${s.id}`, priority: 0.8, changefreq: "weekly" });
      });
    }
    await delay(100);
  }

  const allUrls = [...staticPages, ...movieUrls, ...seriesUrls];
  
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  allUrls.forEach(({ url, priority, changefreq }) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority.toFixed(1)}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  fs.writeFileSync('./public/sitemap.xml', xml);
  console.log(`Generated sitemap.xml with ${allUrls.length} URLs!`);
}

generateSitemap();
