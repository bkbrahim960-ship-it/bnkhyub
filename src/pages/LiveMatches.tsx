import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, RefreshCw, Clock, Tv, Trophy, Play, AlertCircle, Ban, Hourglass } from "lucide-react";
import { fetchScriptFootMatches, ScriptFootMatch, matchDate, matchTime, isLive, isEnded, isUpcoming } from "@/services/scriptfoot";
import { MatchPlayer } from "@/components/player/MatchPlayer";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  live: { label: "مباشر", className: "bg-red-600 text-white animate-pulse" },
  scheduled: { label: "مجدولة", className: "bg-blue-600 text-white" },
  not_started: { label: "لم تبدأ", className: "bg-blue-600 text-white" },
  starting_soon: { label: "تبدأ قريباً", className: "bg-emerald-600 text-white" },
  ended: { label: "انتهت", className: "bg-gray-600 text-white" },
  finished: { label: "انتهت", className: "bg-gray-600 text-white" },
};

const LiveMatches = () => {
  const { t } = useLanguage();
  const [matches, setMatches] = useState<ScriptFootMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<ScriptFootMatch | null>(null);
  const [message, setMessage] = useState<{ title: string; text: string; icon: string } | null>(null);

  const handlePlayClick = (match: ScriptFootMatch) => {
    if (isEnded(match.status)) {
      setMessage({
        title: "انتهت المباراة",
        text: `المباراة قد انتهت${match.score ? ` بنتيجة ${match.score}` : ""}.`,
        icon: "ended",
      });
    } else if (isUpcoming(match.status)) {
      setMessage({
        title: "المباراة لم تبدأ بعد",
        text: `المباراة ستبدأ في الساعة ${matchTime(match)}${matchDate(match) ? ` بتاريخ ${matchDate(match)}` : ""}.`,
        icon: "upcoming",
      });
    } else if (match.streams.length === 0) {
      setMessage({
        title: "لا توجد روابط بث",
        text: "روابط البث غير متاحة حالياً، حاول مرة أخرى لاحقاً.",
        icon: "upcoming",
      });
    } else {
      setPlaying(match);
    }
  };

  const loadMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await fetchScriptFootMatches();
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

  const getStatusBadge = (match: ScriptFootMatch) => {
    const config = STATUS_MAP[match.status];
    if (config) {
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.className}`}>
          {config.label}
        </span>
      );
    }
    return null;
  };

  const grouped = matches.reduce(
    (acc, m) => {
      const date = matchDate(m) || "unknown";
      if (!acc[date]) acc[date] = [];
      acc[date].push(m);
      return acc;
    },
    {} as Record<string, ScriptFootMatch[]>,
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
                        key={match.id}
                        className="group relative bg-surface-card border border-border rounded-2xl p-5 hover:border-accent-subtle transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-14 h-14 flex items-center justify-center">
                              {match.thumbnail ? (
                                <img
                                  src={match.thumbnail}
                                  alt={match.home_team || ""}
                                  className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                  <Trophy className="w-5 h-5 text-accent" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-bold text-center leading-tight line-clamp-2">
                              {match.home_team || match.title}
                            </span>
                          </div>

                          <div className="flex flex-col items-center gap-1 min-w-[80px]">
                            {match.score ? (
                              <span className="text-2xl md:text-3xl font-black font-mono tracking-wider">
                                {match.score}
                              </span>
                            ) : match.match_time ? (
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
                              {match.thumbnail ? (
                                <img
                                  src={match.thumbnail}
                                  alt={match.away_team || ""}
                                  className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                  <Trophy className="w-5 h-5 text-accent" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-bold text-center leading-tight line-clamp-2">
                              {match.away_team || ""}
                            </span>
                          </div>
                        </div>

                        {(match.channels.length > 0 || match.league) && (
                          <div className="border-t border-border pt-3 mt-2 space-y-1.5">
                            {match.league && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="line-clamp-1">{match.league}</span>
                              </div>
                            )}
                            {match.channels.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Tv className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="line-clamp-1">{match.channels.join(" • ")}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => handlePlayClick(match)}
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

      {message && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setMessage(null)}>
          <div className="bg-surface-card border border-border rounded-2xl p-8 max-w-md w-full text-center flex flex-col items-center gap-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {message.icon === "ended" ? (
              <Ban className="w-16 h-16 text-destructive" />
            ) : (
              <Hourglass className="w-16 h-16 text-amber-500" />
            )}
            <h2 className="text-xl font-bold">{message.title}</h2>
            <p className="text-muted-foreground">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="px-8 py-2.5 rounded-full bg-accent text-accent-foreground font-bold text-sm mt-2"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {playing && (
        <MatchPlayer
          homeTeam={playing.home_team || playing.title}
          awayTeam={playing.away_team || ""}
          homeLogo={null}
          awayLogo={null}
          streams={playing.streams}
          onClose={() => setPlaying(null)}
        />
      )}
    </Layout>
  );
};

export default LiveMatches;
