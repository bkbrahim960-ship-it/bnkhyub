import fetch from "node-fetch";

const KORALIVE_URL = "https://www.koralive-hd.com";
const MATCHES_TODAY_URL = `${KORALIVE_URL}/matches-today/`;

export default async function handler(req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    res.status(200);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.end();
    return;
  }

  try {
    const { detail } = req.query;

    if (detail) {
      const detailUrl = detail.startsWith("http") ? detail : `${KORALIVE_URL}${detail}`;
      const response = await fetch(detailUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
      });
      const html = await response.text();

      const iframes = [];
      const serverUrls = [];
      const srcPattern = /<iframe[^>]*src=["']([^"']+)["']/gi;
      let m;
      while ((m = srcPattern.exec(html)) !== null) {
        const src = m[1];
        if (src && !src.includes("koralive-hd") && !src.includes("/matches/")) {
          iframes.push(src);
        }
      }

      const dataAttrPattern = /data-(?:link|url|embed|stream)=["']([^"']+)["']/gi;
      while ((m = dataAttrPattern.exec(html)) !== null) {
        const val = m[1];
        if (val && (val.startsWith("http") || val.startsWith("//")) && !val.includes("koralive-hd")) {
          iframes.push(val.startsWith("//") ? `https:${val}` : val);
        }
      }

      const serverBtnPattern = /server-btn["'\s][^>]*data-(?:link|url|embed|stream)=["']([^"']+)["']/gi;
      while ((m = serverBtnPattern.exec(html)) !== null) {
        const val = m[1];
        if (val && (val.startsWith("http") || val.startsWith("//"))) {
          serverUrls.push(val.startsWith("//") ? `https:${val}` : val);
        }
      }

      res.status(200);
      res.setHeader("Content-Type", "application/json");
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.json({ iframes: [...new Set(iframes)], servers: [...new Set(serverUrls)] });
      return;
    }

    const response = await fetch(MATCHES_TODAY_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`koralive responded with ${response.status}`);
    }

    const html = await response.text();
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : "";

    res.status(200);
    res.setHeader("Content-Type", "application/json");
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.json({ html: bodyContent });
  } catch (err) {
    console.error("koralive proxy error:", err);
    res.status(502);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ error: err.message });
  }
}
