import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.koralive-hd.com';
const MATCHES_TODAY_URL = `${BASE_URL}/matches-today/`;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const api = axios.create({
  headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(`[HTTP Error] ${err.config?.url} – ${err.message}`);
    return Promise.reject(err);
  },
);

function parseMatchCard($, $el) {
  const id = ($el.attr('id') || '').replace('m-', '') || null;

  const dataStart = $el.attr('data-start') || null;
  const dataEnd = $el.attr('data-end') || null;
  const dataNaive = $el.attr('data-naive') || null;
  const statusInitial = $el.attr('data-status-initial') || null;

  const teamNames = [];
  const teamLogos = [];
  $el.find('.mt-name').each((_, el) => teamNames.push($(el).text().trim()));
  $el.find('.mt-logo img').each((_, el) => {
    const $img = $(el);
    teamLogos.push($img.attr('data-src') || $img.attr('src') || null);
  });

  const kickoff = $el.find('.mt-kick').text().trim() || null;

  const scores = [];
  $el.find('.ms-score').each((_, el) => scores.push($(el).text().trim()));
  const score = scores.length === 2 ? `${scores[0]} - ${scores[1]}` : null;

  const badge = $el.find('.ms-badge');
  const statusText = badge.text().trim() || null;
  const statusClass =
    badge
      .attr('class')
      ?.split(/\s+/)
      .find((c) => c.startsWith('ms-') && c !== 'ms-badge' && c !== 'ms-badge-md') || null;

  let league = null;
  let channel = null;
  let commentator = null;
  $el.find('.mc-div [class*="flex-1"]').each((_, el) => {
    const emoji = $(el).find('span').first().text().trim();
    const text = $(el).find('span').last().text().trim();
    if (emoji.includes('🏆')) league = text;
    else if (emoji.includes('📺')) channel = text;
    else if (emoji.includes('🎤')) commentator = text;
  });

  const detailUrl = $el.find('a.absolute.inset-0').attr('href') || null;

  const homeTeam = teamNames[0] || null;
  const awayTeam = teamNames[1] || null;
  const homeLogo = teamLogos[0] || null;
  const awayLogo = teamLogos[1] || null;

  return {
    id,
    homeTeam,
    awayTeam,
    homeLogo,
    awayLogo,
    kickoff,
    score,
    status: { initial: statusInitial, text: statusText, class: statusClass },
    channel,
    commentator,
    league,
    detailUrl,
    timestamps: { start: dataStart, end: dataEnd, naive: dataNaive },
  };
}

async function scrapeMatchesToday() {
  console.log(`Fetching ${MATCHES_TODAY_URL} ...`);
  const { data: html } = await api.get(MATCHES_TODAY_URL);
  const $ = cheerio.load(html);

  const matches = [];
  $('.mc.mc-classic').each((_, el) => {
    const match = parseMatchCard($, $(el));
    if (match.homeTeam && match.awayTeam) matches.push(match);
  });

  console.log(`Found ${matches.length} match(es) on the listing page.`);
  return matches;
}

async function scrapeMatchDetail(match) {
  if (!match.detailUrl) return match;

  try {
    const { data: html } = await api.get(match.detailUrl);
    const $ = cheerio.load(html);

    const isMatchUrl = (url) => url && url.includes('/matches/') && url.includes('koralive-hd');
    const iframes = [];
    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !isMatchUrl(src)) iframes.push(src);
    });

    $('[data-link], [data-url], [data-embed], [data-stream]').each((_, el) => {
      const val =
        $(el).attr('data-link') ||
        $(el).attr('data-url') ||
        $(el).attr('data-embed') ||
        $(el).attr('data-stream');
      if (val && (val.startsWith('http') || val.startsWith('//')) && !isMatchUrl(val)) iframes.push(val);
    });

    const streamServers = [];
    $('[class*="server"], [class*="stream"], [class*="embed"]').each((_, el) => {
      const $el = $(el);
      const src = $el.attr('src') || $el.attr('data-src') || $el.attr('href');
      const text = $el.text().trim();
      if (src && (src.startsWith('http') || src.startsWith('//')) && !isMatchUrl(src)) streamServers.push(src);
      else if (text && text.match(/https?:\/\/[^\s]+/)) {
        const urls = text.match(/https?:\/\/[^\s]+/g);
        if (urls) streamServers.push(...urls.filter((u) => !isMatchUrl(u)));
      }
    });

    const venue = (() => {
      const jsonLd = $('script[type="application/ld+json"]').text();
      if (jsonLd) {
        try {
          const data = JSON.parse(jsonLd);
          const graph = data['@graph'] || [];
          for (const item of graph) {
            if (item['@type'] === 'SportsEvent' && item.location) {
              return item.location.name || null;
            }
          }
        } catch { /* ignore parse errors */ }
      }
      const el = $('[class*="stadium"]:not([class*="player"]), [class*="venue"]:not([class*="player"])').first();
      return el.text().trim() || null;
    })();

    match.streams = {
      iframes: [...new Set(iframes)],
      servers: [...new Set(streamServers)],
    };
    match.venue = venue;
  } catch (err) {
    console.warn(`  ⚠ Could not fetch details for ${match.homeTeam} vs ${match.awayTeam}`);
    match.streams = { iframes: [], servers: [] };
  }

  return match;
}

async function main() {
  console.log('⚽ KoraLive HD Scraper');
  console.log('━━━━━━━━━━━━━━━━━━━━━━\n');

  const matches = await scrapeMatchesToday();

  if (matches.length === 0) {
    console.log('No matches found. The site structure may have changed.');
    process.exit(0);
  }

  console.log(`\nFetching details for ${matches.length} match(es) ...\n`);
  for (const match of matches) {
    process.stdout.write(`  ${match.homeTeam} vs ${match.awayTeam} ... `);
    await scrapeMatchDetail(match);
    console.log('done');
  }

  const output = {
    scrapedAt: new Date().toISOString(),
    source: MATCHES_TODAY_URL,
    totalMatches: matches.length,
    matches,
  };

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `koralive-matches-${dateStr}.json`;
  const publicDir = new URL('../public/data/', import.meta.url);
  const fs = await import('fs/promises');
  await fs.writeFile(filename, JSON.stringify(output, null, 2), 'utf-8');
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(new URL('matches.json', publicDir), JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Saved to ${filename} and public/data/matches.json`);

  console.log('\n📋 Summary:');
  for (const m of matches) {
    const time = m.kickoff || '';
    const score = m.score || '?';
    const status = m.status.text || m.status.initial || '';
    const streamCount = (m.streams?.iframes?.length || 0) + (m.streams?.servers?.length || 0);
    console.log(`  ${time} ${m.homeTeam} vs ${m.awayTeam} [${score}] ${status} — ${streamCount} stream(s)`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
