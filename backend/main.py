
from fastapi import FastAPI, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
import re
import urllib.parse

app = FastAPI(title="BNKhub Stream Resolver")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock DB or Cache for resolved links (Optional)
cache = {}

@app.get("/")
async def root():
    return {"message": "BNKhub Resolver API is active"}

@app.get("/resolve")
async def resolve(tmdb_id: str, type: str = "movie", s: int = 1, e: int = 1):
    """
    Extracts the source URL from providers.
    Example: /resolve?tmdb_id=550&type=movie
    """
    base_url = "https://vidsrc.me/embed/"
    if type == "movie":
        target_url = f"{base_url}{tmdb_id}"
    else:
        target_url = f"{base_url}{tmdb_id}/{s}-{e}"

    headers = {
        "Referer": "https://vidsrc.me/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            response = await client.get(target_url, headers=headers)
            # Find the source URL (this regex is an example, providers change logic often)
            # In a real scenario, you'd use Playwright here to handle JS obfuscation
            match = re.search(r'file: "(.*?)"', response.text)
            if not match:
                match = re.search(r'source: "(.*?)"', response.text)
            
            if match:
                stream_url = match.group(1)
                return {
                    "success": True, 
                    "tmdb_id": tmdb_id,
                    "stream_url": f"http://localhost:8000/proxy?url={urllib.parse.quote(stream_url)}"
                }
            
            return {"success": False, "error": "No stream source found"}
        except Exception as ex:
            raise HTTPException(status_code=500, detail=str(ex))

@app.get("/proxy")
async def proxy(url: str):
    """
    Smart Proxy to bypass Referer/Origin checks.
    Injects necessary headers for .m3u8 playback.
    """
    decoded_url = urllib.parse.unquote(url)
    
    headers = {
        "Referer": "https://vidsrc.me/",
        "Origin": "https://vidsrc.me/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient() as client:
        try:
            # We fetch the actual stream data
            # Note: For real production, you might need to handle TS segments too
            resp = await client.get(decoded_url, headers=headers, follow_redirects=True)
            
            return Response(
                content=resp.content,
                media_type=resp.headers.get("Content-Type", "application/vnd.apple.mpegurl"),
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "max-age=3600"
                }
            )
        except Exception as ex:
            raise HTTPException(status_code=500, detail=f"Proxy error: {str(ex)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
