import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { MUSIC_TRACKS } from "@/services/musicData";
import { useMusic } from "@/context/MusicContext";
import { useLanguage } from "@/context/LanguageContext";
import { Play, Pause, Music, Search, ChevronDown } from "lucide-react";

const CATEGORIES = ["All", "Kabyle", "Arabic", "Rai", "Chaabi", "World"];

const MusicPage = () => {
  const { t, lang } = useLanguage();
  const { currentTrack, isPlaying, play, togglePlay, setQueue } = useMusic();
  const [activeCat, setActiveCat] = useState("All");
  const [searchQ, setSearchQ] = useState("");

  const tracks = useMemo(() => {
    let list = MUSIC_TRACKS;
    if (activeCat !== "All") list = list.filter(t => t.category === activeCat);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
    }
    return list;
  }, [activeCat, searchQ]);

  const handlePlay = (track: typeof tracks[0]) => {
    setQueue(tracks);
    play(track);
  };

  const isRtl = lang === "ar";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Music className="w-7 h-7 text-accent" />
              {lang === "ar" ? "الموسيقى" : lang === "fr" ? "Musique" : "Music"}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {lang === "ar" ? "استمع إلى أفضل الأغاني" : lang === "fr" ? "Écoutez les meilleures chansons" : "Listen to the best songs"}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className={`absolute ${isRtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-white/30`} />
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder={lang === "ar" ? "بحث عن أغنية..." : lang === "fr" ? "Rechercher une chanson..." : "Search song..."}
              className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition ${isRtl ? "pr-10" : "pl-10"}`}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCat === cat
                  ? "bg-accent text-white"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat === "All" ? (lang === "ar" ? "الكل" : lang === "fr" ? "Tout" : "All") : cat}
            </button>
          ))}
        </div>

        <div className="mb-4 p-3 rounded-xl bg-accent/5 border border-accent/10 text-xs text-white/50 flex items-center gap-2">
          <Music className="w-3.5 h-3.5 shrink-0 text-accent/60" />
          {lang === "ar"
            ? "للتشغيل في الخلفية (عند إطفاء الهاتف)، استخدم ملفات MP3 مباشرة بدلاً من YouTube"
            : lang === "fr"
              ? "Pour une lecture en arrière-plan (écran eteint), utilisez des fichiers MP3 directs au lieu de YouTube"
              : "For background playback (when screen is off), use direct MP3 files instead of YouTube"}
        </div>

        <div className="grid gap-3 pb-32">
          {tracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`group flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer ${
                  isCurrent ? "bg-accent/10 border border-accent/20" : "bg-white/5 hover:bg-white/[0.07] border border-transparent"
                }`}
                onClick={() => handlePlay(track)}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/10">
                  <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isCurrent && isPlaying ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}>
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center">
                      <Play className="w-5 h-5 text-white pl-0.5" />
                    </div>
                  </div>
                  {isCurrent && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="flex gap-[3px] items-end h-5">
                        <span className="w-[3px] bg-accent rounded-full animate-[musicBar_0.8s_ease-in-out_infinite_0s]" style={{ height: "40%" }} />
                        <span className="w-[3px] bg-accent rounded-full animate-[musicBar_0.8s_ease-in-out_infinite_0.2s]" style={{ height: "70%" }} />
                        <span className="w-[3px] bg-accent rounded-full animate-[musicBar_0.8s_ease-in-out_infinite_0.4s]" style={{ height: "50%" }} />
                        <span className="w-[3px] bg-accent rounded-full animate-[musicBar_0.8s_ease-in-out_infinite_0.1s]" style={{ height: "90%" }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isCurrent ? "text-accent" : "text-white"}`}>{track.title}</p>
                  <p className="text-xs text-white/40 truncate">{track.artist}</p>
                </div>

                <span className="text-[11px] text-white/20 shrink-0">{track.category}</span>

                {isCurrent && (
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="shrink-0 w-9 h-9 rounded-full bg-accent flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white pl-0.5" />}
                  </button>
                )}
              </div>
            );
          })}

          {tracks.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{lang === "ar" ? "لا توجد نتائج" : lang === "fr" ? "Aucun résultat" : "No results found"}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MusicPage;
