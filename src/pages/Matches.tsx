import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, Tv, Play, ExternalLink, AlertCircle } from "lucide-react";

const API_BASE = "https://api.sportsrc.org";

interface Sport {
  id: string;
  name: string;
}

interface TeamInfo {
  name: string | null;
  badge: string;
}

interface Match {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
}

interface Source {
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
}

interface MatchDetail {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
  sources: Source[];
}

export default function Matches() {
  const { lang } = useLanguage();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/?data=sports`);
        const json = await res.json();
        const list: Sport[] = json?.data ?? [];
        setSports(list);
        if (list.length > 0) setSelectedSport(list[0].id);
      } catch {
        setError("فشل تحميل الرياضات");
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedSport) return;
    (async () => {
      setLoadingMatches(true);
      setSelectedMatch(null);
      setSelectedSource(null);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/?data=matches&category=${selectedSport}`);
        const json = await res.json();
        const list: Match[] = json?.data ?? [];
        setMatches(list);
      } catch {
        setError("فشل تحميل المباريات");
        setMatches([]);
      }
      setLoadingMatches(false);
    })();
  }, [selectedSport]);

  const openMatch = async (matchId: string) => {
    if (!selectedSport) return;
    setLoadingDetail(true);
    setSelectedMatch(null);
    setSelectedSource(null);
    try {
      const res = await fetch(`${API_BASE}/?data=detail&category=${selectedSport}&id=${matchId}`);
      const json = await res.json();
      const detail: MatchDetail | null = json?.data ?? null;
      setSelectedMatch(detail);
      if (detail && detail.sources && detail.sources.length > 0) {
        setSelectedSource(detail.sources[0]);
      }
    } catch {}
    setLoadingDetail(false);
  };

  const getSportLabel = (s: Sport) => {
    const labels: Record<string, string> = {
      football: lang === "ar" ? "كرة القدم" : lang === "fr" ? "Football" : "Football",
      basketball: lang === "ar" ? "كرة السلة" : lang === "fr" ? "Basketball" : "Basketball",
      tennis: lang === "ar" ? "تنس" : lang === "fr" ? "Tennis" : "Tennis",
      fight: lang === "ar" ? "قتال (UFC)" : lang === "fr" ? "Combat (UFC)" : "Fight (UFC)",
      "american-football": lang === "ar" ? "كرة القدم الأمريكية" : "American Football",
      volleyball: lang === "ar" ? "كرة الطائرة" : lang === "fr" ? "Volleyball" : "Volleyball",
      handball: lang === "ar" ? "كرة اليد" : lang === "fr" ? "Handball" : "Handball",
      cricket: "Cricket",
      rugby: "Rugby",
      hockey: "Hockey",
      baseball: "Baseball",
      golf: "Golf",
      "motor-sports": lang === "ar" ? "رياضات المحركات" : "Motor Sports",
      billiards: lang === "ar" ? "بلياردو" : "Billiards",
      darts: "Darts",
      afl: "AFL",
      other: lang === "ar" ? "أخرى" : lang === "fr" ? "Autres" : "Other",
    };
    return labels[s.id] || s.name || s.id;
  };

  const formatMatchDate = (ts: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday) return timeStr;
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + timeStr;
  };

  const getMatchTitle = (m: Match) => {
    if (m.title) return m.title;
    const home = m.teams?.home?.name || "?";
    const away = m.teams?.away?.name || "?";
    return `${home} vs ${away}`;
  };

  const isLive = (ts: number) => {
    if (!ts) return false;
    const matchTime = new Date(ts).getTime();
    const now = Date.now();
    const matchEnd = matchTime + 2 * 60 * 60 * 1000;
    return now >= matchTime && now <= matchEnd;
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mx-auto" dir={dir}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display font-bold text-gradient-accent mb-2">
          {lang === "ar" ? "مباريات مباشر" : lang === "fr" ? "Matchs en Direct" : "Live Matches"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {lang === "ar" ? "تابع المباريات لحظة بلحظة" : lang === "fr" ? "Suivez les matchs en temps réel" : "Follow matches in real time"}
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )}

      {!loading && sports.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sports.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSport(s.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                s.id === selectedSport
                  ? "bg-accent text-accent-foreground shadow-glow-sm"
                  : "bg-surface-elevated/50 border border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {getSportLabel(s)}
            </button>
          ))}
        </div>
      )}

      {loadingMatches && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      )}

      {!loadingMatches && matches.length === 0 && selectedSport && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {lang === "ar" ? "لا توجد مباريات حالياً" : lang === "fr" ? "Aucun match pour le moment" : "No matches available"}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`flex-1 space-y-2 ${selectedMatch ? "lg:max-w-2xl" : ""}`}>
          {!loadingMatches && matches.slice(0, 50).map((m, i) => (
            <button
              key={m.id || i}
              onClick={() => openMatch(m.id)}
              className="w-full text-right flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/30 border border-border hover:border-accent/50 transition-all group"
            >
              {m.poster && (
                <img
                  src={m.poster}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              )}
              <div className="flex-1 min-w-0 text-right">
                <div className="text-sm font-bold truncate">{getMatchTitle(m)}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 justify-end">
                  {m.date && <span>{formatMatchDate(m.date)}</span>}
                  {isLive(m.date) && <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-bold">LIVE</span>}
                </div>
              </div>
              <Play className="w-4 h-4 text-muted-foreground group-hover:text-accent shrink-0" />
            </button>
          ))}
        </div>

        {selectedMatch && (
          <div className="lg:w-96 space-y-3">
            <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-card-luxe">
              <div className="flex items-center gap-2 mb-3">
                <Tv className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold">
                  {lang === "ar" ? "روابط البث" : lang === "fr" ? "Liens de diffusion" : "Stream Links"}
                </span>
              </div>

              {loadingDetail && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                </div>
              )}

              {!loadingDetail && selectedMatch.sources && selectedMatch.sources.length > 0 && (
                <div className="space-y-1.5">
                  {selectedMatch.sources.slice(0, 10).map((src) => (
                    <button
                      key={src.streamNo}
                      onClick={() => setSelectedSource(src)}
                      className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all border ${
                        selectedSource?.streamNo === src.streamNo
                          ? "bg-accent/20 border-accent text-foreground"
                          : "bg-surface-elevated/30 border-border text-muted-foreground hover:border-accent/50"
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground shrink-0 mr-2">#{src.streamNo}</span>
                      <span className="truncate flex-1">{src.language || "Stream"}</span>
                      {src.hd && <span className="text-[10px] text-accent font-bold ml-2">HD</span>}
                    </button>
                  ))}
                </div>
              )}

              {!loadingDetail && selectedSource && (
                <div className="mt-3">
                  <div className="rounded-xl overflow-hidden bg-black aspect-video mb-2">
                    <iframe
                      src={selectedSource.embedUrl}
                      className="w-full h-full border-0"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin"
                      title="Stream"
                    />
                  </div>
                </div>
              )}

              {!loadingDetail && (!selectedMatch.sources || selectedMatch.sources.length === 0) && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  {lang === "ar" ? "لا توجد روابط بث متاحة" : lang === "fr" ? "Aucun lien disponible" : "No streams available"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
