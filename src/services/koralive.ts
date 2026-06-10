export interface MatchStreams {
  iframes: string[];
  servers: string[];
}

export interface KoraliveMatch {
  id: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
  homeLogo: string | null;
  awayLogo: string | null;
  kickoff: string | null;
  score: string | null;
  status: {
    initial: string | null;
    text: string | null;
    class: string | null;
  };
  channel: string | null;
  commentator: string | null;
  league: string | null;
  detailUrl: string | null;
  venue: string | null;
  timestamps: {
    start: string | null;
    end: string | null;
    naive: string | null;
  };
  streams?: MatchStreams;
}

interface KoraliveResponse {
  scrapedAt: string;
  source: string;
  totalMatches: number;
  matches: KoraliveMatch[];
}

const API_BASE = "/api/koralive";

function parseKickoff(time: string | null): string {
  if (!time) return "";
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${m}`;
}

function parseDate(naive: string | null): string {
  if (!naive) return "";
  const d = new Date(naive.replace("T", " "));
  if (isNaN(d.getTime())) return naive.split("T")[0] || "";
  return d.toLocaleDateString("en-CA");
}

export function matchDate(match: KoraliveMatch): string {
  return parseDate(match.timestamps.naive);
}

export function matchTime(match: KoraliveMatch): string {
  return parseKickoff(match.kickoff);
}

export async function fetchMatches(): Promise<KoraliveMatch[]> {
  const res = await fetch(`${API_BASE}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error("الموقع المصدر غير متاح حالياً، حاول مرة أخرى لاحقاً");
  }
  const json = await res.json();

  if (json.matches) return json.matches;
  if (json.error) throw new Error(json.error);
  if (!json.html) throw new Error("Failed to load matches");

  const html = `<html><body>${json.html}</body></html>`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const matches: KoraliveMatch[] = [];

  doc.querySelectorAll(".mc.mc-classic").forEach((el) => {
    const id = (el.getAttribute("id") || "").replace("m-", "") || null;
    const dataStart = el.getAttribute("data-start") || null;
    const dataEnd = el.getAttribute("data-end") || null;
    const dataNaive = el.getAttribute("data-naive") || null;
    const statusInitial = el.getAttribute("data-status-initial") || null;

    const teamNames: string[] = [];
    const teamLogos: string[] = [];
    el.querySelectorAll(".mt-name").forEach((n) => teamNames.push(n.textContent?.trim() || ""));
    el.querySelectorAll(".mt-logo img").forEach((img) => {
      teamLogos.push(img.getAttribute("data-src") || img.getAttribute("src") || "");
    });

    const kickoff = el.querySelector(".mt-kick")?.textContent?.trim() || null;

    const scoreEls = el.querySelectorAll(".ms-score");
    const score = scoreEls.length === 2
      ? `${scoreEls[0].textContent?.trim()} - ${scoreEls[1].textContent?.trim()}`
      : null;

    const badge = el.querySelector(".ms-badge");
    const statusText = badge?.textContent?.trim() || null;
    const statusClass =
      Array.from(badge?.classList || [])
        .find((c) => c.startsWith("ms-") && c !== "ms-badge" && c !== "ms-badge-md") || null;

    let league: string | null = null;
    let channel: string | null = null;
    let commentator: string | null = null;
    el.querySelectorAll('.mc-div [class*="flex-1"]').forEach((div) => {
      const spans = div.querySelectorAll("span");
      const emoji = spans[0]?.textContent?.trim() || "";
      const text = spans[1]?.textContent?.trim() || "";
      if (emoji.includes("🏆")) league = text;
      else if (emoji.includes("📺")) channel = text;
      else if (emoji.includes("🎤")) commentator = text;
    });

    const detailUrl = (el.querySelector("a.absolute.inset-0") as HTMLAnchorElement)?.href || null;

    matches.push({
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
      venue: null,
      timestamps: { start: dataStart, end: dataEnd, naive: dataNaive },
    });
  });

  return matches;
}

export async function fetchMatchStreams(detailUrl: string): Promise<MatchStreams> {
  const res = await fetch(`${API_BASE}?detail=${encodeURIComponent(detailUrl)}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return { iframes: [], servers: [] };
  }
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return { iframes: json.iframes || [], servers: json.servers || [] };
}

export function groupMatchesByDate(matches: KoraliveMatch[]): Map<string, KoraliveMatch[]> {
  const groups = new Map<string, KoraliveMatch[]>();
  for (const m of matches) {
    const date = matchDate(m) || "غير محدد";
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(m);
  }
  return groups;
}

export function isMatchLive(status: string | null): boolean {
  return status === "live" || status === "halftime" || status === "et";
}

export function isMatchEnded(status: string | null): boolean {
  return status === "ended";
}

export function isMatchUpcoming(status: string | null): boolean {
  return status === "not_started" || status === "starting_soon" || status === "soon";
}
