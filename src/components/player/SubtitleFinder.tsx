import { useState, useEffect } from "react";
import { Languages, Search, Check, X, Loader2 } from "lucide-react";
import { searchSubtitles, getDownloadUrl, SubtitleResult } from "@/services/opensubtitles";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  imdb_id: string;
  season?: number;
  episode?: number;
  onSelect: (url: string) => void;
}

export const SubtitleFinder = ({ open, onClose, imdb_id, season, episode, onSelect }: Props) => {
  const [loading, setLoading] = useState(false);
  const [subtitles, setSubtitles] = useState<SubtitleResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && imdb_id) {
      fetchSubs();
    }
  }, [open, imdb_id, season, episode]);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const results = await searchSubtitles(imdb_id, "ar", season, episode);
      setSubtitles(results);
    } catch (err) {
      toast.error("فشل جلب الترجمات");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (fileId: number) => {
    setLoading(true);
    try {
      const url = await getDownloadUrl(fileId);
      if (url) {
        onSelect(url);
        onClose();
      } else {
        toast.error("فشل الحصول على رابط التحميل");
      }
    } catch (err) {
      toast.error("خطأ في التحميل");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20 text-accent">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">اختر الترجمة العربية</h3>
              <p className="text-xs text-white/50">سيتم تطبيق الترجمة فوراً على المشغل</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {loading && subtitles.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/50">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm">جاري البحث عن أفضل الترجمات...</p>
            </div>
          ) : subtitles.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/50 text-center">
              <Search className="w-8 h-8 opacity-20" />
              <p className="text-sm">لم يتم العثور على ترجمة عربية متوافقة تلقائياً</p>
              <button 
                onClick={fetchSubs}
                className="mt-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            subtitles.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSelect(sub.attributes.file_id)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all text-start group"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                    {sub.attributes.release || "Arabic Subtitle"}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      متوافقة
                    </span>
                    <span>ID: {sub.id}</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:bg-accent/20 group-hover:text-accent transition-all">
                  <Download className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/30 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">BNKhub Subtitle Engine v2.0</p>
        </div>
      </div>
    </div>
  );
};
