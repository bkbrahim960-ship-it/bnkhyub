/**
 * BNKhub — Footer avec signature obligatoire de Brahim Ben Keddache.
 */
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative mt-24 border-t border-border bg-surface-secondary">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-3 items-start">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-accent group-hover:scale-110 transition-transform">
                <img src="/icon.png" alt="BNKhub" className="w-full h-full object-cover" />
              </div>
              <span className="font-display font-bold text-xl">
                BNK<span className="text-accent">hub</span>
              </span>
            </Link>
            <p className="font-decorative text-accent text-lg tracking-wider">
              {t("tagline")}
            </p>
          </div>

          <nav className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-display text-foreground text-base mb-3">Navigation</h4>
            <Link to="/" className="block hover:text-accent transition-colors">{t("nav_home")}</Link>
            <Link to="/movies" className="block hover:text-accent transition-colors">{t("nav_movies")}</Link>
            <Link to="/series" className="block hover:text-accent transition-colors">{t("nav_series")}</Link>
            <Link to="/search" className="block hover:text-accent transition-colors">{t("nav_search")}</Link>
          </nav>

          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-display text-foreground text-base mb-3">BNKhub</h4>
            <p>© 2025 BNKhub — {t("footer_rights")}.</p>
          </div>
        </div>

        {/* Signature designer — obligatoire */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col items-center gap-1">
          <p className="designer-credit">
            {t("footer_credit")}{" "}
            <span className="gold-name">Brahim Ben Keddache</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
