/**
 * BNKhub — OMDb (Open Movie Database) Service
 * Provides additional ratings: IMDb, Rotten Tomatoes, Metacritic
 */

const API_KEY = import.meta.env.VITE_OMDB_API_KEY || "";
const BASE_URL = "https://www.omdbapi.com/";

export interface OMDbRating {
  Source: string;
  Value: string;
}

export interface OMDbResult {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: OMDbRating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export const getOMDbDetails = async (
  imdbId?: string,
  title?: string,
  year?: string
): Promise<OMDbResult | null> => {
  if (!API_KEY) {
    console.warn("OMDb API key not configured");
    return null;
  }

  try {
    const url = new URL(BASE_URL);
    url.searchParams.set("apikey", API_KEY);

    if (imdbId) {
      url.searchParams.set("i", imdbId);
    } else if (title) {
      url.searchParams.set("t", title);
      if (year) url.searchParams.set("y", year);
    } else {
      return null;
    }

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    return data.Response === "True" ? data : null;
  } catch (error) {
    console.error("OMDb fetch error:", error);
    return null;
  }
};
