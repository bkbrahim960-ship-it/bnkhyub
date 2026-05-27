/**
 * BNKhub — Service Historique de lecture (Continuer à regarder).
 * Uses localStorage to store watch history locally.
 */

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

const MAX_HISTORY_ITEMS = 500;

const getLocalHistory = (): WatchHistoryEntry[] => {
  const data = localStorage.getItem("bnkhub_watch_history");
  return data ? JSON.parse(data) : [];
};

const saveLocalHistory = (history: WatchHistoryEntry[]) => {
  localStorage.setItem("bnkhub_watch_history", JSON.stringify(history));
};

/** Enregistre / met à jour une entrée d'historique pour l'utilisateur courant. */
export const upsertWatchEntry = async (
  userId: string,
  input: UpsertWatchInput,
): Promise<void> => {
  let history = getLocalHistory();

  const existingIndex = history.findIndex(
    h => h.user_id === userId && h.tmdb_id === input.tmdb_id && h.media_type === input.media_type && h.season_number === (input.season_number ?? null) && h.episode_number === (input.episode_number ?? null)
  );

  const row: WatchHistoryEntry = {
    id: existingIndex >= 0 ? history[existingIndex].id : crypto.randomUUID(),
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

  if (existingIndex >= 0) {
    history[existingIndex] = row;
  } else {
    history.push(row);
  }

  // Sort and keep limit
  history.sort((a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime());
  
  const userHistory = history.filter(h => h.user_id === userId);
  if (userHistory.length > MAX_HISTORY_ITEMS) {
    const toKeep = new Set(userHistory.slice(0, MAX_HISTORY_ITEMS).map(h => h.id));
    history = history.filter(h => h.user_id !== userId || toKeep.has(h.id));
  }

  saveLocalHistory(history);
};

export const getRecentHistory = async (
  userId: string,
  limit = MAX_HISTORY_ITEMS,
): Promise<WatchHistoryEntry[]> => {
  const history = getLocalHistory();
  return history
    .filter(h => h.user_id === userId)
    .sort((a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime())
    .slice(0, limit);
};

export const getSeriesHistory = async (
  userId: string,
  tmdbId: number,
): Promise<WatchHistoryEntry[]> => {
  const history = getLocalHistory();
  return history.filter(h => h.user_id === userId && h.tmdb_id === tmdbId);
};

export const deleteHistoryEntry = async (userId: string, id: string): Promise<void> => {
  const history = getLocalHistory();
  const filtered = history.filter(h => !(h.user_id === userId && h.id === id));
  saveLocalHistory(filtered);
};

