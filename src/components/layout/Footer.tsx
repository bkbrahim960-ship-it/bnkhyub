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
            <p>Le Cinéma du Monde, Sans Limites.</p>
          </div>
        </div>

        {/* Signature designer — obligatoire */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/50 font-bold">
            {t("footer_credit")}
          </p>
          <div className="relative group flex flex-col items-center gap-3">
            <div className="relative p-5 md:p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all duration-500 hover:scale-105 active:scale-95 group">
              <div className="absolute -inset-4 bg-accent/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="relative text-2xl md:text-4xl font-display font-black bg-gradient-to-r from-accent via-white to-accent bg-clip-text text-transparent animate-gradient-x tracking-tight">
                Brahim Ben Keddache
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium flex items-center gap-2">
              <span className="w-8 h-[1px] bg-border" />
              © 2025 BNKhub · {t("footer_rights")}
              <span className="w-8 h-[1px] bg-border" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
