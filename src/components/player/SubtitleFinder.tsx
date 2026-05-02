/**
 * BNKhub — SubtitleFinder (Advanced search for subtitles).
 * Provides direct links and search options for subtitles based on ID.
 */
import { Languages, Download, ExternalLink, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  imdbId: string;
  tmdbId: string | number;
  type: "movie" | "tv";
  title: string;
  season?: number;
  episode?: number;
}

export const SubtitleFinder = ({ imdbId, title, type, season, episode }: Props) => {
  const { t } = useLanguage();
  const query = encodeURIComponent(title);
  const isTV = type === "tv";
  const tvSuffix = isTV ? ` S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}` : "";
  
  // Custom links to popular subtitle providers
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
    }
  ];

  const languages = [
    { label: "Arabe", code: "ara", flag: "🇸🇦" },
    { label: "English", code: "eng", flag: "🇺🇸" },
    { label: "Français", code: "fre", flag: "🇫🇷" },
    { label: "Español", code: "spa", flag: "🇪🇸" },
  ];

  return (
    <div className="bg-surface-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-6 md:p-8 mt-8 animate-fade-slide-up shadow-card-luxe overflow-hidden relative group">
      {/* Background Glow */}
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
        {/* Quick Language Search */}
        <div className="space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-accent font-bold opacity-70">{t("sub_search_lang")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <a
                key={lang.code}
                href={`https://www.opensubtitles.org/en/search2/sublanguageid-${lang.code}/moviename-${imdbId || query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-primary/30 border border-border/40 hover:border-accent hover:bg-accent/5 transition-all duration-500 group/item"
              >
                <span className="text-2xl group-hover/item:scale-125 transition-transform duration-500">{lang.flag}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{lang.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Global Providers */}
        <div className="space-y-4">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-accent font-bold opacity-70">{t("sub_search_global")}</h3>
          <div className="grid grid-cols-3 gap-3">
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
        </div>
      </div>

      <div className="relative mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-accent/5 px-4 py-2 rounded-full border border-accent/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          {t("sub_hint")}
        </div>
      </div>
    </div>
  );
};
