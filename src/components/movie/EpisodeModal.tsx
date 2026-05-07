import { Play, X, Youtube } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface EpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  onTrailer?: () => void;
  episode: {
    name: string;
    overview: string;
    episode_number: number;
    still_path: string | null;
    air_date?: string;
  };
  seriesTitle: string;
  seasonNumber: number;
  backdropFallback: string;
}

export const EpisodeModal = ({
  isOpen,
  onClose,
  onPlay,
  onTrailer,
  episode,
  seriesTitle,
  seasonNumber,
  backdropFallback
}: EpisodeModalProps) => {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  const imageSrc = episode.still_path ? `https://image.tmdb.org/t/p/w780${episode.still_path}` : backdropFallback;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-surface-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-video w-full">
          <img 
            src={imageSrc} 
            alt={episode.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
            <span className="px-2 py-1 rounded bg-accent/20 text-accent text-xs font-bold mb-3 inline-block border border-accent/20">
              {lang === 'ar' ? `الموسم ${seasonNumber} - الحلقة ${episode.episode_number}` : `Saison ${seasonNumber} - Épisode ${episode.episode_number}`}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 font-display">
              {episode.name || `${lang === 'ar' ? 'الحلقة' : 'Épisode'} ${episode.episode_number}`}
            </h2>
            <p className="text-white/60 text-sm md:text-base line-clamp-3 max-w-2xl">
              {episode.overview || (lang === 'ar' ? 'لا يوجد وصف متاح.' : 'Aucune description disponible.')}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-[#0a0a0a] flex flex-wrap items-center gap-4">
          <button
            onClick={onPlay}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-3 bg-accent text-accent-foreground px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-glow"
          >
            <Play className="w-5 h-5 fill-current" /> {lang === 'ar' ? 'مشاهدة الحلقة' : 'Regarder l\'épisode'}
          </button>

          {onTrailer && (
            <button
              onClick={onTrailer}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-xl font-bold transition-all"
            >
              <Youtube className="w-5 h-5 text-red-500" /> {lang === 'ar' ? 'إعلان المسلسل' : 'Bande-annonce'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
