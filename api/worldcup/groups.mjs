import { loadTeams, buildGroups, sendJSON, sendError } from "./_data.mjs";

export default async function handler(req, res) {
  try {
    const teams = loadTeams();
    const groups = buildGroups(teams);
    sendJSON(res, { groups });
  } catch (err) {
    sendError(res, err.message);
  }
}
