export interface ScriptFootMatch {
  id: string;
  title: string;
  home_team: string | null;
  away_team: string | null;
  league: string | null;
  stadium: string | null;
  status: string;
  score: string | null;
  match_time: string | null;
  match_date: string | null;
  channels: string[];
  streams: string[];
  source: string | null;
  source_url: string | null;
  thumbnail: string | null;
}

interface ScriptFootResponse {
  success: boolean;
  data: ScriptFootMatch[];
  total: number;
  source: string | null;
  timestamp: string;
}

const API_BASE = "https://scriptfoot.onrender.com/api";

function parseTime(time: string | null): string {
  if (!time) return "";
  const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return time;
  let h = parseInt(m[1]);
  const min = m[2];
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${min}`;
}

export async function fetchScriptFootMatches(): Promise<ScriptFootMatch[]> {
  const res = await fetch(`${API_BASE}/matches`);
  if (!res.ok) throw new Error("فشل الاتصال بخادم المباريات");
  const json: ScriptFootResponse = await res.json();
  if (!json.success) throw new Error("فشل تحميل المباريات");
  return json.data;
}

export function isLive(status: string): boolean {
  return status === "live";
}

export function isEnded(status: string): boolean {
  return status === "ended" || status === "finished";
}

export function isUpcoming(status: string): boolean {
  return status === "scheduled" || status === "not_started" || status === "starting_soon";
}

export function matchTime(match: ScriptFootMatch): string {
  return parseTime(match.match_time);
}

export function matchDate(match: ScriptFootMatch): string {
  return match.match_date || "";
}
