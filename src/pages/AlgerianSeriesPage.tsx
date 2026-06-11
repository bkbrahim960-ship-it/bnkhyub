import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { VideoPlayer, VideoPlayerRef } from "@/components/player/VideoPlayer";
import { ChevronLeft, Play } from "lucide-react";
import { ALGERIAN_SERIES } from "@/services/algerianSeries";
import { useLanguage } from "@/context/LanguageContext";

const AlgerianSeriesPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const [currentEp, setCurrentEp] = useState(1);
  const playerRef = useRef<HTMLDivElement>(null);

  const series = ALGERIAN_SERIES.find((s) => s.id === id);

  useEffect(() => {
    setPlaying(false);
  }, [id]);

  if (!series) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h2 className="text-2xl font-bold">{lang === "ar" ? "المسلسل غير موجود" : "Série introuvable"}</h2>
          <Link to="/" className="text-accent hover:underline">{lang === "ar" ? "العودة للرئيسية" : "Retour à l'accueil"}</Link>
        </div>
      </Layout>
    );
  }

  const ep = series.episodes.find((e) => e.id === currentEp) || series.episodes[0];
  const totalEps = series.episodes.length;

  const playEpisode = (epNum: number) => {
    setCurrentEp(epNum);
    setPlaying(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-6">
          <ChevronLeft className="w-5 h-5" />
          {lang === "ar" ? "العودة" : "Retour"}
        </Link>

        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{series.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <span>{series.year}</span>
              <span className="px-3 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">{series.category}</span>
              <span>{totalEps} {lang === "ar" ? "حلقة" : "épisodes"}</span>
            </div>
            <p className="text-muted-foreground/80 max-w-2xl">{series.description}</p>
          </div>
        </div>

        {/* Player */}
        {playing && ep?.videoUrl && (
          <div ref={playerRef} className="scroll-mt-24 mb-12 animate-scale-in">
            <VideoPlayer
              key={currentEp}
              tmdb_id={series.id}
              type="tv"
              title={`${series.title} — ${ep.title}`}
              season={currentEp}
              episode={currentEp}
              customUrl={ep.videoUrl}
              autoStart={true}
            />
          </div>
        )}

        {/* Episode Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {lang === "ar" ? "الحلقات" : "Épisodes"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {series.episodes.map((e) => (
              <button
                key={e.id}
                onClick={() => playEpisode(e.id)}
                className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-left ${
                  currentEp === e.id && playing
                    ? "bg-accent text-accent-foreground border-accent shadow-glow-accent"
                    : "bg-surface-elevated/50 border-border hover:border-accent/50 hover:bg-surface-elevated"
                }`}
              >
                <Play className={`w-4 h-4 shrink-0 ${currentEp === e.id && playing ? "fill-current" : "text-accent"}`} />
                <span className="text-sm font-medium truncate">
                  {e.id}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AlgerianSeriesPage;
