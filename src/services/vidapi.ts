/**
 * VidAPI (vaplayer.ru) Service
 * Handles content discovery from VidAPI's listing endpoints.
 */

export interface VidAPIItem {
  tmdb_id: string;
  imdb_id: string;
  title: string;
  year: string;
  poster_url: string;
  rating: string;
  genre: string;
  popularity: string;
  type: 'movie' | 'tv';
  embed_url: string;
}

export interface VidAPIPage<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  items: T[];
}

export interface VidAPIEpisode {
  show_tmdb_id: string;
  season_number: string;
  episode_number: string;
  episode_title: string;
  air_date: string;
  show_title: string;
  show_imdb_id: string;
  type: 'episode';
  embed_url: string;
}

const BASE_URL = "https://vidapi.ru";

export const getLatestMovies = async (page: number = 1): Promise<VidAPIPage<VidAPIItem>> => {
  const res = await fetch(`${BASE_URL}/movies/latest/page-${page}.json`);
  if (!res.ok) throw new Error("Failed to fetch latest movies from VidAPI");
  return res.json();
};

export const getLatestTVShows = async (page: number = 1): Promise<VidAPIPage<VidAPIItem>> => {
  const res = await fetch(`${BASE_URL}/tvshows/latest/page-${page}.json`);
  if (!res.ok) throw new Error("Failed to fetch latest TV shows from VidAPI");
  return res.json();
};

export const getLatestEpisodes = async (page: number = 1): Promise<VidAPIPage<VidAPIEpisode>> => {
  const res = await fetch(`${BASE_URL}/episodes/latest/page-${page}.json`);
  if (!res.ok) throw new Error("Failed to fetch latest episodes from VidAPI");
  return res.json();
};

export const getLibraryStats = async () => {
  const res = await fetch("https://vaplayer.ru/imdb/api/?action=stats");
  if (!res.ok) throw new Error("Failed to fetch VidAPI stats");
  return res.json();
};
