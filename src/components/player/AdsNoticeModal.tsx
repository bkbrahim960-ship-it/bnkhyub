/**
 * BNKhub — Modale « Excuse publicités » (première lecture uniquement).
 * Multilingue via useLanguage, affichée avant le lancement du lecteur.
 */
import { useLanguage } from "@/context/LanguageContext";
import { AlertTriangle, X } from "lucide-react";

const KEY = "bnkhub_ads_notice_shown";

export const hasSeenAdsNotice = () => !!localStorage.getItem(KEY);
export const markAdsNoticeSeen = () => localStorage.setItem(KEY, "true");

interface Props {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const AdsNoticeModal = ({ open, onAccept, onClose }: Props) => {
  const { t } = useLanguage();

  if (!open) return null;

  const accept = () => {
    markAdsNoticeSeen();
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-surface-elevated border border-accent/40 rounded-[20px] p-8 shadow-glow animate-modal-in"
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-accent" strokeWidth={2} />
          </div>
        </div>

        <h2 className="font-display text-2xl text-center mb-4 text-accent">
          🙏 {t("ads_title")}
        </h2>

        <p className="text-foreground/90 text-[15px] leading-relaxed whitespace-pre-line text-center mb-5">
          {t("ads_body")}
        </p>

        <p className="font-decorative text-accent text-center text-lg mb-7 tracking-wide">
          {t("ads_signature")}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={accept}
            className="w-full bg-gradient-accent text-accent-foreground font-semibold py-3.5 rounded-xl shadow-accent hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 ease-luxe"
          >
            ✓ {t("ads_accept")}
          </button>
          <button
            onClick={onClose}
            className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
          >
            ✕ {t("ads_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
