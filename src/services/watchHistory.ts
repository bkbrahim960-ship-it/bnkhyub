/**
 * BNKhub — Service Historique de lecture (Continuer à regarder).
 * Upsert par (user_id, tmdb_id, media_type, season, episode).
 */
import { supabase } from "@/integrations/supabase/client";

export interface WatchHistoryEntry {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season_number: number | null;
  episode_number: number | null;
  source_id: string | null;
  progress_seconds: number;
  duration_seconds: number | null;
  watched_at: string;
}

export interface UpsertWatchInput {
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  season_number?: number | null;
  episode_number?: number | null;
  source_id?: string | null;
  progress_seconds?: number;
  duration_seconds?: number | null;
}

/** Enregistre / met à jour une entrée d'historique pour l'utilisateur courant. */
export const upsertWatchEntry = async (
  userId: string,
  input: UpsertWatchInput,
): Promise<void> => {
  const row = {
    user_id: userId,
    tmdb_id: input.tmdb_id,
    media_type: input.media_type,
    title: input.title,
    poster_path: input.poster_path ?? null,
    backdrop_path: input.backdrop_path ?? null,
    season_number: input.season_number ?? null,
    episode_number: input.episode_number ?? null,
    source_id: input.source_id ?? null,
    progress_seconds: input.progress_seconds ?? 0,
    duration_seconds: input.duration_seconds ?? null,
    watched_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("watch_history")
    .upsert(row, {
      onConflict: "user_id,tmdb_id,media_type,season_number,episode_number",
    });
  if (error) throw error;
};

export const getRecentHistory = async (
  userId: string,
  limit = 20,
): Promise<WatchHistoryEntry[]> => {
  const { data, error } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userId)
    .order("watched_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as WatchHistoryEntry[];
};

export const deleteHistoryEntry = async (userId: string, id: string): Promise<void> => {
  const { error } = await supabase
    .from("watch_history")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw error;
};
