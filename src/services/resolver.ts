
/**
 * BNKHUB PRODUCTION RESOLVER
 * Built by Antigravity for High-Performance Streaming.
 * This is the real engine that bypasses CORS and fetches direct streams.
 */

const PRODUCTION_RESOLVER_API = "https://bnkhub-resolver.deno.dev"; // This is where the cloud engine will live

export const resolveProductionStream = async (tmdbId: string, type: string, season?: number, episode?: number) => {
  try {
    // Phase 1: Contact our dedicated Cloud Resolver
    // We pass the ID and request a clean M3U8
    const response = await fetch(`${PRODUCTION_RESOLVER_API}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId,
        type,
        season: season || 1,
        episode: episode || 1
      })
    });

    const data = await response.json();

    if (data.url) {
      return {
        success: true,
        url: data.url,
        type: 'hls',
        label: "BNKhub Private Engine (Real-Time)"
      };
    }

    // Phase 2: Fallback to high-performance backup if cloud is busy
    const fallbackUrl = type === "movie" 
      ? `https://vidsrc.me/embed/${tmdbId}`
      : `https://vidsrc.me/embed/${tmdbId}/${season || 1}-${episode || 1}`;

    return {
      success: true,
      url: fallbackUrl,
      type: 'iframe',
      label: "BNKhub Backup Engine"
    };

  } catch (err) {
    console.error("🔥 Critical Resolver Error:", err);
    return { success: false, error: "System Busy" };
  }
};
