/**
 * BNKhub — Page Ma Liste (Favoris).
 */
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { useAuth } from "@/context/AuthContext";
import { getUserFavorites, FavoriteEntry } from "@/services/favorites";
import { Heart, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const MyList = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getUserFavorites(user.id)
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <section className="pt-28 pb-20">
          <div className="container flex flex-col items-center justify-center min-h-[50vh] text-center">
            <LogIn className="w-16 h-16 text-accent mb-6 animate-float" />
            <h1 className="font-display text-3xl md:text-4xl text-gradient-accent mb-4">
              Connectez-vous
            </h1>
            <p className="text-muted-foreground max-w-md mb-8">
              Connectez-vous pour sauvegarder vos films et séries préférés dans votre liste personnelle.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground font-semibold px-8 py-3 rounded-full shadow-accent"
            >
              Se connecter
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-28 pb-12">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-red-400 fill-red-400" />
            <h1 className="font-display text-4xl md:text-5xl text-gradient-accent">
              Ma Liste
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl shimmer-gold" />
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {favorites.map((f) => (
                <MovieCard
                  key={f.id}
                  id={f.tmdb_id}
                  title={f.title}
                  posterPath={f.poster_path}
                  type={f.media_type}
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <Heart className="w-20 h-20 text-muted-foreground/30 mb-6" />
              <h2 className="text-xl text-foreground mb-3">Votre liste est vide</h2>
              <p className="text-muted-foreground max-w-md">
                Parcourez les films et séries, puis appuyez sur le bouton "Ma liste" pour les ajouter ici.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MyList;
