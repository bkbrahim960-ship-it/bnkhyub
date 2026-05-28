import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getMyProfile } from "@/services/profile";
import { useSettings } from "@/context/SettingsContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, LogOut, Bell, Tablet, Lock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export const SmileSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full opacity-90 drop-shadow-sm" fill="none">
    <path d="M 30 65 Q 50 80 70 65" stroke="white" strokeWidth="8" strokeLinecap="round" />
    <circle cx="35" cy="40" r="7" fill="white" />
    <circle cx="65" cy="40" r="7" fill="white" />
  </svg>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { t, lang } = useLanguage();
  const { kidsMode, setKidsMode } = useSettings();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      setLoading(false);
      return;
    }
    if (!user) return;

    const timeout = setTimeout(() => setLoading(false), 5000);

    getMyProfile(user.id)
      .then((p) => {
        if (p) {
          setUsername(p.username ?? "");
        }
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => clearTimeout(timeout);
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("profile_signout_success"));
    navigate("/");
  };

  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="container max-w-2xl pt-28 pb-20">
          <div className="bg-surface-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-card-luxe animate-fade-slide-up transform-gpu will-change-transform">
            <h1 className="font-display text-3xl text-gradient-accent mb-6">{t("profile_title")}</h1>

            {/* Sign-in prompt */}
            <div className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t("profile_signin_prompt")}</p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-5 py-2 rounded-full text-sm"
              >
                {t("profile_signin_cta")}
              </Link>
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
          </div>
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
        <div className="bg-surface-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-card-luxe animate-fade-slide-up transform-gpu will-change-transform">
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

          {/* Avatar Display */}
          <div className="mb-10 flex justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-glow ring-4 ring-accent ring-offset-4 ring-offset-background bg-accent">
              <SmileSVG />
            </div>
          </div>

          {/* Pseudo (Read-only) */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {t("profile_username")}
            </p>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-primary border border-border">
              <span className="font-semibold text-foreground">{username || user?.email}</span>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {lang === "ar" ? "لا يمكن تغيير اسم المستخدم بعد إنشاء الحساب." : "Username cannot be changed after account creation."}
            </p>
          </div>

          {/* Kids Mode */}
          <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-surface-primary border border-border">
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
          <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-surface-primary border border-border">
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
                  if (permission === "granted") toast.success(lang === "ar" ? "تم تفعيل الإشعارات!" : "Notifications enabled!");
                }
              }}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          {/* Remote Control Pairing */}
          <div className="p-6 rounded-2xl bg-surface-primary border border-border flex flex-col md:flex-row items-center gap-6 animate-fade-in">
            <div className="bg-white p-3 rounded-xl shadow-glow">
              <QRCodeSVG
                value={`${window.location.origin}/remote?session=${(window as any).tvSessionId || 'default'}`}
                size={100}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2 mb-2">
                <Tablet className="w-5 h-5 text-accent" />
                {lang === "ar" ? "تحويل الهاتف إلى ريموت" : "Phone as Remote"}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {lang === "ar"
                  ? "امسح الكود بهاتفك للتحكم في التلفاز والكتابة بسهولة."
                  : "Scan this code with your phone to control the TV and type easily."}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent">
                SESSION ID: {(window as any).tvSessionId || '...'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
