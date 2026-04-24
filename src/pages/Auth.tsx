/**
 * BNKhub — Page Auth (email/mot de passe + Google).
 * Redirige vers / si déjà connecté.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";

type Mode = "signin" | "signup";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/profile", { replace: true });
  }, [user, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { username: username || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Compte créé, vous êtes connecté !");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur d'authentification");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur Google");
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md pt-28 pb-20">
        <div className="bg-surface-card/60 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-card-luxe animate-fade-slide-up">
          <h1 className="font-display text-3xl text-gradient-accent mb-2">
            {mode === "signin" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Synchronisez vos favoris et votre historique sur tous vos appareils.
          </p>

          <button
            onClick={google}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-3 rounded-full hover:scale-[1.01] transition-transform disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.67-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84Z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">ou</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Pseudo</span>
                <div className="relative mt-1.5">
                  <UserIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="votre pseudo"
                    className="w-full ps-10 pe-3 py-3 rounded-lg bg-surface-primary border border-border focus:border-accent-subtle focus:outline-none"
                  />
                </div>
              </label>
            )}
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <div className="relative mt-1.5">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ps-10 pe-3 py-3 rounded-lg bg-surface-primary border border-border focus:border-accent-subtle focus:outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Mot de passe</span>
              <div className="relative mt-1.5">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ps-10 pe-3 py-3 rounded-lg bg-surface-primary border border-border focus:border-accent-subtle focus:outline-none"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-accent text-accent-foreground font-semibold py-3 rounded-full shadow-accent hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            {mode === "signin" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-accent hover:underline font-medium"
            >
              {mode === "signin" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
          <p className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-accent">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
