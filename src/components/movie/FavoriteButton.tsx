/**
 * BNKhub — FavoriteButton (Heart toggle for My List).
 */
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { addFavorite, removeFavorite, isFavorite } from "@/services/favorites";

interface Props {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  className?: string;
}

export const FavoriteButton = ({ tmdbId, mediaType, title, posterPath, backdropPath, className = "" }: Props) => {
  const { user } = useAuth();
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    isFavorite(user.id, tmdbId, mediaType).then(setFav).catch(() => {});
  }, [user, tmdbId, mediaType]);

  const toggle = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (fav) {
        await removeFavorite(user.id, tmdbId, mediaType);
        setFav(false);
      } else {
        await addFavorite(user.id, {
          tmdb_id: tmdbId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
        });
        setFav(true);
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  };

  // If not logged in, show a placeholder or just the button that does nothing (or prompt login later)

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`group/fav inline-flex items-center justify-center transition-all duration-300 text-sm font-medium ${
        fav
          ? "text-red-400 hover:text-red-300 hover:scale-110"
          : "text-white/70 hover:text-white hover:scale-110"
      } ${className}`}
      title={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={`w-5 h-5 transition-all duration-300 ${
          fav ? "fill-red-400 scale-110" : "group-hover/fav:scale-110"
        }`}
      />
    </button>
  );
};
