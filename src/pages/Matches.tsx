import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Loader2, Play, AlertCircle, ArrowLeft } from "lucide-react";

const API_BASE = "https://api.sportsrc.org";

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

export default function Matches() {
  const { lang } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/?data=matches&category=football`);
        const json = await res.json();
        setMatches(json?.data ?? []);
      } catch {
        setError("فشل تحميل المباريات");
      }
      setLoading(false);
    })();
  }, []);

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
    const now = Date.now();
    return now >= new Date(ts).getTime() && now <= new Date(ts).getTime() + 7200000;
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <Layout>
      <SEO title={lang === "ar" ? "مباريات كرة قدم مباشرة" : lang === "fr" ? "Matchs de Football en Direct" : "Live Football Matches"} />
      <div className="min-h-screen pt-20 pb-28 px-4 max-w-4xl mx-auto" dir={dir}>
        <div className="mb-2">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === "ar" ? "الرئيسية" : lang === "fr" ? "Accueil" : "Home"}
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-gradient-accent">
            {lang === "ar" ? "مباريات كرة القدم المباشرة" : lang === "fr" ? "Matchs de Football en Direct" : "Live Football Matches"}
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            {lang === "ar" ? "اختر مباراة لمشاهدة البث المباشر" : lang === "fr" ? "Choisissez un match pour voir le direct" : "Select a match to watch live"}
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

        {!loading && matches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {lang === "ar" ? "لا توجد مباريات حالياً" : lang === "fr" ? "Aucun match pour le moment" : "No matches available"}
          </div>
        )}

        <div className="space-y-2">
          {!loading && matches.slice(0, 50).map((m, i) => (
            <Link
              key={m.id || i}
              to={`/matches/${m.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/30 border border-border hover:border-accent/50 hover:bg-surface-elevated/50 transition-all group"
            >
              {m.poster && (
                <img
                  src={m.poster}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              )}
              <div className={`flex-1 min-w-0 ${dir === "rtl" ? "text-right" : "text-left"}`}>
                <div className="text-sm font-bold truncate">{getMatchTitle(m)}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                  {m.date && <span>{formatMatchDate(m.date)}</span>}
                  {isLive(m.date) && <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-bold">LIVE</span>}
                </div>
              </div>
              <Play className="w-4 h-4 text-muted-foreground group-hover:text-accent shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
