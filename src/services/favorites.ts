/**
 * BNKhub — Favorites Service (My List).
 * Uses localStorage to store favorites locally.
 */

export interface FavoriteEntry {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  added_at: string;
}

export interface AddFavoriteInput {
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
}

const getLocalFavorites = (): FavoriteEntry[] => {
  const data = localStorage.getItem("bnkhub_favorites");
  return data ? JSON.parse(data) : [];
};

const saveLocalFavorites = (favorites: FavoriteEntry[]) => {
  localStorage.setItem("bnkhub_favorites", JSON.stringify(favorites));
};

/** Add a movie/series to user's favorites */
export const addFavorite = async (userId: string, input: AddFavoriteInput): Promise<void> => {
  const favorites = getLocalFavorites();
  
  const existingIndex = favorites.findIndex(
    f => f.user_id === userId && f.tmdb_id === input.tmdb_id && f.media_type === input.media_type
  );

  const newEntry: FavoriteEntry = {
    id: crypto.randomUUID(),
    user_id: userId,
    tmdb_id: input.tmdb_id,
    media_type: input.media_type,
    title: input.title,
    poster_path: input.poster_path ?? null,
    backdrop_path: input.backdrop_path ?? null,
    added_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    favorites[existingIndex] = newEntry;
  } else {
    favorites.push(newEntry);
  }

  saveLocalFavorites(favorites);
};

/** Remove a movie/series from user's favorites */
export const removeFavorite = async (
  userId: string,
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<void> => {
  const favorites = getLocalFavorites();
  const filtered = favorites.filter(
    f => !(f.user_id === userId && f.tmdb_id === tmdbId && f.media_type === mediaType)
  );
  saveLocalFavorites(filtered);
};

/** Check if a movie/series is in user's favorites */
export const isFavorite = async (
  userId: string,
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<boolean> => {
  const favorites = getLocalFavorites();
  return favorites.some(
    f => f.user_id === userId && f.tmdb_id === tmdbId && f.media_type === mediaType
  );
};

/** Get all user favorites */
export const getUserFavorites = async (
  userId: string,
  limit = 50
): Promise<FavoriteEntry[]> => {
  const favorites = getLocalFavorites();
  const userFavs = favorites
    .filter(f => f.user_id === userId)
    .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
    .slice(0, limit);
  return userFavs;
};

