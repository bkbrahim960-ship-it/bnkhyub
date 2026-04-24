/**
 * BNKhub — SubtitleFinder (Advanced search for subtitles).
 * Provides direct links and search options for subtitles based on ID.
 */
import { Languages, Download, ExternalLink, MessageSquare } from "lucide-react";

interface Props {
  imdbId: string;
  tmdbId: string | number;
  type: "movie" | "tv";
  title: string;
  season?: number;
  episode?: number;
}

export const SubtitleFinder = ({ imdbId, title, type, season, episode }: Props) => {
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
      name: "SubDL (Multi)",
      url: `https://subdl.com/search?q=${imdbId || query}`,
      icon: <Download className="w-4 h-4" />,
      color: "hover:bg-green-500/20 hover:text-green-400"
    }
  ];

  const languages = [
    { label: "العربية", code: "ara", flag: "🇸🇦" },
    { label: "English", code: "eng", flag: "🇺🇸" },
    { label: "Français", code: "fre", flag: "🇫🇷" },
    { label: "Español", code: "spa", flag: "🇪🇸" },
  ];

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 mt-8 animate-fade-in shadow-card-luxe">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/20 text-accent">
          <Languages className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold">نظام البحث عن ترجمة</h2>
          <p className="text-sm text-muted-foreground">قم بتحميل ملف الترجمة المناسب لفيلمك المفضل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Language Search */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-bold">بحث سريع حسب اللغة</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <a
                key={lang.code}
                href={`https://www.opensubtitles.org/en/search2/sublanguageid-${lang.code}/moviename-${imdbId || query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-primary border border-border hover:border-accent-subtle hover:bg-accent/5 transition-all duration-300 group"
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Global Providers */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-bold">محركات الترجمة العالمية</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {providers.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-primary border border-border transition-all duration-300 ${p.color} text-center`}
              >
                {p.icon}
                <span className="text-xs font-semibold">{p.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground bg-accent/5 px-3 py-1.5 rounded-full border border-accent-subtle italic">
          💡 تلميح: معظم هذه المواقع توفر ملفات بترنسيق <span className="text-accent font-bold">.SRT</span> تعمل على جميع المشغلات.
        </div>
        <div className="text-xs text-muted-foreground">
           ID: <span className="font-mono text-accent">{imdbId || "N/A"}</span> {tvSuffix}
        </div>
      </div>
    </div>
  );
};
