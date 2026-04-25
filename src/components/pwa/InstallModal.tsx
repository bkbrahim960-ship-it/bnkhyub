/**
 * BNKhub — Modale d'onboarding PWA (première visite).
 * Affichée une seule fois via localStorage.
 */
import { useEffect, useState } from "react";
import { Share, Plus, Download, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const KEY = "bnkhub_pwa_shown";

export const InstallModal = () => {
  const { t } = useLanguage();
  const { platform, installed, canInstallNative, triggerInstall } = useInstallPWA();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (installed) return;
    if (localStorage.getItem(KEY)) return;
    const timer = setTimeout(() => setOpen(true), 1400);
    
    const handleRemote = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "OK") {
        close();
      }
    };
    window.addEventListener("keydown", handleRemote);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleRemote);
    };
  }, [installed]);

  const close = () => {
    localStorage.setItem(KEY, "true");
    setOpen(false);
  };

  const onInstall = async () => {
    await triggerInstall();
    close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={close}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-surface-elevated border border-accent-subtle rounded-3xl p-8 shadow-glow animate-modal-in"
      >
        <button
          onClick={close}
          className="absolute top-4 end-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-accent animate-float">
            <Download className="w-8 h-8 text-accent-foreground" strokeWidth={2.5} />
          </div>
        </div>

        <h2 className="font-display text-2xl text-center mb-2 text-gradient-accent">
          {t("install_title")}
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-6 leading-relaxed">
          {t("install_subtitle")}
        </p>

        {platform === "ios" && (
          <ol className="space-y-3 mb-6">
            <Step num={1} icon={<Share className="w-5 h-5" />} text={t("install_ios_step1")} />
            <Step num={2} icon={<Plus className="w-5 h-5" />} text={t("install_ios_step2")} />
            <Step num={3} icon={<span className="text-accent">✓</span>} text={t("install_ios_step3")} />
          </ol>
        )}

        {(platform === "android" || platform === "desktop") && canInstallNative && (
          <button
            onClick={onInstall}
            className="w-full bg-gradient-accent text-accent-foreground font-semibold py-3.5 rounded-xl shadow-accent hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 ease-luxe mb-3"
          >
            {platform === "desktop" ? t("install_desktop") : t("install_android")}
          </button>
        )}

        {platform === "android" && !canInstallNative && (
          <ol className="space-y-3 mb-6">
            <Step num={1} icon={<span>⋮</span>} text="Chrome menu" />
            <Step num={2} icon={<Plus className="w-5 h-5" />} text={t("install_ios_step2")} />
            <Step num={3} icon={<span className="text-accent">✓</span>} text={t("install_ios_step3")} />
          </ol>
        )}

        <button
          onClick={close}
          className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
        >
          {t("install_later")}
        </button>
      </div>
    </div>
  );
};

const Step = ({ num, icon, text }: { num: number; icon: React.ReactNode; text: string }) => (
  <li className="flex items-center gap-4 bg-surface-card rounded-xl px-4 py-3 border border-border">
    <span className="w-7 h-7 rounded-full bg-gradient-accent text-accent-foreground font-display text-sm flex items-center justify-center shrink-0">
      {num}
    </span>
    <span className="text-foreground/90 text-sm flex-1">{text}</span>
    <span className="text-accent shrink-0">{icon}</span>
  </li>
);
