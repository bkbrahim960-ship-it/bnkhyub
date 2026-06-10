import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, ArrowLeft } from "lucide-react";

type Mode = "signin" | "signup";

export default function DesktopAuth() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const { lang, t } = useLanguage();
  const isRTL = lang === "ar";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isMobile) navigate("/auth", { replace: true });
  }, [isMobile, navigate]);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, username);
        toast.success(
          lang === "ar" ? "تم إنشاء الحساب بنجاح!" : "Compte créé avec succès !"
        );
      } else {
        await signIn(email, password);
        toast.success(
          lang === "ar" ? "تم تسجيل الدخول" : "Connexion réussie"
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur d'authentification";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full pl-14 pr-5 py-4 text-lg rounded-2xl bg-surface-card border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors";

  return (
    <Layout>
      <div
        className={`container max-w-xl pt-28 pb-20 ${isRTL ? "font-arabic" : ""}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg px-2 py-1"
        >
          <ArrowLeft className="w-5 h-5" />
          {lang === "ar" ? "العودة للرئيسية" : "Retour à l'accueil"}
        </Link>

        <div className="bg-surface-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10 shadow-card-luxe">
          <div className="flex flex-col items-center text-center mb-8">
            <img src="/logo.png" alt="BNKhub" className="h-16 w-auto mb-4" />
            <h1 className="font-display text-3xl text-gradient-accent mb-2">
              {mode === "signin" ? t("auth_signin") : t("auth_signup")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "signin"
                ? lang === "ar"
                  ? "سجّل الدخول لمزامنة قائمتك وإعداداتك"
                  : "Connectez-vous pour synchroniser votre liste et vos paramètres"
                : lang === "ar"
                  ? "أنشئ حساباً مجانياً في ثوانٍ"
                  : "Créez un compte gratuit en quelques secondes"}
            </p>
          </div>

          <div className="flex gap-2 mb-8 p-1 rounded-2xl bg-surface-primary border border-border">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                mode === "signin"
                  ? "bg-accent text-accent-foreground shadow-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth_signin")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                mode === "signup"
                  ? "bg-accent text-accent-foreground shadow-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("auth_signup")}
            </button>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {mode === "signup" && (
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    lang === "ar" ? "اسم المستخدم" : "Nom d'utilisateur"
                  }
                  className={inputClass}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === "ar" ? "البريد الإلكتروني" : "Adresse e-mail"}
                className={inputClass}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === "ar" ? "كلمة المرور" : "Mot de passe"}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-accent text-accent-foreground font-bold text-lg py-4 rounded-2xl shadow-accent hover:opacity-90 transition-all disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {busy && <Loader2 className="w-5 h-5 animate-spin" />}
              {mode === "signin" ? t("auth_signin") : t("auth_signup")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {lang === "ar" ? "يمكنك المتابعة بدون حساب —" : "Vous pouvez continuer sans compte —"}{" "}
            <Link
              to="/"
              className="text-accent hover:underline font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              {t("auth_browse_guest")}
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
