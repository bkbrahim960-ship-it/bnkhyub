/**
 * BNKhub — Bouton de téléchargement direct de l'APK Android.
 */
import { Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const InstallButton = () => {
  const { t } = useLanguage();

  return (
    <a
      href="/bnkhub.apk"
      download="BNKhub.apk"
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border border-accent-subtle bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground shadow-glow transition-all duration-300"
      aria-label={t("install_float")}
    >
      <Download className="w-4 h-4" />
      <span className="font-bold">Android APK</span>
    </a>
  );
};

