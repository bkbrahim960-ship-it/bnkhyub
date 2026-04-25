import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Youtube } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey: string | null;
  title: string;
}

export const TrailerModal = ({ isOpen, onClose, videoKey, title }: TrailerModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black/95 border-accent-subtle p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <DialogTitle className="text-white flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            Trailer: {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="aspect-video w-full mt-0">
          {videoKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
              title={`${title} Trailer`}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-primary text-muted-foreground gap-4">
              <Youtube className="w-12 h-12 opacity-20" />
              <p>Désolé, aucune bande-annonce n'est disponible.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
