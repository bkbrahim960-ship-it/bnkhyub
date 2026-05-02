/**
 * BNKhub — Coming Soon Page.
 * Affiche les films à venir avec un compte à rebours et un bouton "Rappeler-moi".
 */
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { IMG, TMDBMovie } from "@/services/tmdb";
import { Bell, BellRing, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

const BASE = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "b4324b67a08420e0a1d85a6c90314211";

interface UpcomingMovie extends TMDBMovie {
  daysUntilRelease?: number;
}

const fetchUpcoming = async (lang: string, page = 1) => {
  const url = `${BASE}/movie/upcoming?api_key=${API_KEY}&language=${lang}&page=${page}&region=US`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<{ results: TMDBMovie[] }>;
};

const getDaysUntil = (dateStr?: string): number | undefined => {
  if (!dateStr) return undefined;
  const release = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((release.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : undefined;
};

const CountdownBadge = ({ releaseDate }: { releaseDate?: string }) => {
  const { lang } = useLanguage();
  const days = getDaysUntil(releaseDate);

  if (!days) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/10 border border-accent/20 text-accent">
      <Clock className="w-4 h-4" />
      <span className="text-sm font-black">
        {days === 1
          ? lang === "ar" ? "غداً!" : "Demain !"
          : lang === "ar" ? `${days} يوم` : `${days} jours`}
      </span>
    </div>
  );
};

const ComingSoon = () => {
  const { lang, t } = useLanguage();
  const [movies, setMovies] = useState<UpcomingMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem("bnkhub_reminders");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    setLoading(true);
    fetchUpcoming(tmdbLang(lang))
      .then((data) => {
        const now = new Date();
        const upcoming = data.results
          .filter((m) => m.poster_path && m.release_date && new Date(m.release_date) > now)
          .map((m) => ({ ...m, daysUntilRelease: getDaysUntil(m.release_date) }))
          .sort((a, b) => (a.daysUntilRelease || 999) - (b.daysUntilRelease || 999));
        setMovies(upcoming);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  const toggleReminder = (movie: UpcomingMovie) => {
    setReminders((prev) => {
      const next = new Set(prev);
      if (next.has(movie.id)) {
        next.delete(movie.id);
        toast.info(lang === "ar" ? "تم إلغاء التذكير" : "Rappel annulé");
      } else {
        next.add(movie.id);
        toast.success(
          lang === "ar"
            ? `سيتم تذكيرك عند صدور "${movie.title}"`
            : `Vous serez rappelé pour "${movie.title}"`
        );
      }
      localStorage.setItem("bnkhub_reminders", JSON.stringify([...next]));
      return next;
    });
  };

  // Highlight movie for the hero section
  const heroMovie = movies[0];
  const heroBackdrop = heroMovie ? IMG.backdrop(heroMovie.backdrop_path, "original") : null;

  return (
    <Layout>
      <SEO
        title={lang === "ar" ? "قريباً — أفلام منتظرة" : "Bientôt — Films à venir"}
        description={lang === "ar" ? "اكتشف الأفلام القادمة واحجز تذكيرك على BNKhub." : "Découvrez les prochains films et programmez vos rappels sur BNKhub."}
      />

      {/* Hero Section */}
      {heroMovie && heroBackdrop && (
        <section className="relative min-h-[70vh] flex items-end pb-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={heroBackdrop} alt="" className="w-full h-full object-cover scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
          </div>
          <div className="container relative z-10 animate-fade-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                {lang === "ar" ? "الأكثر ترقباً" : "Le plus attendu"}
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 max-w-3xl">
              {heroMovie.title}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mb-8 line-clamp-3">{heroMovie.overview}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <CountdownBadge releaseDate={heroMovie.release_date} />
              <button
                onClick={() => toggleReminder(heroMovie)}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all text-sm ${
                  reminders.has(heroMovie.id)
                    ? "bg-accent text-accent-foreground shadow-glow"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                {reminders.has(heroMovie.id) ? (
                  <><BellRing className="w-5 h-5" /> {lang === "ar" ? "تم تفعيل التذكير" : "Rappel activé"}</>
                ) : (
                  <><Bell className="w-5 h-5" /> {lang === "ar" ? "ذكّرني" : "Rappeler-moi"}</>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="container pt-12 pb-20 min-h-[50vh]">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-10 w-1.5 bg-accent rounded-full shadow-glow" />
          <h2 className="font-display text-4xl text-gradient-accent">
            {lang === "ar" ? "قريباً في BNKhub" : "Bientôt sur BNKhub"}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl shimmer-gold" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((m, idx) => (
              <div key={m.id} className="animate-fade-slide-up relative group" style={{ animationDelay: `${idx * 40}ms` }}>
                <MovieCard
                  id={m.id}
                  title={m.title}
                  posterPath={m.poster_path}
                  year={m.release_date?.slice(0, 10)}
                  rating={m.vote_average}
                  type="movie"
                  className="w-full"
                />
                {/* Countdown overlay */}
                {m.daysUntilRelease && (
                  <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded-lg bg-black/70 backdrop-blur border border-accent/30 text-accent text-[10px] font-black">
                    ⏳ {m.daysUntilRelease}j
                  </div>
                )}
                {/* Reminder button */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleReminder(m); }}
                  className={`absolute bottom-20 right-3 z-20 w-9 h-9 rounded-full grid place-items-center border transition-all opacity-0 group-hover:opacity-100 ${
                    reminders.has(m.id)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-black/50 backdrop-blur border-white/10 hover:border-accent/50 text-white/70 hover:text-accent"
                  }`}
                  title={reminders.has(m.id) ? "Rappel activé" : "Rappeler-moi"}
                >
                  {reminders.has(m.id) ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ComingSoon;
