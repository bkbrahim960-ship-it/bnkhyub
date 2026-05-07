const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize FlixHQ provider (excellent for Western Movies/TV Shows)
const flixhq = new MOVIES.FlixHQ();

app.post('/api/stream/sources', async (req, res) => {
  const { type, id, season, episode } = req.body;
  
  try {
    // 1. Search for the movie/tv show by title (since FlixHQ uses its own IDs)
    // We expect the frontend to pass the title if possible, or we search by ID.
    // If the frontend only has TMDB ID, we'd ideally need the title. 
    // We will assume the frontend sends the title in the 'id' parameter for now, or we can just proxy the request.
    const searchResult = await flixhq.search(id);
    
    if (searchResult.results.length === 0) {
      return res.json({ sources: [] });
    }

    const mediaId = searchResult.results[0].id;

    // 2. Fetch media details
    const mediaInfo = await flixhq.fetchMediaInfo(mediaId);

    let episodeId = mediaInfo.episodes[0].id; // default to first

    if (type === 'tv' && season && episode) {
      // Find the correct episode
      const targetEp = mediaInfo.episodes.find(
        (ep) => ep.season === season && ep.number === episode
      );
      if (targetEp) {
        episodeId = targetEp.id;
      }
    }

    // 3. Fetch stream sources (.m3u8)
    const streamResult = await flixhq.fetchEpisodeSources(episodeId, mediaId);

    if (streamResult && streamResult.sources) {
      // Return raw links to the frontend
      return res.json({ sources: streamResult.sources });
    }
    
    return res.json({ sources: [] });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: "Failed to fetch sources", sources: [] });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`BNKhub Private Streaming Engine running on http://localhost:${PORT}`);
});
