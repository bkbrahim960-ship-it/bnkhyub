import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { Search, Copy, Users, Play, Tv, Film } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { searchMulti } from "@/services/tmdb";

interface SearchResult {
  id: number;
  title: string;
  year: string;
  poster: string;
  type: "movie" | "tv";
}

const WatchParty = () => {
  const { lang } = useLanguage();
  const [params] = useSearchParams();
  const roomParam = params.get("room");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [roomCode, setRoomCode] = useState(roomParam || "");

  // If room param exists, decode it
  useEffect(() => {
    if (roomParam) {
      try {
        const decoded = atob(roomParam);
        const [type, id] = decoded.split(":");
        if (type && id) {
          setSelected({ id: Number(id), title: "", year: "", poster: "", type: type as "movie" | "tv" });
        }
      } catch {}
    }
  }, [roomParam]);

  const search = async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    const data = await searchMulti(q, "en").catch(() => ({ results: [] }));
    const all: SearchResult[] = (data.results || [])
      .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, 10).map((r: any) => ({
        id: r.id,
        title: r.title || r.name,
        year: ((r.release_date || r.first_air_date) || "").slice(0, 4),
        poster: r.poster_path ? `https://image.tmdb.org/t/p/w185${r.poster_path}` : "",
        type: r.media_type as "movie" | "tv",
      }));
    setResults(all);
  };

  const createRoom = (item: SearchResult) => {
    setSelected(item);
    const code = btoa(`${item.type}:${item.id}`);
    setRoomCode(code);
    const url = `${window.location.origin}/watch-party?room=${code}`;
    navigator.clipboard.writeText(url);
    toast(lang === "ar" ? "تم نسخ رابط الغرفة" : "Lien de la salle copié");
  };

  const contentUrl = selected
    ? selected.type === "movie" ? `/movie/${selected.id}` : `/series/${selected.id}`
    : "";

  return (
    <Layout>
      <SEO title="Watch Party" />
      <div className="container py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {lang === "ar" ? "مشاهدة جماعية" : "Watch Party"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "ar"
                ? "اختر فيلماً أو مسلسلاً وشارك الرابط مع أصدقائك"
                : "Choisissez un film ou une série et partagez le lien"}
            </p>
          </div>

          {!selected ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
                  placeholder={lang === "ar" ? "ابحث عن فيلم أو مسلسل..." : "Rechercher un film ou série..."}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-elevated/50 border border-border outline-none focus:border-accent"
                />
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {results.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => createRoom(item)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/30 border border-border hover:border-accent/50 transition-all text-left"
                    >
                      {item.poster ? (
                        <img src={item.poster} alt="" className="w-10 h-14 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-14 rounded bg-surface-elevated flex items-center justify-center shrink-0">
                          {item.type === "movie" ? <Film className="w-5 h-5 text-muted-foreground" /> : <Tv className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.year} • {item.type === "movie" ? (lang === "ar" ? "فيلم" : "Film") : (lang === "ar" ? "مسلسل" : "Série")}</p>
                      </div>
                      <Copy className="w-4 h-4 text-accent shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-2xl bg-surface-elevated/50 border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  {lang === "ar" ? "الغرفة جاهزة" : "Salle prête"}
                </p>
                <p className="text-2xl font-bold text-accent break-all">{roomCode}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/watch-party?room=${roomCode}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent/10 border border-accent/20 text-accent py-3 rounded-2xl font-bold hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <Copy className="w-5 h-5" />
                  {lang === "ar" ? "نسخ الرابط" : "Copier"}
                </button>
                <Link
                  to={contentUrl}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {lang === "ar" ? "بدء المشاهدة" : "Regarder"}
                </Link>
              </div>

              <button
                onClick={() => { setSelected(null); setRoomCode(""); setResults([]); setQuery(""); }}
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                {lang === "ar" ? "اختيار فيلم آخر" : "Choisir un autre"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WatchParty;
