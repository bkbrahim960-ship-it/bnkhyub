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
