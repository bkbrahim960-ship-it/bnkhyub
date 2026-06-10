import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, RefreshCw, Trophy, MapPin, Clock, Calendar } from "lucide-react";
import { fetchScriptFootMatches, ScriptFootMatch, matchDate, matchTime } from "@/services/scriptfoot";

const Matches = () => {
  const { t, lang } = useLanguage();
  const [allMatches, setAllMatches] = useState<ScriptFootMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<ScriptFootMatch | null>(null);

  const loadMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await fetchScriptFootMatches();
      setAllMatches(data);
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

  const isWorldCup = (m: ScriptFootMatch) => {
    const kw = ["كأس العالم", "world cup", "wc2026", "kأس", "المجموعة"];
    const text = `${m.title} ${m.league || ""} ${m.home_team || ""} ${m.away_team || ""}`.toLowerCase();
    return kw.some(k => text.includes(k.toLowerCase()));
  };

  const worldCupMatches = allMatches.filter(isWorldCup);

  const groupedByDate = worldCupMatches.reduce(
    (acc, m) => {
      const date = matchDate(m) || "unknown";
      if (!acc[date]) acc[date] = [];
      acc[date].push(m);
      return acc;
    },
    {} as Record<string, ScriptFootMatch[]>,
  );

  const sortedDates = Object.keys(groupedByDate).sort();

  const getStatusBadge = (match: ScriptFootMatch) => {
    if (match.status === "live") {
      return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">مباشر</span>;
    }
    if (match.status === "ended" || match.status === "finished") {
      return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-600 text-white">انتهت</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">لم تبدأ</span>;
  };

  return (
    <Layout>
      <section className="pt-28 pb-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-accent flex items-center gap-4">
                <Trophy className="w-10 h-10 md:w-12 md:h-12 text-accent" />
                {lang === "ar" ? "كأس العالم 2026" : "World Cup 2026"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {lang === "ar" ? "المكسيك - الولايات المتحدة - كندا" : "Mexico - USA - Canada"}
              </p>
            </div>
            <button
              onClick={() => loadMatches(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-surface-card border border-border hover:border-accent-subtle transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {lang === "ar" ? "تحديث" : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-muted-foreground animate-pulse">
                {lang === "ar" ? "جاري تحميل المباريات..." : "Loading matches..."}
              </p>
            </div>
          ) : error ? (
            <div className="bg-surface-card border border-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <Trophy className="w-12 h-12 text-muted-foreground/30" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">
                  {lang === "ar" ? "فشل تحميل المباريات" : "Failed to load matches"}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">{error}</p>
              </div>
              <button
                onClick={() => loadMatches()}
                className="px-6 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm"
              >
                {lang === "ar" ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          ) : worldCupMatches.length === 0 ? (
            <div className="bg-surface-card border border-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <Trophy className="w-12 h-12 text-muted-foreground/30" />
              <div>
                <p className="text-lg font-medium text-muted-foreground">
                  {lang === "ar" ? "لا توجد مباريات" : "No matches found"}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {lang === "ar"
                    ? "المباريات ستظهر هنا عند توفرها في المصدر"
                    : "Matches will appear here when available"}
                </p>
              </div>
              <button
                onClick={() => loadMatches()}
                className="px-6 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm"
              >
                {lang === "ar" ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {sortedDates.map((date) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest bg-surface-card px-4 py-1.5 rounded-full border border-border">
                      {date}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {groupedByDate[date].map((match) => (
                      <button
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className="group relative bg-surface-card border border-border rounded-2xl p-5 hover:border-accent-subtle transition-all duration-300 hover:-translate-y-1 text-right"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-14 h-14 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-accent" />
                              </div>
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
                              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-accent" />
                              </div>
                            </div>
                            <span className="text-sm font-bold text-center leading-tight line-clamp-2">
                              {match.away_team || ""}
                            </span>
                          </div>
                        </div>

                        {match.league && (
                          <div className="border-t border-border pt-3 mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="line-clamp-1">{match.league}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedMatch && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="bg-surface-card border border-border rounded-3xl max-w-lg w-full overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-8 pb-6">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/10 text-accent uppercase tracking-wider">
                  كأس العالم 2026
                </span>
              </div>

              <div className="flex items-center justify-center gap-6 md:gap-10 mb-6">
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm md:text-base font-bold text-center leading-tight">
                    {selectedMatch.home_team || selectedMatch.title}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  {selectedMatch.score ? (
                    <span className="text-4xl md:text-5xl font-black font-mono tracking-wider text-accent">
                      {selectedMatch.score}
                    </span>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl md:text-3xl font-bold font-mono">
                        {matchTime(selectedMatch) || "VS"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedMatch.status === "live" ? "مباشر" :
                         selectedMatch.status === "ended" || selectedMatch.status === "finished" ? "انتهت" : "لم تبدأ"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm md:text-base font-bold text-center leading-tight">
                    {selectedMatch.away_team || ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border px-8 py-5 space-y-3">
              {selectedMatch.league && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>{selectedMatch.league}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{selectedMatch.match_date} {matchTime(selectedMatch)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Matches;
