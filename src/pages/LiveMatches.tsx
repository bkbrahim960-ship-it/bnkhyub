import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, RefreshCw, Clock, Tv, Mic, Trophy, Play, AlertCircle } from "lucide-react";
import { fetchMatches, KoraliveMatch, matchDate, matchTime, isMatchLive } from "@/services/koralive";
import { MatchPlayer } from "@/components/player/MatchPlayer";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  live: { label: "مباشر", className: "bg-red-600 text-white animate-pulse" },
  halftime: { label: "استراحة", className: "bg-amber-600 text-white" },
  ended: { label: "انتهت", className: "bg-gray-600 text-white" },
  not_started: { label: "لم تبدأ", className: "bg-blue-600 text-white" },
  starting_soon: { label: "تبدأ قريباً", className: "bg-emerald-600 text-white" },
  soon: { label: "لم تبدأ بعد", className: "bg-blue-600/60 text-white" },
  et: { label: "وقت إضافي", className: "bg-red-700 text-white" },
};

const LiveMatches = () => {
  const { t } = useLanguage();
  const [matches, setMatches] = useState<KoraliveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<KoraliveMatch | null>(null);

  const loadMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await fetchMatches();
      setMatches(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل المباريات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const getStatusBadge = (match: KoraliveMatch) => {
    const key = match.status.initial || match.status.class || "";
    const config = STATUS_MAP[key];
    if (!config) {
      if (match.status.text) {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-white">
            {match.status.text}
          </span>
        );
      }
      return null;
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const grouped = matches.reduce(
    (acc, m) => {
      const date = matchDate(m) || "unknown";
      if (!acc[date]) acc[date] = [];
      acc[date].push(m);
      return acc;
    },
    {} as Record<string, KoraliveMatch[]>,
  );

  const sortedDates = Object.keys(grouped).sort();

  return (
    <Layout>
      <section className="pt-28 pb-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-accent flex items-center gap-4">
                <Trophy className="w-10 h-10 md:w-12 md:h-12 text-accent" />
                {t === "ar" ? "مباريات اليوم" : "Matchs du Jour"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t === "ar"
                  ? "شاهد جميع المباريات بث مباشر بدون إعلانات"
                  : "Regardez tous les matchs en direct sans publicité"}
              </p>
            </div>
            <button
              onClick={() => loadMatches(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-surface-card border border-border hover:border-accent-subtle transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {t === "ar" ? "تحديث" : "Actualiser"}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-muted-foreground animate-pulse">
                {t === "ar" ? "جاري تحميل المباريات..." : "Chargement des matchs..."}
              </p>
            </div>
          ) : error ? (
            <div className="bg-surface-card border border-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-destructive/50" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">
                  {t === "ar" ? "فشل تحميل المباريات" : "Échec du chargement"}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">{error}</p>
              </div>
              <button
                onClick={() => loadMatches()}
                className="px-6 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm"
              >
                {t === "ar" ? "إعادة المحاولة" : "Réessayer"}
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-surface-card border border-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <Trophy className="w-12 h-12 text-muted-foreground/30" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">
                  {t === "ar" ? "لا توجد مباريات اليوم" : "Aucun match aujourd'hui"}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {t === "ar"
                    ? "المباريات ستظهر هنا عند توفرها"
                    : "Les matchs apparaîtront ici lorsqu'ils seront disponibles"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {sortedDates.map((date) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest bg-surface-card px-4 py-1.5 rounded-full border border-border">
                      {date === "unknown" ? (t === "ar" ? "غير محدد" : "Inconnu") : date}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {grouped[date].map((match) => (
                      <div
                        key={match.id || `${match.homeTeam}-${match.awayTeam}`}
                        className="group relative bg-surface-card border border-border rounded-2xl p-5 hover:border-accent-subtle transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-14 h-14 flex items-center justify-center">
                              {match.homeLogo ? (
                                <img
                                  src={match.homeLogo}
                                  alt={match.homeTeam || ""}
                                  className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                  <Trophy className="w-5 h-5 text-accent" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-bold text-center leading-tight line-clamp-2">
                              {match.homeTeam}
                            </span>
                          </div>

                          <div className="flex flex-col items-center gap-1 min-w-[80px]">
                            {match.score ? (
                              <span className="text-2xl md:text-3xl font-black font-mono tracking-wider">
                                {match.score}
                              </span>
                            ) : match.kickoff ? (
                              <>
                                <span className="text-lg md:text-xl font-bold font-mono">
                                  {matchTime(match)}
                                </span>
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              </>
                            ) : (
                              <span className="text-lg font-bold">VS</span>
                            )}
                            {getStatusBadge(match)}
                          </div>

                          <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-14 h-14 flex items-center justify-center">
                              {match.awayLogo ? (
                                <img
                                  src={match.awayLogo}
                                  alt={match.awayTeam || ""}
                                  className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                  <Trophy className="w-5 h-5 text-accent" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-bold text-center leading-tight line-clamp-2">
                              {match.awayTeam}
                            </span>
                          </div>
                        </div>

                        {(match.channel || match.league || match.commentator || match.venue) && (
                          <div className="border-t border-border pt-3 mt-2 space-y-1.5">
                            {match.league && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="line-clamp-1">{match.league}</span>
                              </div>
                            )}
                            {match.channel && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Tv className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="line-clamp-1">{match.channel}</span>
                              </div>
                            )}
                            {match.commentator && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mic className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="line-clamp-1">{match.commentator}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => setPlaying(match)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-accent text-accent-foreground hover:opacity-90 transition-all shadow-accent"
                          >
                            <Play className="w-4 h-4" />
                            {t === "ar" ? "مشاهدة" : "Regarder"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {playing && playing.detailUrl && (
        <MatchPlayer
          homeTeam={playing.homeTeam || ""}
          awayTeam={playing.awayTeam || ""}
          homeLogo={playing.homeLogo}
          awayLogo={playing.awayLogo}
          detailUrl={playing.detailUrl}
          onClose={() => setPlaying(null)}
        />
      )}
    </Layout>
  );
};

export default LiveMatches;
