import { useState, useEffect } from "react";
import { ShieldCheck, X, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const hasSeenAdsNotice = () => {
  try {
    return localStorage.getItem("bnkhub_ads_notice_seen") === "true";
  } catch (e) {
    return true;
  }
};

export const AdsNoticeModal = ({ open, onAccept, onClose }: Props) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const handleRemote = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "OK") {
        handleAccept();
      }
    };
    window.addEventListener("keydown", handleRemote);
    return () => window.removeEventListener("keydown", handleRemote);
  }, [open]);

  if (!open) return null;

  const handleAccept = () => {
    try {
      localStorage.setItem("bnkhub_ads_notice_seen", "true");
    } catch (e) {}
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-elevated border border-white/10 rounded-3xl p-8 shadow-2xl animate-modal-in">
        <button onClick={onClose} className="absolute top-4 end-4 text-muted-foreground hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-10 h-10 text-accent animate-pulse" />
          </div>
        </div>

        <h2 className="font-display text-2xl text-center mb-4 text-gradient-accent">
          Ads & Quality Notice
        </h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">We use third-party servers to provide the best streaming quality.</p>
          </div>
          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">Some servers may contain ads. We recommend using an ad-blocker for the best experience.</p>
          </div>
          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">If a source doesn't work, please try switching to another one (S1-S10).</p>
          </div>
        </div>

        <button
          onClick={handleAccept}
          className="w-full bg-gradient-accent text-accent-foreground font-bold py-4 rounded-xl shadow-accent hover:scale-[1.02] active:scale-95 transition-all"
        >
          I Understand & Continue
        </button>
      </div>
    </div>
  );
};
