import { loadTeams, loadMatches, getTeamMap, enrichGames, sendJSON, sendError } from "./_data.mjs";

export default async function handler(req, res) {
  try {
    const teams = loadTeams();
    const teamMap = getTeamMap(teams);
    let games = loadMatches();
    games = enrichGames(games, teamMap);
    sendJSON(res, { games });
  } catch (err) {
    sendError(res, err.message);
  }
}
