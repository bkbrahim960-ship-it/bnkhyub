import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, RefreshCw, Trophy, MapPin, Clock } from "lucide-react";
import { fetchGames, fetchGroups, fetchStadiums, Game, Group, Stadium, getTeamFlag } from "@/services/worldcup";
import { MatchDetails } from "@/components/match/MatchDetails";

const STAGE_LABELS: Record<string, { en: string; ar: string }> = {
  group: { en: "Group Stage", ar: "دور المجموعات" },
  round_32: { en: "Round of 32", ar: "دور الـ32" },
  round_16: { en: "Round of 16", ar: "دور الـ16" },
  quarter: { en: "Quarter-finals", ar: "ربع النهائي" },
  semi: { en: "Semi-finals", ar: "نصف النهائي" },
  third: { en: "Third Place", ar: "المركز الثالث" },
  final: { en: "Final", ar: "النهائي" },
};

const Matches = () => {
  const { lang } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [gamesData, groupsData, stadiumsData] = await Promise.all([
        fetchGames(), fetchGroups(), fetchStadiums(),
      ]);
      setGames(gamesData);
      setGroups(groupsData);
      setStadiums(stadiumsData);
    } catch (err: any) {
      setError(err.message || "Failed to load matches");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stadiumMap = new Map(stadiums.map((s) => [s.id, s]));

  const getStadiumName = (id: string) => {
    const s = stadiumMap.get(id);
    return s ? s.name_en : `${lang === "ar" ? "الملعب" : "Stadium"} ${id}`;
  };

  const groupNames = groups.map((g) => g.name);
  const filteredGames = activeFilter === "all"
    ? games
    : activeFilter.length === 1
      ? games.filter((g) => g.group === activeFilter)
      : games.filter((g) => g.type === activeFilter);

  const groupedByDate = filteredGames.reduce(
    (acc, g) => {
      const date = g.local_date?.split(" ")[0] || "unknown";
      if (!acc[date]) acc[date] = [];
      acc[date].push(g);
      return acc;
    },
    {} as Record<string, Game[]>,
  );

  const sortedDates = Object.keys(groupedByDate).sort();

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
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-surface-card border border-border hover:border-accent-subtle transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {lang === "ar" ? "تحديث" : "Refresh"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-card border border-border hover:border-accent-subtle"
              }`}
            >
              {lang === "ar" ? "الكل" : "All"}
            </button>
            {groupNames.map((g) => (
              <button
                key={g}
                onClick={() => setActiveFilter(g)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeFilter === g
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface-card border border-border hover:border-accent-subtle"
                }`}
              >
                {lang === "ar" ? `المجموعة ${g}` : `Group ${g}`}
              </button>
            ))}
            {Object.keys(STAGE_LABELS).filter((k) => k !== "group").map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveFilter(stage)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeFilter === stage
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface-card border border-border hover:border-accent-subtle"
                }`}
              >
                {lang === "ar" ? STAGE_LABELS[stage].ar : STAGE_LABELS[stage].en}
              </button>
            ))}
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
                onClick={() => loadData()}
                className="px-6 py-2 rounded-full bg-accent text-accent-foreground font-bold text-sm"
              >
                {lang === "ar" ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="bg-surface-card border border-border rounded-2xl p-12 text-center flex flex-col items-center gap-4">
              <Trophy className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">
                {lang === "ar" ? "لا توجد مباريات" : "No matches found"}
              </p>
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
                    {groupedByDate[date].map((game) => {
                      const stageKey = game.type || "group";
                      return (
                        <button
                          key={game.id}
                          onClick={() => setSelectedGame(game)}
                          className="group relative bg-surface-card border border-border rounded-2xl p-5 hover:border-accent-subtle transition-all duration-300 hover:-translate-y-1 text-right"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-14 h-14 flex items-center justify-center">
                                <img
                                  src={getTeamFlag(game, game.home_team_id)}
                                  alt={game.home_team_name_en || ""}
                                  className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <span className="text-sm font-bold text-center leading-tight line-clamp-2">
                                {game.home_team_name_en}
                              </span>
                            </div>

                            <div className="flex flex-col items-center gap-1 min-w-[80px]">
                              {game.finished === "TRUE" ? (
                                <span className="text-2xl md:text-3xl font-black font-mono tracking-wider">
                                  {game.home_score} - {game.away_score}
                                </span>
                              ) : game.local_date ? (
                                <>
                                  <span className="text-lg md:text-xl font-bold font-mono">
                                    {game.local_date?.split(" ")[1]?.slice(0, 5) || game.local_date?.split(" ")[1] || ""}
                                  </span>
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                </>
                              ) : (
                                <span className="text-lg font-bold">VS</span>
                              )}
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                                {game.group || (STAGE_LABELS[stageKey]?.en || stageKey)}
                              </span>
                            </div>

                            <div className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-14 h-14 flex items-center justify-center">
                                <img
                                  src={getTeamFlag(game, game.away_team_id)}
                                  alt={game.away_team_name_en || ""}
                                  className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <span className="text-sm font-bold text-center leading-tight line-clamp-2">
                                {game.away_team_name_en}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-border pt-3 mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="line-clamp-1">{getStadiumName(game.stadium_id)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedGame && (
        <MatchDetails
          game={selectedGame}
          stadiumMap={stadiumMap}
          lang={lang}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </Layout>
  );
};

export default Matches;
