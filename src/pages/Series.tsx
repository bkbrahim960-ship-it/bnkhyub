/**
 * BNKhub — Page détail Série avec sélecteur saison/épisode.
 * Gère reprise (?resume=1&s=S&e=E&src=Sx) et sync historique Cloud.
 */
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { IMG, getSeriesDetails, getSeasonDetails, TMDBSeries, TMDBSeason } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { tmdbLang } from "@/services/i18n";
import { upsertWatchEntry } from "@/services/watchHistory";
import { SOURCE_LABELS } from "@/services/player";
import { Play, Star, Calendar, ArrowLeft } from "lucide-react";

const sourceIdToIndex = (srcId?: string | null): number => {
  if (!srcId) return 0;
  const i = SOURCE_LABELS.findIndex((l) => l.startsWith(srcId));
  return i >= 0 ? i : 0;
};

const Series = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [series, setSeries] = useState<TMDBSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [seasonData, setSeasonData] = useState<TMDBSeason | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  const resumeRequested = params.get("resume") === "1";
  const resumeSeason = Number(params.get("s")) || null;
  const resumeEpisode = Number(params.get("e")) || null;
  const initialSourceIndex = useMemo(() => sourceIdToIndex(params.get("src")), [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setPlaying(false);
    getSeriesDetails(id, tmdbLang(lang))
      .then((s) => {
        setSeries(s);
        if (resumeRequested && resumeSeason && resumeEpisode) {
          setSeason(resumeSeason);
          setEpisode(resumeEpisode);
          setPlaying(true);
        } else {
          const firstReal = s.seasons?.find((se) => se.season_number > 0);
          setSeason(firstReal?.season_number ?? 1);
          setEpisode(1);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  useEffect(() => {
    if (!series || !season) return;
    setSeasonLoading(true);
    getSeasonDetails(series.id, season, tmdbLang(lang))
      .then(setSeasonData)
      .finally(() => setSeasonLoading(false));
  }, [series, season, lang]);

  if (loading || !series) {
    return (
      <Layout>
        <div className="h-[60vh] shimmer-gold" />
      </Layout>
    );
  }

  const year = series.first_air_date?.slice(0, 4);
  const backdrop = IMG.backdrop(series.backdrop_path, "original");
  const poster = IMG.poster(series.poster_path);
  const imdb = series.external_ids?.imdb_id ?? "";
  const seasons = series.seasons?.filter((s) => s.season_number > 0) ?? [];

  const saveHistory = (sourceLabel: string) => {
    if (!user) return;
    const sid = sourceLabel.split(" ")[0];
    upsertWatchEntry(user.id, {
      tmdb_id: series.id,
      media_type: "tv",
      title: series.name,
      poster_path: series.poster_path,
      backdrop_path: series.backdrop_path,
      season_number: season,
      episode_number: episode,
      source_id: sid,
    }).catch(() => {});
  };

  return (
    <Layout>
      <section className="relative min-h-[60vh] pt-24 pb-10 overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 grain" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-primary via-surface-primary/80 to-surface-primary/30" />

        <div className="relative container grid md:grid-cols-[240px_1fr] gap-8 items-end">
          <Link
            to="/"
            className="absolute top-0 start-6 md:start-0 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> Retour
          </Link>
          {poster && (
            <img src={poster} alt={series.name} className="w-48 md:w-[240px] rounded-2xl border border-accent-subtle shadow-glow" />
          )}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {series.genres?.slice(0, 4).map((g) => (
                <span key={g.id} className="text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-accent-subtle text-accent bg-accent/5">
                  {g.name}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3 text-gradient-accent">
              {series.name}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-6">
              {series.vote_average > 0 && (
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Star className="w-4 h-4 text-accent fill-accent" /> {series.vote_average.toFixed(1)}
                </span>
              )}
              {year && <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {year}</span>}
              {series.number_of_seasons && <span>{series.number_of_seasons} saisons</span>}
            </div>
            <p className="text-foreground/85 max-w-3xl leading-relaxed">{series.overview}</p>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="mb-8">
          <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">Sélectionnez une saison</label>
          <select
            value={season}
            onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); setPlaying(false); }}
            className="bg-surface-card border border-border rounded-lg px-4 py-2.5 text-sm focus:border-accent-subtle focus:outline-none max-w-xs w-full"
          >
            {seasons.map((s) => (
              <option key={s.season_number} value={s.season_number}>{s.name}</option>
            ))}
          </select>
        </div>

        {playing && imdb && (
          <div id="player-section" className="mb-12 animate-fade-slide-up">
            <VideoPlayer
              key={`${season}-${episode}`}
              imdb_id={imdb}
              tmdb_id={series.id}
              type="tv"
              season={season}
              episode={episode}
              title={`${series.name} — S${season}E${episode}`}
              initialSourceIndex={initialSourceIndex}
              onPlayStart={(_i, label) => saveHistory(label)}
              onSourceChange={(_i, label) => saveHistory(label)}
            />
          </div>
        )}
        {playing && !imdb && (
          <p className="text-center text-muted-foreground mb-12">IMDb ID non disponible.</p>
        )}

        <div>
          <h2 className="text-xl md:text-2xl font-display text-accent mb-6">Épisodes</h2>
          {seasonLoading ? (
            <div className="h-40 shimmer-gold rounded-xl max-w-md" />
          ) : seasonData?.episodes && seasonData.episodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {seasonData.episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    setEpisode(ep.episode_number);
                    setPlaying(true);
                    setTimeout(() => {
                      document.getElementById("player-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 100);
                  }}
                  className={`text-left group relative bg-surface-card border rounded-xl overflow-hidden hover:border-accent transition-all duration-300 ${
                    episode === ep.episode_number && playing
                      ? "border-accent shadow-accent scale-[1.02]"
                      : "border-border hover:-translate-y-1"
                  }`}
                >
                  <div className="relative aspect-video bg-surface-primary">
                    {ep.still_path ? (
                      <img
                        src={IMG.backdrop(ep.still_path, "w780") || ""}
                        alt={ep.name}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                        Pas d'image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                      <Play
                        className={`w-12 h-12 transition-transform duration-500 ${
                          episode === ep.episode_number && playing
                            ? "text-accent scale-110 drop-shadow-[0_0_15px_rgba(212,168,67,0.5)]"
                            : "text-white/80 group-hover:scale-110 group-hover:text-white"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-accent transition-colors">
                      <span className="text-accent mr-2">{ep.episode_number}.</span>
                      {ep.name}
                    </h3>
                    {ep.air_date && <p className="text-xs text-muted-foreground mt-1">{ep.air_date}</p>}
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {ep.overview || "Aucune description."}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun épisode trouvé pour cette saison.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Series;
