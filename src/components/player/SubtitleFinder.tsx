/**
 * BNKhub — SubtitleFinder (Advanced search for subtitles).
 * Provides direct links and search options for subtitles based on ID.
 */
import { Languages, Download, ExternalLink, MessageSquare, Captions, Sparkles, Search, Loader2, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { searchSubtitles, getDownloadUrl, SubtitleResult } from "@/services/opensubtitles";
import { translateSubtitle } from "@/services/aiTranslator";
import { toast } from "sonner";

interface Props {
  imdbId: string;
  tmdbId: string | number;
  type: "movie" | "tv";
  title: string;
  season?: number;
  episode?: number;
  onSubtitleSelect?: (url: string) => void;
}

export const SubtitleFinder = ({ imdbId, tmdbId, title, type, season, episode, onSubtitleSelect }: Props) => {
  const { t, lang } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [engSubs, setEngSubs] = useState<SubtitleResult[]>([]);
  const [isSearchingEng, setIsSearchingEng] = useState(false);

  const query = encodeURIComponent(title);
  const isTV = type === "tv";
  const tvSuffix = isTV ? ` S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}` : "";

  const providers = [
    {
      name: "Subscene",
      url: `https://subscene.com/subtitles/searchbytitle?query=${query}`,
      icon: <MessageSquare className="w-4 h-4" />,
      color: "hover:bg-amber-500/20 hover:text-amber-400"
    },
    {
      name: "OpenSubtitles",
      url: `https://www.opensubtitles.org/en/search2/sublanguageid-all/moviename-${imdbId}`,
      icon: <ExternalLink className="w-4 h-4" />,
      color: "hover:bg-blue-500/20 hover:text-blue-400"
    },
    {
      name: "SubDL",
      url: `https://subdl.com/search?q=${imdbId || query}`,
      icon: <Download className="w-4 h-4" />,
      color: "hover:bg-green-500/20 hover:text-green-400"
    },
    {
      name: "Substital",
      url: `https://substital.com/`,
      icon: <MessageSquare className="w-4 h-4 text-purple-400" />,
      color: "hover:bg-purple-500/20 hover:text-purple-400"
    }
  ];

  const languages = [
    { label: "Arabe", code: "ara", flag: "🇸🇦" },
    { label: "English", code: "eng", flag: "🇺🇸" },
    { label: "Français", code: "fre", flag: "🇫🇷" },
    { label: "Español", code: "spa", flag: "🇪🇸" },
  ];

  const handleAiTranslate = async (subUrl: string) => {
    setIsTranslating(true);
    try {
      toast.loading(lang === 'ar' ? "جاري الترجمة بالذكاء الاصطناعي..." : "Traduction IA en cours...", { id: 'ai-trans' });
      const translatedUrl = await translateSubtitle(subUrl, 'ar');
      if (onSubtitleSelect) {
        onSubtitleSelect(translatedUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success(lang === 'ar' ? "تمت الترجمة والحقن بنجاح!" : "Traduction et injection réussies !", { id: 'ai-trans' });
      }
    } catch (err) {
      console.error(err);
      toast.error(lang === 'ar' ? "فشلت الترجمة بالذكاء الاصطناعي." : "Échec de la traduction IA.", { id: 'ai-trans' });
    } finally {
      setIsTranslating(false);
    }
  };

  const searchEnglishSubs = async () => {
    setIsSearchingEng(true);
    try {
      const results = await searchSubtitles(imdbId, "en");
      setEngSubs(results.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingEng(false);
    }
  };

  return (
    <div className="bg-surface-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-6 md:p-8 mt-8 animate-fade-slide-up shadow-card-luxe overflow-hidden relative group">
      <div className="absolute -top-24 -end-24 w-48 h-48 bg-accent/10 blur-[80px] rounded-full" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-accent text-accent-foreground shadow-accent">
            <Languages className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-gradient-accent">{t("sub_title")}</h2>
            <p className="text-sm text-muted-foreground">{t("sub_desc")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-surface-primary/50 px-3 py-1.5 rounded-full border border-border/40">
          ID: <span className="text-accent">{imdbId || "N/A"}</span> {tvSuffix}
        </div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Translation Engine */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-accent font-bold opacity-70">AI Arabic Translation Engine</h3>
            <span className="text-[9px] font-black bg-purple-500 text-white px-2 py-0.5 rounded-md animate-pulse">PREMIUM</span>
          </div>
          
          <button
            onClick={async () => {
              if (engSubs.length === 0) {
                await searchEnglishSubs();
              }
              if (engSubs.length > 0) {
                const url = await getDownloadUrl(engSubs[0].attributes.file_id);
                if (url) handleAiTranslate(url);
              } else {
                toast.error(lang === 'ar' ? "لم يتم العثور على ترجمة إنجليزية للترجمة." : "Aucun sous-titre anglais trouvé.");
              }
            }}
            disabled={isTranslating || isSearchingEng}
            className="w-full relative overflow-hidden group/ai flex items-center justify-between p-6 rounded-[2rem] bg-gradient-to-br from-purple-600/20 to-accent/20 border border-purple-500/30 hover:border-accent transition-all duration-500 shadow-2xl shadow-purple-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/ai:translate-x-full transition-transform duration-1000" />
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-500 text-white shadow-glow-purple group-hover/ai:scale-110 transition-transform">
                {isTranslating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <span className="block text-sm font-black text-white uppercase tracking-widest">{lang === 'ar' ? "ترجمة فورية بالذكاء الاصطناعي" : "AI Auto-Translate"}</span>
                <span className="block text-[10px] text-white/40 font-bold uppercase tracking-tight">{lang === 'ar' ? "تحويل الإنجليزية إلى العربية فوراً" : "English to Arabic conversion"}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-400 group-hover/ai:translate-x-2 transition-transform" />
          </button>

          <div className="space-y-3">
             <div className="flex items-center justify-between px-2">
               <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Available Sources</span>
               <button onClick={searchEnglishSubs} className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1">
                 <Search className="w-3 h-3" /> Refresh
               </button>
             </div>
             
             <div className="grid gap-2">
               {engSubs.length > 0 ? engSubs.map(sub => (
                 <button
                    key={sub.id}
                    onClick={async () => {
                      const url = await getDownloadUrl(sub.attributes.file_id);
                      if (url) handleAiTranslate(url);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/40 hover:bg-white/10 transition-all text-left"
                 >
                   <div className="flex items-center gap-3 truncate max-w-[80%]">
                     <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                     <span className="text-[10px] font-bold text-white/70 truncate">{sub.attributes.release}</span>
                   </div>
                   <Sparkles className="w-3 h-3 text-purple-500" />
                 </button>
               )) : (
                 <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No Sources Loaded</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-accent font-bold opacity-70">{t("sub_search_global")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {providers.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-surface-primary/30 border border-border/40 transition-all duration-500 ${p.color} text-center group/p`}
              >
                <div className="p-2 rounded-lg bg-surface-card border border-border/40 group-hover/p:border-current transition-colors">
                  {p.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">{p.name}</span>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {languages.map((l) => (
              <a
                key={l.code}
                href={`https://www.opensubtitles.org/en/search2/sublanguageid-${l.code}/moviename-${imdbId || query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-accent/40 text-[9px] font-bold uppercase tracking-widest transition-all"
              >
                {l.flag} {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-accent/5 px-4 py-2 rounded-full border border-accent/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          {t("sub_hint")}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-purple-500/5 px-4 py-2 rounded-full border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          {lang === 'ar' ? 'نصيحة: استخدم إضافة Substital لمتصفحك لدمج الترجمة بسهولة في أي مشغل.' : 'Conseil: Utilisez l\'extension Substital pour injecter facilement des sous-titres.'}
        </div>
      </div>
    </div>
  );
};
