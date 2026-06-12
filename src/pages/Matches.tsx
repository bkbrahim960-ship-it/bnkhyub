import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, Tv, Play, ExternalLink, AlertCircle } from "lucide-react";

const API_BASE = "https://api.sportsrc.org";

interface Sport {
  key: string;
  name: string;
}

interface Match {
  id: string;
  title?: string;
  home_team?: string;
  away_team?: string;
  date?: string;
  time?: string;
  league?: string;
  status?: string;
}

interface MatchDetail {
  id: string;
  title?: string;
  embed?: string;
  url?: string;
  home_team?: string;
  away_team?: string;
  league?: string;
  status?: string;
}

export default function Matches() {
  const { lang } = useLanguage();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);
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
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.sports || data.categories || [];
        setSports(list);
        if (list.length > 0) setSelectedSport(list[0].key);
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
      setError("");
      try {
        const res = await fetch(`${API_BASE}/?data=matches&category=${selectedSport}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.matches || data.games || [];
        setMatches(list);
      } catch {
        setError("فشل تحميل المباريات");
        setMatches([]);
      }
      setLoadingMatches(false);
    })();
  }, [selectedSport]);

  const openMatch = async (matchId: string) => {
    setLoadingDetail(true);
    setSelectedMatch(null);
    try {
      const res = await fetch(`${API_BASE}/?data=detail&category=${selectedSport}&id=${matchId}`);
      const data = await res.json();
      setSelectedMatch(data.detail || data);
    } catch {}
    setLoadingDetail(false);
  };

  const getSportLabel = (s: Sport) => {
    const labels: Record<string, string> = {
      football: lang === "ar" ? "كرة القدم" : lang === "fr" ? "Football" : "Football",
      basketball: lang === "ar" ? "كرة السلة" : lang === "fr" ? "Basketball" : "Basketball",
      tennis: lang === "ar" ? "تنس" : lang === "fr" ? "Tennis" : "Tennis",
      ufc: "UFC",
      boxing: lang === "ar" ? "ملاكمة" : lang === "fr" ? "Boxe" : "Boxing",
      volleyball: lang === "ar" ? "كرة الطائرة" : lang === "fr" ? "Volleyball" : "Volleyball",
      handball: lang === "ar" ? "كرة اليد" : lang === "fr" ? "Handball" : "Handball",
      cricket: "Cricket",
      rugby: "Rugby",
      hockey: "Hockey",
      baseball: "Baseball",
      "american football": lang === "ar" ? "كرة القدم الأمريكية" : "American Football",
    };
    return labels[s.key] || s.name || s.key;
  };

  const formatMatchDate = (m: Match) => {
    return m.date || m.time || "";
  };

  const getMatchTitle = (m: Match) => {
    return m.title || `${m.home_team || "?"} vs ${m.away_team || "?"}`;
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-6xl mxauto" dir={dir}>
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
              key={s.key}
              onClick={() => setSelectedSport(s.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                s.key === selectedSport
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedMatch ? "lg:col-span-2" : "lg:col-span-3"} space-y-3`}>
          {!loadingMatches && matches.slice(0, 30).map((m, i) => (
            <button
              key={m.id || i}
              onClick={() => openMatch(m.id)}
              className="w-full text-right flex items-center justify-between p-4 rounded-xl bg-surface-elevated/30 border border-border hover:border-accent/50 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{getMatchTitle(m)}</div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                  {formatMatchDate(m) && <span>{formatMatchDate(m)}</span>}
                  {m.league && <span className="text-accent">{m.league}</span>}
                  {m.status && <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400">LIVE</span>}
                </div>
              </div>
              <Play className="w-4 h-4 text-muted-foreground group-hover:text-accent shrink-0 ml-3" />
            </button>
          ))}
        </div>

        {selectedMatch && (
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-card-luxe">
              <div className="flex items-center gap-2 mb-3">
                <Tv className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold">
                  {lang === "ar" ? "البث المباشر" : lang === "fr" ? "Direct" : "Live Stream"}
                </span>
              </div>

              {loadingDetail && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                </div>
              )}

              {!loadingDetail && selectedMatch.embed && (
                <div className="rounded-xl overflow-hidden bg-black aspect-video mb-3">
                  <iframe
                    src={selectedMatch.embed}
                    className="w-full h-full border-0"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin"
                    title={selectedMatch.title || "Match"}
                  />
                </div>
              )}

              {!loadingDetail && selectedMatch.url && (
                <a
                  href={selectedMatch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {lang === "ar" ? "فتح البث" : lang === "fr" ? "Ovoir le stream" : "Open Stream"}
                </a>
              )}

              <div className="text-xs text-muted-foreground mt-2">
                {selectedMatch.title || `${selectedMatch.home_team || ""} vs ${selectedMatch.away_team || ""}`}
                {selectedMatch.league && <span className="block text-accent text-[11px] mt-0.5">{selectedMatch.league}</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
