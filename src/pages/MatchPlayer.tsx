import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { SEO } from "@/components/SEO";
import { Loader2, Tv, ArrowLeft, AlertCircle } from "lucide-react";

const API_BASE = "https://api.sportsrc.org";

interface Source {
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
}

interface TeamInfo {
  name: string | null;
  badge: string;
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

export default function MatchPlayer() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/?data=detail&category=football&id=${id}`);
        const json = await res.json();
        const d: MatchDetail | null = json?.data ?? null;
        setDetail(d);
        if (d && d.sources && d.sources.length > 0) {
          setSelectedSource(d.sources[0]);
        }
      } catch {
        setError("فشل تحميل بيانات المباراة");
      }
      setLoading(false);
    })();
  }, [id]);

  const formatDate = (ts: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `اليوم ${timeStr}`;
    return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + timeStr;
  };

  const isLive = (ts: number) => {
    if (!ts) return false;
    const now = Date.now();
    return now >= new Date(ts).getTime() && now <= new Date(ts).getTime() + 7200000;
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  if (loading || !detail) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4" dir={dir}>
          {loading ? (
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          ) : (
            <>
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">{error || "لم يتم العثور على المباراة"}</p>
              <Link to="/matches" className="text-accent text-sm hover:underline">
                <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                {lang === "ar" ? "العودة للمباريات" : lang === "fr" ? "Retour aux matchs" : "Back to matches"}
              </Link>
            </>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title={detail.title || "مباراة"} />
      <div className="min-h-screen pt-20 pb-28 px-4 max-w-6xl mx-auto" dir={dir}>
        <div className="mb-4">
          <Link to="/matches" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === "ar" ? "المباريات" : lang === "fr" ? "Matchs" : "Matches"}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-card-luxe">
              <div className="flex items-center gap-4 mb-4">
                {detail.teams?.home?.badge && (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <img src={detail.teams.home.badge} alt="" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    <span className="text-xs sm:text-sm font-bold text-center">{detail.teams.home.name || "?"}</span>
                  </div>
                )}
                <div className="text-center">
                  {detail.teams?.home?.name && detail.teams?.away?.name ? (
                    <span className="text-lg sm:text-2xl font-black text-foreground">VS</span>
                  ) : null}
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {detail.date && formatDate(detail.date)}
                  </div>
                  {isLive(detail.date) && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 font-bold animate-pulse">LIVE</span>
                  )}
                </div>
                {detail.teams?.away?.badge && (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <img src={detail.teams.away.badge} alt="" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                    <span className="text-xs sm:text-sm font-bold text-center">{detail.teams.away.name || "?"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-card-luxe">
              <div className="flex items-center gap-2 mb-3">
                <Tv className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold">
                  {lang === "ar" ? "روابط البث" : lang === "fr" ? "Liens de diffusion" : "Stream Links"}
                </span>
              </div>

              {detail.sources && detail.sources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {detail.sources.slice(0, 10).map((src) => (
                    <button
                      key={src.streamNo}
                      onClick={() => setSelectedSource(src)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-all border ${
                        selectedSource?.streamNo === src.streamNo
                          ? "bg-accent/20 border-accent text-foreground"
                          : "bg-surface-elevated/30 border-border text-muted-foreground hover:border-accent/50"
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground shrink-0">#{src.streamNo}</span>
                      <span className="truncate flex-1">{src.language || "Stream"}</span>
                      {src.hd && <span className="text-[10px] text-accent font-bold shrink-0">HD</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  {lang === "ar" ? "لا توجد روابط بث متاحة" : lang === "fr" ? "Aucun lien disponible" : "No streams available"}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-surface-card border border-border rounded-2xl p-4 shadow-card-luxe">
              <div className="flex items-center gap-2 mb-3">
                <Tv className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold">
                  {lang === "ar" ? "المشغل" : lang === "fr" ? "Lecteur" : "Player"}
                </span>
              </div>

              {selectedSource ? (
                <div className="rounded-xl overflow-hidden bg-black aspect-video">
                  <iframe
                    src={selectedSource.embedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title="Stream"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  {lang === "ar" ? "اختر رابط بث من القائمة" : lang === "fr" ? "Choisissez un lien dans la liste" : "Select a stream from the list"}
                </div>
              )}

              {selectedSource && (
                <div className="mt-2 text-[10px] text-muted-foreground">
                  {selectedSource.language && <span>{selectedSource.language}{selectedSource.hd ? " • HD" : ""}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
