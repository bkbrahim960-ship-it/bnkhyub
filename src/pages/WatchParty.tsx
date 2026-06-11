import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { Play, Copy, Link, Users, Share2 } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const WatchParty = () => {
  const { lang } = useLanguage();
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
    setJoined(true);
  };

  const joinRoom = () => {
    if (roomId.length < 4) return;
    setJoined(true);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/watch-party?room=${roomId}`;
    navigator.clipboard.writeText(url);
    toast(lang === "ar" ? "تم نسخ الرابط" : "Lien copié");
  };

  return (
    <Layout>
      <SEO title="Watch Party" />
      <div className="container py-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {lang === "ar" ? "مشاهدة جماعية" : "Watch Party"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {lang === "ar"
              ? "شاهد الأفلام والمسلسلات مع أصدقائك في نفس الوقت"
              : "Regardez des films et séries avec vos amis en même temps"}
          </p>

          {!joined ? (
            <div className="space-y-4">
              <button
                onClick={createRoom}
                className="w-full flex items-center justify-center gap-3 bg-accent text-accent-foreground py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                {lang === "ar" ? "إنشاء غرفة" : "Créer une salle"}
              </button>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">
                  {lang === "ar" ? "أو" : "ou"}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex gap-2">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder={lang === "ar" ? "رمز الغرفة" : "Code salle"}
                  className="flex-1 px-4 py-3 rounded-xl bg-surface-elevated/50 border border-border text-center text-lg font-bold tracking-widest uppercase outline-none focus:border-accent"
                  maxLength={6}
                />
                <button
                  onClick={joinRoom}
                  disabled={roomId.length < 4}
                  className="px-6 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold hover:bg-accent hover:text-accent-foreground disabled:opacity-40 transition-all"
                >
                  <Link className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-surface-elevated/50 border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  {lang === "ar" ? "رمز الغرفة" : "Code salle"}
                </p>
                <p className="text-3xl font-bold tracking-[0.3em] text-accent">{roomId}</p>
              </div>
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-3 bg-accent/10 border border-accent/20 text-accent py-3 rounded-2xl font-bold hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Copy className="w-5 h-5" />
                {lang === "ar" ? "نسخ رابط الدعوة" : "Copier le lien"}
              </button>
              <p className="text-sm text-muted-foreground">
                {lang === "ar"
                  ? "شارك الرابط مع أصدقائك ليبدأوا المشاهدة معك"
                  : "Partagez le lien avec vos amis pour regarder ensemble"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WatchParty;
