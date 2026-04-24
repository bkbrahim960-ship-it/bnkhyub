/**
 * BNKhub — Service TMDB.
 * API_KEY fournie par le client (publishable, OK en frontend).
 * Tous les appels acceptent un paramètre langue ISO (fr-FR, ar-SA, en-US, es-ES).
 */

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "b4324b67a08420e0a1d85a6c90314211";
const BASE = "https://api.themoviedb.org/3";

export const IMG = {
  poster: (p?: string | null, size: "w342" | "w500" | "w780" = "w500") =>
    p ? `https://image.tmdb.org/t/p/${size}${p}` : null,
  backdrop: (p?: string | null, size: "w780" | "w1280" | "original" = "original") =>
    p ? `https://image.tmdb.org/t/p/${size}${p}` : null,
  profile: (p?: string | null) =>
    p ? `https://image.tmdb.org/t/p/w185${p}` : null,
};

export interface TMDBMovie {
  id: number;
  imdb_id?: string | null;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  original_language?: string;
  videos?: { results: { key: string; site: string; type: string }[] };
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  similar?: { results: TMDBMovie[] };
}

export interface TMDBSeries {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  vote_average: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  external_ids?: { imdb_id?: string };
  seasons?: { season_number: number; episode_count: number; name: string; poster_path: string | null }[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
}

export interface TMDBSeason {
  _id: string;
  air_date: string;
  episodes: TMDBEpisode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
}

const fetchTMDB = async <T,>(path: string, params: Record<string, string> = {}): Promise<T> => {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status} on ${path}`);
  return res.json() as Promise<T>;
};

// ───── FILMS ─────
export const getPopularMovies = (lang = "fr-FR", page = 1) =>
  fetchTMDB<{ results: TMDBMovie[] }>("/movie/popular", { language: lang, page: String(page) });

export const getNowPlaying = (lang = "fr-FR", page = 1) =>
  fetchTMDB<{ results: TMDBMovie[] }>("/movie/now_playing", { language: lang, page: String(page) });

export const getTopRatedMovies = (lang = "fr-FR", page = 1) =>
  fetchTMDB<{ results: TMDBMovie[] }>("/movie/top_rated", { language: lang, page: String(page) });

export const getTrendingMovies = (lang = "fr-FR") =>
  fetchTMDB<{ results: TMDBMovie[] }>("/trending/movie/week", { language: lang });

export const getMovieDetails = (id: number | string, lang = "fr-FR") =>
  fetchTMDB<TMDBMovie>(`/movie/${id}`, { language: lang, append_to_response: "videos,credits,similar,external_ids" });

export const searchMovies = (query: string, lang = "fr-FR", page = 1) =>
  fetchTMDB<{ results: TMDBMovie[] }>("/search/movie", { query, language: lang, page: String(page) });

export const searchMulti = (query: string, lang = "fr-FR", page = 1) =>
  fetchTMDB<{ results: any[] }>("/search/multi", { query, language: lang, page: String(page) });

// ───── SÉRIES ─────
export const getPopularSeries = (lang = "fr-FR", page = 1) =>
  fetchTMDB<{ results: TMDBSeries[] }>("/tv/popular", { language: lang, page: String(page) });

export const getTopRatedSeries = (lang = "fr-FR", page = 1) =>
  fetchTMDB<{ results: TMDBSeries[] }>("/tv/top_rated", { language: lang, page: String(page) });

export const getSeriesDetails = (id: number | string, lang = "fr-FR") =>
  fetchTMDB<TMDBSeries>(`/tv/${id}`, { language: lang, append_to_response: "videos,credits,similar,external_ids" });

export const getSeasonDetails = (series_id: number | string, season_number: number, lang = "fr-FR") =>
  fetchTMDB<TMDBSeason>(`/tv/${series_id}/season/${season_number}`, { language: lang });

// ───── GENRES ─────
export const getMovieGenres = (lang = "fr-FR") =>
  fetchTMDB<{ genres: { id: number; name: string }[] }>("/genre/movie/list", { language: lang });
