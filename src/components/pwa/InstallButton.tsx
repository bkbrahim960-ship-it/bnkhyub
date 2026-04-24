/**
 * BNKhub — Bouton flottant permanent « Installer l'app ».
 * Masqué si déjà installé.
 */
import { Download } from "lucide-react";
import { useState } from "react";
import { useInstallPWA } from "@/hooks/useInstallPWA";
import { useLanguage } from "@/context/LanguageContext";
import { InstallModal } from "./InstallModal";

export const InstallButton = () => {
  const { installed } = useInstallPWA();
  const { t } = useLanguage();
  const [forceOpen, setForceOpen] = useState(false);

  if (installed) return null;

  return (
    <>
      <button
        onClick={() => {
          // Rouvre la modale en effaçant le flag temporairement
          localStorage.removeItem("bnkhub_pwa_shown");
          setForceOpen((v) => !v);
          setTimeout(() => setForceOpen(false), 100);
        }}
        className="hidden md:inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full border border-accent-subtle text-accent hover:bg-accent/10 transition-colors duration-300"
        aria-label={t("install_float")}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t("install_float")}</span>
      </button>
      {forceOpen && <InstallModal />}
    </>
  );
};
