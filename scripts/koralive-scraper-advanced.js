import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';

const BASE_URL = 'https://www.koralive-hd.com';
const MATCHES_TODAY_URL = `${BASE_URL}/matches-today/`;

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
    badge.attr('class')?.split(/\s+/).find((c) => c.startsWith('ms-') && c !== 'ms-badge' && c !== 'ms-badge-md') || null;

  let league = null, channel = null, commentator = null;
  $el.find('.mc-div [class*="flex-1"]').each((_, el) => {
    const emoji = $(el).find('span').first().text().trim();
    const text = $(el).find('span').last().text().trim();
    if (emoji.includes('🏆')) league = text;
    else if (emoji.includes('📺')) channel = text;
    else if (emoji.includes('🎤')) commentator = text;
  });

  const detailUrl = $el.find('a.absolute.inset-0').attr('href') || null;

  return {
    id,
    homeTeam: teamNames[0] || null,
    awayTeam: teamNames[1] || null,
    homeLogo: teamLogos[0] || null,
    awayLogo: teamLogos[1] || null,
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

async function getStreamsFromPage(page) {
  const requests = [];
  page.on('request', (req) => {
    const url = req.url();
    if (
      url.includes('m3u8') || url.includes('.mp4') || url.includes('akamai') ||
      url.includes('googlevideo') || url.includes('youtube') || url.includes('cdn.') ||
      url.includes('stream') || url.includes('embed') || url.includes('player') ||
      (req.resourceType() === 'media')
    ) {
      requests.push({ url, type: req.resourceType() });
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (
      url.includes('m3u8') || url.includes('.mp4') || url.includes('akamai') ||
      url.includes('googlevideo') || url.includes('youtube') || url.includes('cdn.') ||
      res.headers()['content-type']?.includes('application/x-mpegURL') ||
      res.headers()['content-type']?.includes('video/')
    ) {
      requests.push({ url, type: 'response-media' });
    }
  });

  return await page.evaluate(() => {
    const isMatchUrl = (url) => url && url.includes('/matches/') && url.includes('koralive-hd');
    const results = { iframes: [], servers: [], players: [], serverButtons: [] };

    document.querySelectorAll('iframe').forEach((el) => {
      const src = el.src || el.getAttribute('data-src');
      if (src && !isMatchUrl(src) && !src.startsWith('data:')) results.iframes.push(src);
    });

    document.querySelectorAll('video source').forEach((el) => {
      const src = el.src;
      if (src) results.players.push({ type: 'video-source', url: src });
    });

    document.querySelectorAll('video').forEach((el) => {
      if (el.src) results.players.push({ type: 'video', url: el.src });
    });

    const linkSelectors = [
      '[data-link]', '[data-url]', '[data-embed]', '[data-stream]',
      '[data-src]', '[data-live]', '[data-player]',
      'a[href*="akamai"], a[href*="m3u8"], a[href*="mp4"], a[href*="stream"], a[href*="embed"]',
      '[class*="server"] a', '[class*="stream"] a', '[class*="embed"] a',
      '[class*="server-btn"]', '[class*="server-button"]',
    ];
    document.querySelectorAll(linkSelectors.join(',')).forEach((el) => {
      const val = el.dataset.link || el.dataset.url || el.dataset.embed || el.dataset.stream ||
                  el.dataset.src || el.dataset.live || el.dataset.player || el.href || el.textContent;
      if (val && !isMatchUrl(val) && val.length > 10 && (val.startsWith('http') || val.startsWith('//'))) {
        results.servers.push(val.trim());
      }
    });

    document.querySelectorAll('[class*="server-list"] a, [id*="server"] a, [class*="watch"] a').forEach((el) => {
      const href = el.href;
      if (href && !isMatchUrl(href) && href.startsWith('http') && !href.includes('koralive-hd')) {
        results.servers.push(href);
      }
    });

    const buttons = document.querySelectorAll('[class*="server"] button, [class*="stream"] button, [class*="embed"] button, [data-server], [onclick*="server"], [onclick*="stream"], [onclick*="play"]');
    buttons.forEach((el) => {
      results.serverButtons.push({
        text: (el.textContent || '').trim().slice(0, 50),
        onclick: (el.getAttribute('onclick') || '').slice(0, 200),
        dataServer: el.getAttribute('data-server') || '',
        id: el.id || '',
      });
    });

    results.iframes = [...new Set(results.iframes)];
    results.servers = [...new Set(results.servers)];
    return results;
  });
}

async function run() {
  console.log('⚽ KoraLive HD Advanced Scraper (Puppeteer)\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  });

  try {
    const page = await browser.newPage();

    console.log(`Fetching ${MATCHES_TODAY_URL} ...`);
    await page.goto(MATCHES_TODAY_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('.mc.mc-classic', { timeout: 10000 });

    const html = await page.content();
    const $ = cheerio.load(html);

    const matches = [];
    $('.mc.mc-classic').each((_, el) => {
      const match = parseMatchCard($, $(el));
      if (match.homeTeam && match.awayTeam) matches.push(match);
    });
    console.log(`Found ${matches.length} match(es).\n`);

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      console.log(`[${i + 1}/${matches.length}] ${match.homeTeam} vs ${match.awayTeam}`);

      if (match.detailUrl) {
        try {
          const detailPage = await browser.newPage();

          await detailPage.setRequestInterception(true);
          detailPage.on('request', (req) => {
            const url = req.url();
            if (
              url.includes('m3u8') || url.includes('.mp4') || url.includes('akamai') ||
              url.includes('googlevideo') || url.includes('youtube') || url.includes('cdn.') ||
              (url.includes('stream') && !url.includes('koralive')) ||
              req.resourceType() === 'media'
            ) {
              const s = match._streams = match._streams || [];
              if (!s.find((x) => x.url === url)) s.push({ url, type: req.resourceType(), source: 'request' });
            }
            req.continue();
          });

          detailPage.on('response', async (res) => {
            const url = res.url();
            const ct = res.headers()['content-type'] || '';
            if (
              url.includes('m3u8') || url.includes('.mp4') || ct.includes('application/x-mpegURL') || ct.includes('video/')
            ) {
              const s = match._streams = match._streams || [];
              if (!s.find((x) => x.url === url)) s.push({ url, type: 'response', source: 'network' });
            }
          });

          await detailPage.goto(match.detailUrl, { waitUntil: 'networkidle2', timeout: 30000 });

          await detailPage.waitForSelector('.mc', { timeout: 10000 }).catch(() => {});
          await new Promise((r) => setTimeout(r, 5000));

          const streams = await getStreamsFromPage(detailPage);
          match.streams = streams;

          const jsonLd = await detailPage.evaluate(() => {
            const el = document.querySelector('script[type="application/ld+json"]');
            return el ? el.textContent : null;
          });
          if (jsonLd) {
            try {
              const data = JSON.parse(jsonLd);
              const graph = data['@graph'] || [];
              for (const item of graph) {
                if (item['@type'] === 'SportsEvent' && item.location) {
                  match.venue = item.location.name || null;
                }
              }
            } catch { /* ignore */ }
          }

          await detailPage.close();
        } catch (err) {
          console.warn(`  ⚠ Detail page error: ${err.message}`);
          match.streams = { iframes: [], servers: [], players: [] };
        }
      } else {
        match.streams = { iframes: [], servers: [], players: [] };
      }

          if (match._streams) {
            match.streams.network = match._streams;
            delete match._streams;
          }
          const total = (match.streams?.iframes?.length || 0) +
                    (match.streams?.servers?.length || 0) +
                    (match.streams?.players?.length || 0) +
                    (match.streams?.network?.length || 0);
          console.log(`  → ${total} stream link(s) found (${match.streams?.iframes?.length || 0} iframes, ${match.streams?.servers?.length || 0} servers, ${match.streams?.players?.length || 0} players, ${match.streams?.network?.length || 0} network)`);
    }

    const output = {
      scrapedAt: new Date().toISOString(),
      source: MATCHES_TODAY_URL,
      totalMatches: matches.length,
      matches,
    };

    const filename = `koralive-matches-advanced-${new Date().toISOString().split('T')[0]}.json`;
    await writeFile(filename, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n✅ Saved to ${filename}`);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
