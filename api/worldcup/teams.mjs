import { loadTeams, sendJSON, sendError } from "./_data.mjs";

export default async function handler(req, res) {
  try {
    const { group } = req.query;
    let teams = loadTeams();
    if (group) {
      teams = teams.filter(t => t.groups === group.toUpperCase());
    }
    sendJSON(res, { teams });
  } catch (err) {
    sendError(res, err.message);
  }
}
