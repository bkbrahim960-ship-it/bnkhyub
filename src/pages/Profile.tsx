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
      .catch(() => toast.error(t("profile_load_error")))
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
      toast.error(err?.message ?? t("profile_save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("profile_signout_success"));
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
              placeholder={t("profile_username")}
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
          {/* Download App */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 shadow-glow">
              <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414L20.355 20.2474C20.551 20.5884 20.435 21.0254 20.094 21.2214C19.753 21.4174 19.317 21.3014 19.121 20.9604L16.262 16.0004H7.738L4.879 20.9604C4.683 21.3014 4.247 21.4174 3.906 21.2214C3.565 21.0254 3.449 20.5884 3.645 20.2474L6.477 15.3414C3.896 13.9164 2.154 11.2334 2.012 8.11142L2 8.00042C2 7.44842 2.448 7.00042 3 7.00042C3.552 7.00042 4 7.44842 4 8.00042C4 11.3144 6.686 14.0004 10 14.0004H14C17.314 14.0004 20 11.3144 20 8.00042C20 7.44842 20.448 7.00042 21 7.00042C21.552 7.00042 22 7.44842 22 8.00042C22 11.2334 20.104 13.9164 17.523 15.3414ZM7 11.0004C6.448 11.0004 6 10.5524 6 10.0004C6 9.44842 6.448 9.00042 7 9.00042C7.552 9.00042 8 9.44842 8 10.0004C8 10.5524 7.552 11.0004 7 11.0004ZM17 11.0004C16.448 11.0004 16 10.5524 16 10.0004C16 9.44842 16.448 9.00042 17 9.00042C17.552 9.00042 18 9.44842 18 10.0004C18 10.5524 17.552 11.0004 17 11.0004ZM15.5 3.00042L16.5 1.50042C16.638 1.29342 16.579 1.01142 16.372 0.873425C16.165 0.735425 15.883 0.794425 15.745 1.00142L14.65 2.64342C13.805 2.22842 12.923 2.00042 12 2.00042C11.077 2.00042 10.195 2.22842 9.35 2.64342L8.255 1.00142C8.117 0.794425 7.835 0.735425 7.628 0.873425C7.421 1.01142 7.362 1.39342 7.5 1.50042L8.5 3.00042C6.182 4.41242 4.542 6.84542 4.108 9.71442L4.053 10.2224C4.12 11.0454 4.316 11.8344 4.628 12.5704L4.664 12.6534C5.008 13.4354 5.485 14.1504 6.074 14.7784L6.152 14.8594C6.885 15.6174 7.747 16.2304 8.694 16.6664L8.796 16.7114C9.803 17.1474 10.89 17.3884 12 17.3884C13.11 17.3884 14.197 17.1474 15.204 16.7114L15.306 16.6664C16.253 16.2304 17.115 15.6174 17.848 14.8594L17.926 14.8594C18.515 14.1504 18.992 13.4354 19.336 12.6534L19.372 12.5704C19.684 11.8344 19.88 11.0454 19.947 10.2224L19.892 9.71442C19.458 6.84542 17.818 4.41242 15.5 3.00042Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-1">{t("profile_download_app")}</h3>
            <p className="text-xs text-muted-foreground mb-5 max-w-sm">{t("profile_download_desc")}</p>
            <a 
              href="/bnkhub.apk" 
              download 
              className="inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-glow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {lang === "ar" ? "تحميل الآن" : "Télécharger"}
            </a>
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
