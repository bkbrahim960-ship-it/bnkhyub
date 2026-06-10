import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "server", "data");

function loadJSON(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function loadTeams() {
  return loadJSON("football.teams.json").map(t => ({ ...t, _id: t.id }));
}

export function loadMatches() {
  return loadJSON("football.matches.json").map(m => ({ ...m, _id: m.id }));
}

export function loadStadiums() {
  return loadJSON("football.stadiums.json").map(s => ({ ...s, _id: s.id }));
}

export function getTeamMap(teams) {
  const map = {};
  for (const t of teams) {
    map[t.id] = { name_en: t.name_en, name_fa: t.name_fa };
  }
  return map;
}

export function enrichGames(games, teamMap) {
  return games.map(game => {
    if (game.home_team_id && teamMap[game.home_team_id]) {
      game.home_team_name_en = teamMap[game.home_team_id].name_en;
      game.home_team_name_fa = teamMap[game.home_team_id].name_fa;
    }
    if (game.away_team_id && teamMap[game.away_team_id]) {
      game.away_team_name_en = teamMap[game.away_team_id].name_en;
      game.away_team_name_fa = teamMap[game.away_team_id].name_fa;
    }
    return game;
  });
}

export function buildGroups(teams) {
  const groups = {};
  for (const t of teams) {
    if (t.groups) {
      if (!groups[t.groups]) groups[t.groups] = [];
      groups[t.groups].push({ id: t.id });
    }
  }
  return Object.entries(groups).map(([name, teams]) => ({ name, teams }));
}

export function sendJSON(res, data, status = 200) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(data);
}

export function sendError(res, message, status = 500) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({ error: message });
}
