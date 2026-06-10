import { loadStadiums, sendJSON, sendError } from "./_data.mjs";

export default async function handler(req, res) {
  try {
    const stadiums = loadStadiums();
    sendJSON(res, { stadiums });
  } catch (err) {
    sendError(res, err.message);
  }
}
