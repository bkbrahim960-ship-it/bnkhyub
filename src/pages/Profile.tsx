/**
 * BNKhub — Page Profil.
 * Modifie pseudo, avatar, langue préférée, thème préféré.
 * Synchronise localStorage (UI courante) + table profiles (Cloud).
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { useTheme, THEMES, ThemeName } from "@/context/ThemeContext";
import { getMyProfile, updateMyProfile, uploadAvatar, Profile } from "@/services/profile";
import { useSettings } from "@/context/SettingsContext";
import { Switch } from "@/components/ui/switch";
import type { Lang } from "@/services/i18n";
import { toast } from "sonner";
import { Loader2, LogOut, Upload, User as UserIcon, Bell } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { kidsMode, setKidsMode } = useSettings();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [prefLang, setPrefLang] = useState<Lang>(lang);
  const [prefTheme, setPrefTheme] = useState<ThemeName>(theme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      // Pas connecté : on laisse le rendu alternatif afficher le CTA
      setLoading(false);
      return;
    }
    if (!user) return;
    getMyProfile(user.id)
      .then((p) => {
        setProfile(p);
        if (p) {
          setUsername(p.username ?? "");
          setAvatarUrl(p.avatar_url ?? "");
          setPrefLang((p.preferred_language as Lang) ?? lang);
          setPrefTheme((p.preferred_theme as ThemeName) ?? theme);
        }
      })
      .catch(() => toast.error("Impossible de charger le profil"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      setAvatarUrl(url);
      await updateMyProfile(user.id, { avatar_url: url });
      toast.success(t("profile_saved"));
    } catch (err: any) {
      toast.error(err?.message ?? "Upload impossible");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateMyProfile(user.id, {
        username: username.trim() || null,
        avatar_url: avatarUrl || null,
        preferred_language: prefLang,
        preferred_theme: prefTheme,
      });
      // Applique immédiatement à l'UI courante
      setLang(prefLang);
      setTheme(prefTheme);
      toast.success(t("profile_saved"));
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Déconnecté");
    navigate("/");
  };

  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="container max-w-xl pt-28 pb-20 text-center">
          <h1 className="font-display text-3xl text-gradient-accent mb-4">{t("profile_title")}</h1>
          <p className="text-muted-foreground mb-6">{t("profile_signin_prompt")}</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground font-semibold px-6 py-3 rounded-full shadow-accent"
          >
            {t("profile_signin_cta")}
          </Link>
        </div>
      </Layout>
    );
  }

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container pt-28 pb-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl pt-28 pb-20">
        <div className="bg-surface-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-card-luxe animate-fade-slide-up">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl text-gradient-accent">{t("profile_title")}</h1>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("profile_signout")}
            </button>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative w-24 h-24 rounded-full bg-surface-elevated border-2 border-accent-subtle overflow-hidden shadow-glow">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <UserIcon className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 grid place-items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              )}
            </div>
            <div>
              <button
                onClick={onPickFile}
                disabled={uploading}
                className="inline-flex items-center gap-2 border border-accent-subtle text-accent px-4 py-2 rounded-full text-sm hover:bg-accent/10 transition-colors disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
                {t("profile_upload_avatar")}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">{user?.email}</p>
            </div>
          </div>

          {/* Pseudo */}
          <label className="block mb-5">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {t("profile_username")}
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full px-4 py-3 rounded-lg bg-surface-primary border border-border focus:border-accent-subtle focus:outline-none"
              placeholder="Votre pseudo"
            />
          </label>

          {/* Langue */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {t("profile_language")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(LANGUAGES) as Lang[]).map((l) => {
                const meta = LANGUAGES[l];
                const active = prefLang === l;
                return (
                  <button
                    key={l}
                    onClick={() => setPrefLang(l)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                      active
                        ? "border-accent bg-accent/10 text-accent shadow-accent"
                        : "border-border bg-surface-primary hover:border-accent-subtle"
                    }`}
                  >
                    <span className="text-base">{meta.flag}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thème */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {t("profile_theme")}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(Object.keys(THEMES) as ThemeName[]).map((tn) => {
                const meta = THEMES[tn];
                const active = prefTheme === tn;
                return (
                  <button
                    key={tn}
                    onClick={() => setPrefTheme(tn)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all ${
                      active
                        ? "border-accent shadow-accent"
                        : "border-border hover:border-accent-subtle"
                    }`}
                    title={meta.label}
                  >
                    <span
                      className="w-8 h-8 rounded-full border-2 border-background"
                      style={{ background: meta.swatch }}
                    />
                    <span className="text-[10px] text-muted-foreground">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kids Mode */}
          <div className="mb-8 flex items-center justify-between p-4 rounded-xl bg-surface-primary border border-border">
            <div>
              <p className="text-sm font-semibold">{t("profile_kids_mode") || "Mode Enfants"}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("profile_kids_mode_desc") || "Filtrer le contenu non adapté aux plus jeunes"}</p>
            </div>
            <Switch 
              checked={kidsMode} 
              onCheckedChange={setKidsMode}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          {/* Notifications */}
          <div className="mb-8 flex items-center justify-between p-4 rounded-xl bg-surface-primary border border-border">
            <div>
              <p className="text-sm font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent" />
                {t("profile_notifications") || "Notifications"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("profile_notifications_desc") || "Recevoir des alertes pour les nouveautés"}</p>
            </div>
            <Switch 
              checked={typeof window !== "undefined" && Notification.permission === "granted"} 
              onCheckedChange={async (val) => {
                if (val && typeof window !== "undefined") {
                  const permission = await Notification.requestPermission();
                  if (permission === "granted") toast.success("Notifications activées !");
                }
              }}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-accent text-accent-foreground font-semibold py-3 rounded-full shadow-accent hover:scale-[1.01] transition-transform disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("profile_save")}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
