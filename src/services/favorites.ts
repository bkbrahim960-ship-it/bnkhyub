/**
 * BNKhub — Favorites Service (My List).
 * Manages user's favorite movies and series via Supabase.
 */
import { supabase } from "@/integrations/supabase/client";

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

/** Add a movie/series to user's favorites */
export const addFavorite = async (userId: string, input: AddFavoriteInput): Promise<void> => {
  const { error } = await supabase.from("favorites").upsert(
    {
      user_id: userId,
      tmdb_id: input.tmdb_id,
      media_type: input.media_type,
      title: input.title,
      poster_path: input.poster_path ?? null,
      backdrop_path: input.backdrop_path ?? null,
      added_at: new Date().toISOString(),
    },
    { onConflict: "user_id,tmdb_id,media_type" }
  );
  if (error) throw error;
};

/** Remove a movie/series from user's favorites */
export const removeFavorite = async (
  userId: string,
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<void> => {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);
  if (error) throw error;
};

/** Check if a movie/series is in user's favorites */
export const isFavorite = async (
  userId: string,
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .maybeSingle();
  if (error) return false;
  return !!data;
};

/** Get all user favorites */
export const getUserFavorites = async (
  userId: string,
  limit = 50
): Promise<FavoriteEntry[]> => {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as FavoriteEntry[];
};
