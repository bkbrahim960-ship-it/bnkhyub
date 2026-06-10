const isProd = !import.meta.env.DEV;
const API_BASE = isProd ? "/api/worldcup" : "/get";

export interface Team {
  id: string;
  name_en: string;
  name_fa: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
}

export interface Group {
  name: string;
  teams: { id: string }[];
}

export interface Game {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string;
  persian_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en?: string;
  home_team_name_fa?: string;
  away_team_name_en?: string;
  away_team_name_fa?: string;
}

export interface Stadium {
  id: string;
  name_en: string;
  name_fa: string;
  city_en: string;
  city_fa: string;
  capacity: number;
}

export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${API_BASE}/teams`);
  const json = await res.json();
  return json.teams;
}

export async function fetchTeamsByGroup(group: string): Promise<Team[]> {
  const res = await fetch(`${API_BASE}/teams?group=${group}`);
  const json = await res.json();
  return json.teams;
}

export async function fetchGames(): Promise<Game[]> {
  const res = await fetch(`${API_BASE}/games`);
  const json = await res.json();
  return json.games;
}

export async function fetchGroups(): Promise<Group[]> {
  const res = await fetch(`${API_BASE}/groups`);
  const json = await res.json();
  return json.groups;
}

export async function fetchStadiums(): Promise<Stadium[]> {
  const res = await fetch(`${API_BASE}/stadiums`);
  const json = await res.json();
  return json.stadiums;
}

export function groupGamesByDate(games: Game[]): Map<string, Game[]> {
  const groups = new Map<string, Game[]>();
  for (const g of games) {
    const date = g.local_date?.split(" ")[0] || "unknown";
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(g);
  }
  return groups;
}

export function getTeamFlag(game: Game, teamId: string): string {
  teamId = teamId.toString();
  const flags: Record<string, string> = {
    "1": "https://flagcdn.com/w80/mx.png",
    "2": "https://flagcdn.com/w80/za.png",
    "3": "https://flagcdn.com/w80/kr.png",
    "4": "https://flagcdn.com/w80/cz.png",
    "5": "https://flagcdn.com/w80/ca.png",
    "6": "https://flagcdn.com/w80/ba.png",
    "7": "https://flagcdn.com/w80/qa.png",
    "8": "https://flagcdn.com/w80/ch.png",
    "9": "https://flagcdn.com/w80/br.png",
    "10": "https://flagcdn.com/w80/ma.png",
    "11": "https://flagcdn.com/w80/ht.png",
    "12": "https://flagcdn.com/w80/gb-sct.png",
    "13": "https://flagcdn.com/w80/us.png",
    "14": "https://flagcdn.com/w80/py.png",
    "15": "https://flagcdn.com/w80/au.png",
    "16": "https://flagcdn.com/w80/tr.png",
    "17": "https://flagcdn.com/w80/de.png",
    "18": "https://flagcdn.com/w80/cw.png",
    "19": "https://flagcdn.com/w80/ci.png",
    "20": "https://flagcdn.com/w80/ec.png",
    "21": "https://flagcdn.com/w80/nl.png",
    "22": "https://flagcdn.com/w80/jp.png",
    "23": "https://flagcdn.com/w80/se.png",
    "24": "https://flagcdn.com/w80/tn.png",
    "25": "https://flagcdn.com/w80/be.png",
    "26": "https://flagcdn.com/w80/eg.png",
    "27": "https://flagcdn.com/w80/ir.png",
    "28": "https://flagcdn.com/w80/nz.png",
    "29": "https://flagcdn.com/w80/es.png",
    "30": "https://flagcdn.com/w80/cv.png",
    "31": "https://flagcdn.com/w80/sa.png",
    "32": "https://flagcdn.com/w80/uy.png",
    "33": "https://flagcdn.com/w80/fr.png",
    "34": "https://flagcdn.com/w80/sn.png",
    "35": "https://flagcdn.com/w80/iq.png",
    "36": "https://flagcdn.com/w80/no.png",
    "37": "https://flagcdn.com/w80/ar.png",
    "38": "https://flagcdn.com/w80/dz.png",
    "39": "https://flagcdn.com/w80/at.png",
    "40": "https://flagcdn.com/w80/jo.png",
    "41": "https://flagcdn.com/w80/pt.png",
    "42": "https://flagcdn.com/w80/cd.png",
    "43": "https://flagcdn.com/w80/uz.png",
    "44": "https://flagcdn.com/w80/co.png",
    "45": "https://flagcdn.com/w80/gb-eng.png",
    "46": "https://flagcdn.com/w80/hr.png",
    "47": "https://flagcdn.com/w80/gh.png",
    "48": "https://flagcdn.com/w80/pa.png",
  };
  return flags[teamId] || `https://flagcdn.com/w80/xx.png`;
}
