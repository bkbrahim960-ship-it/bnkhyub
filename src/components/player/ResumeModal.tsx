import { Play, RotateCw, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  open: boolean;
  onResume: () => void;
  onRestart: () => void;
  onClose: () => void;
  progressSeconds: number;
}

export const ResumeModal = ({ open, onResume, onRestart, onClose, progressSeconds }: Props) => {
  const { lang } = useLanguage();
  
  if (!open) return null;

  const minutes = Math.floor(progressSeconds / 60);
  const seconds = Math.floor(progressSeconds % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="absolute inset-0 z-[120] flex items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Background Blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-500 overflow-hidden group">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -end-24 w-48 h-48 bg-accent/20 blur-[80px] rounded-full group-hover:bg-accent/30 transition-colors duration-700" />
        
        <button onClick={onClose} className="absolute top-6 end-6 text-white/30 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="relative space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center shadow-accent scale-110 animate-pulse-gentle">
              <Play className="w-10 h-10 text-accent-foreground fill-current" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-white">
              {lang === "ar" ? "استئناف المشاهدة؟" : "Reprendre la lecture ?"}
            </h2>
            <p className="text-sm text-white/60">
              {lang === "ar" 
                ? `لقد توقفت عند الدقيقة ${timeStr}. هل تريد الاستكمال؟` 
                : `Vous vous êtes arrêté à ${timeStr}. Voulez-vous reprendre ?`}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={onResume}
              className="group/btn relative overflow-hidden bg-white text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{lang === "ar" ? "استكمال المشاهدة" : "Reprendre la lecture"}</span>
            </button>

            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 hover:border-white/20 transition-all active:scale-95"
            >
              <RotateCw className="w-4 h-4" />
              <span>{lang === "ar" ? "إعادة البداية" : "Recommencer au début"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
