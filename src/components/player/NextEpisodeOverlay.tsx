/**
 * BNKhub — Auto-play Next Episode overlay.
 * S'affiche quand l'utilisateur a fini un épisode pour enchaîner automatiquement.
 */
import { useEffect, useState } from "react";
import { Play, X, SkipForward } from "lucide-react";

interface Props {
  /** Seconds before auto-play triggers */
  delay?: number;
  nextEpisodeTitle: string;
  nextEpisodeNumber: number;
  seasonNumber: number;
  seriesName: string;
  stillPath?: string | null;
  onPlay: () => void;
  onCancel: () => void;
}

export const NextEpisodeOverlay = ({
  delay = 10,
  nextEpisodeTitle,
  nextEpisodeNumber,
  seasonNumber,
  seriesName,
  stillPath,
  onPlay,
  onCancel,
}: Props) => {
  const [countdown, setCountdown] = useState(delay);

  useEffect(() => {
    if (countdown <= 0) {
      onPlay();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onPlay]);

  const progress = ((delay - countdown) / delay) * 100;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center animate-fade-in">
      <div className="relative max-w-2xl w-full mx-6">
        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="absolute -top-16 right-0 w-12 h-12 rounded-full bg-white/10 border border-white/10 hover:border-white/30 grid place-items-center transition-all hover:scale-110"
          aria-label="Annuler"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="rounded-3xl overflow-hidden bg-surface-card/90 border border-white/10 shadow-2xl">
          {/* Preview Thumbnail */}
          {stillPath && (
            <div className="relative aspect-video overflow-hidden">
              <img src={stillPath} alt={nextEpisodeTitle} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              {/* Countdown Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
                      className="transition-[stroke-dasharray] duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black text-white">{countdown}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3">
              Épisode suivant
            </p>
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              {nextEpisodeTitle}
            </h3>
            <p className="text-sm text-white/40 mb-8">
              {seriesName} • S{seasonNumber} E{nextEpisodeNumber}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={onPlay}
                className="flex-1 inline-flex items-center justify-center gap-3 bg-accent text-accent-foreground py-4 rounded-xl font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" /> Lire maintenant
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all"
              >
                Annuler
              </button>
            </div>

            {/* Progress bar at bottom */}
            <div className="mt-6 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
