import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, Monitor, Film, Zap, ShieldCheck, Users, ChevronRight, X } from "lucide-react";
import { getTrendingMovies, TMDBMovie, IMG } from "@/services/tmdb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

type Mode = "signin" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const isRTL = lang === "ar";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [trending, setTrending] = useState<TMDBMovie[]>([]);

  useEffect(() => {
    localStorage.setItem("bnkhub_lang", "fr");
    setLang("fr");
  }, [setLang]);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    Promise.all([
      getTrendingMovies("en", 1),
      getTrendingMovies("en", 2)
    ]).then(([page1, page2]) => {
      const all = [...page1.results, ...page2.results];
      console.log("Fetched", all.length, "trending movies");
      setTrending(all);
    }).catch((err) => console.error("Error fetching trending movies:", err));
  }, []);

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
        setShowModal(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie");
        setShowModal(false);
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

  const openAuth = (selectedMode: Mode) => {
    setMode(selectedMode);
    setShowModal(true);
  };

  const faqs = [
    {
      q: lang === "ar" ? "كيف يمكنني البدء في المشاهدة؟" : lang === "fr" ? "Comment puis-je commencer à regarder ?" : lang === "es" ? "¿Cómo puedo empezar a ver?" : "How can I start watching?",
      a: lang === "ar" ? "ببساطة قم بإنشاء حساب مجاني أو تسجيل الدخول للوصول إلى آلاف الأفلام والمسلسلات." : lang === "fr" ? "Créez simplement un compte gratuit ou connectez-vous pour accéder à des milliers de films et séries." : lang === "es" ? "Simplemente crea una cuenta gratuita o inicia sesión para acceder a miles de películas y series." : "Simply create a free account or log in to access thousands of movies and series."
    },
    {
      q: lang === "ar" ? "ما هي الأجهزة المدعومة؟" : lang === "fr" ? "Quels appareils sont pris en charge ?" : lang === "es" ? "¿Qué dispositivos son compatibles?" : "What devices are supported?",
      a: lang === "ar" ? "يمكنك المشاهدة على الهواتف الذكية، الأجهزة اللوحية، أجهزة الكمبيوتر، والشاشات الذكية." : lang === "fr" ? "Vous pouvez regarder sur les smartphones, tablettes, ordinateurs et télévisions intelligentes." : lang === "es" ? "Puedes ver en teléfonos inteligentes, tabletas, computadoras y televisores inteligentes." : "You can watch on smartphones, tablets, computers, and smart TVs."
    },
    {
      q: lang === "ar" ? "هل المحتوى مجاني بالكامل؟" : lang === "fr" ? "Le contenu est-il entièrement gratuit ?" : lang === "es" ? "¿El contenido es completamente gratuito?" : "Is the content completely free?",
      a: lang === "ar" ? "نعم، جميع الأفلام والمسلسلات متوفرة مجاناً بدون أي اشتراكات." : lang === "fr" ? "Oui, tous les films et séries sont disponibles gratuitement sans aucun abonnement." : lang === "es" ? "Sí, todas las películas y series están disponibles de forma gratuita sin suscripciones." : "Yes, all movies and series are available for free without any subscriptions."
    }
  ];

  return (
    <div className={`min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-white ${isRTL ? "font-arabic" : "font-body"}`} dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <Link to="/" onClick={() => localStorage.setItem("hasSeenLanding", "true")} className="flex items-center group shrink-0 relative z-[110]">
          <img 
            src="/logo.png" 
            alt="BNKhub" 
            className="h-28 md:h-40 lg:h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)]"
          />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button 
            onClick={() => openAuth("signin")}
            className="px-4 py-2 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 hover:scale-105 active:scale-95 transition-all"
          >
            {isRTL ? "تسجيل الدخول" : "Log in"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-12 overflow-hidden text-center">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 opacity-50 select-none pointer-events-none">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 transform -skew-y-6 scale-110">
            {trending.map((m, i) => (
              m.poster_path && (
                <div key={i} className="relative w-full h-auto aspect-[2/3]">
                  <img 
                    src={IMG.poster(m.poster_path, "w500") || ''} 
                    alt={m.title || m.name} 
                    className="w-full h-full rounded-lg shadow-lg brightness-75 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <img 
                      src="/logo.png" 
                      alt="BNKhub" 
                      className="w-12 h-auto opacity-100"
                    />
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight" style={{ fontFamily: 'Anton, sans-serif' }}>
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
            {t.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => openAuth("signup")}
              className="inline-flex items-center justify-center gap-2 bg-gradient-accent text-accent-foreground font-bold text-lg px-12 py-4 rounded-full shadow-accent hover:scale-[1.05] active:scale-[0.98] transition-all duration-300"
            >
              {t.getStarted}
            </button>
            <Link 
              to="/" 
              onClick={() => localStorage.setItem("hasSeenLanding", "true")}
              className="inline-flex items-center justify-center gap-2 px-12 py-4 rounded-full border border-border bg-surface-elevated/60 backdrop-blur-md text-white font-bold text-lg hover:bg-surface-elevated hover:scale-[1.05] active:scale-[0.98] transition-all duration-300"
            >
              {isRTL ? "تصفح كزائر" : "Browse as Guest"}
              <ChevronRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4K Ultra HD Picks */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t.uhdPicks}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trending.slice(0, 6).map((m, i) => (
            m.poster_path && (
              <div key={i} className="aspect-[2/3] rounded-xl overflow-hidden relative group">
                <img src={IMG.poster(m.poster_path, "w500")} alt={m.title || m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-accent border border-accent/20">
                  4K UHD
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="BNKhub" 
                    className="w-1/2 h-auto opacity-50"
                  />
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Seamless Experience */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="text-center md:text-start">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.seamlessTitle}</h2>
            <p className="text-gray-400 text-lg mb-8">{t.seamlessSub}</p>
            <button 
              onClick={() => openAuth("signup")}
              className="inline-flex items-center justify-center gap-2 bg-gradient-accent text-accent-foreground font-bold px-8 py-3 rounded-full shadow-accent hover:scale-[1.05] active:scale-[0.98] transition-all duration-300"
            >
              {t.getStarted}
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full" />
            <img src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1000&auto=format&fit=crop" alt="Devices" className="relative z-10 w-full h-auto rounded-2xl shadow-2xl border border-white/10" />
          </div>
        </div>
      </section>

      {/* Top in Region */}
      <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.topIn}</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x">
          {trending.slice(6, 16).map((m, i) => (
            <div key={i} className="min-w-[200px] md:min-w-[280px] snap-start relative flex items-center">
              <span className="text-[120px] md:text-[200px] font-black leading-none text-white/10 absolute -left-6 md:-left-12 z-0 font-outline-2 drop-shadow-lg" style={{ fontFamily: 'Anton, sans-serif', WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>
                {i + 1}
              </span>
              <div className="relative w-[140px] md:w-[180px] aspect-[2/3] z-10 ml-12 md:ml-20">
                <img 
                  src={m.poster_path ? IMG.poster(m.poster_path, "w500") : 'https://via.placeholder.com/500x750?text=No+Poster'} 
                  alt={m.title || m.name} 
                  className="w-full h-full object-cover rounded-xl shadow-2xl" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="BNKhub" 
                    className="w-1/2 h-auto opacity-50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kid Friendly */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
             <img src="https://image.tmdb.org/t/p/w500/qA5kPYZA7FkVvqcEfJRoOy4kpHg.jpg" className="w-full rounded-2xl border border-white/10" />
             <img src="https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" className="w-full rounded-2xl border border-white/10 mt-8" />
          </div>
          <div className="order-1 md:order-2 text-center md:text-start">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.kidTitle}</h2>
            <p className="text-gray-400 text-lg mb-8">{t.kidSub}</p>
            <button 
              onClick={() => openAuth("signup")}
              className="inline-flex items-center justify-center gap-2 bg-gradient-accent text-accent-foreground font-bold px-8 py-3 rounded-full shadow-accent hover:scale-[1.05] active:scale-[0.98] transition-all duration-300"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{t.faqTitle}</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/10 mb-4 bg-white/5 px-6 rounded-2xl">
              <AccordionTrigger className="text-lg hover:no-underline hover:text-accent py-6">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-gray-400 text-base pb-6 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Ready to get started */}
      <section className="py-24 px-6 text-center bg-gradient-to-t from-accent/10 to-transparent">
        <h2 className="text-4xl font-bold mb-8">{t.readyTitle}</h2>
        <button 
            onClick={() => openAuth("signup")}
            className="inline-flex items-center justify-center gap-2 bg-gradient-accent text-accent-foreground font-bold text-lg px-12 py-4 rounded-full shadow-accent hover:scale-[1.05] active:scale-[0.98] transition-all duration-300"
          >
            {t.getStarted}
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-sm text-gray-500">
        <p>© 2026 BNKhub. {t.footerRights}</p>
      </footer>

      {/* Auth Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-md bg-[#13131A] border border-[rgba(212,168,67,0.35)] rounded-2xl p-8 shadow-2xl animate-modal-in" style={{ zIndex: 1 }}>
            {/* Decorative top bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '3px',
              background: 'linear-gradient(to right, #D4A843, #F2C94C, #A07830)',
            }} />

            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="font-display text-3xl text-[#F5F5F0] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {mode === "signin" ? (isRTL ? "تسجيل الدخول" : "Sign In") : (isRTL ? "إنشاء حساب" : "Create Account")}
            </h2>
            <p className="text-sm text-[rgba(255,255,255,0.45)] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {isRTL ? "احفظ مفضلاتك وتابع المشاهدة من أي جهاز." : "Save your favorites and continue watching on any device."}
            </p>

            <button
              onClick={google}
              disabled={busy}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.67-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
                <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84Z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
              </svg>
              {isRTL ? "المتابعة باستخدام جوجل" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-white/10" />
              <span className="text-xs uppercase tracking-widest text-gray-500">{isRTL ? "أو" : "or"}</span>
              <span className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="relative">
                  <UserIcon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isRTL ? "اسم المستخدم" : "Username"}
                    className="w-full ps-12 pe-4 py-3.5 rounded-xl bg-[#1C1C26] border border-white/10 focus:border-[#D4A843] focus:outline-none focus:bg-[#1C1C26] transition-colors"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? "البريد الإلكتروني" : "Email address"}
                  className="w-full ps-12 pe-4 py-3.5 rounded-xl bg-[#1C1C26] border border-white/10 focus:border-[#D4A843] focus:outline-none focus:bg-[#1C1C26] transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRTL ? "كلمة المرور" : "Password"}
                  className="w-full ps-12 pe-4 py-3.5 rounded-xl bg-[#1C1C26] border border-white/10 focus:border-[#D4A843] focus:outline-none focus:bg-[#1C1C26] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 text-black font-bold py-3.5 rounded-xl hover:brightness-108 hover:-translate-y-1 transition-all disabled:opacity-60 mt-2"
                style={{ background: 'linear-gradient(135deg, #D4A843, #F2C94C)', fontFamily: "'Outfit', sans-serif" }}
              >
                {busy && <Loader2 className="w-5 h-5 animate-spin" />}
                {mode === "signin" ? (isRTL ? "تسجيل الدخول" : "Sign In") : (isRTL ? "إنشاء حساب" : "Create Account")}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-400">
              {mode === "signin" ? (isRTL ? "ليس لديك حساب؟" : "Don't have an account?") : (isRTL ? "لديك حساب بالفعل؟" : "Already have an account?")}{" "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-[#D4A843] hover:underline font-bold"
              >
                {mode === "signin" ? (isRTL ? "إنشاء حساب" : "Sign Up") : (isRTL ? "تسجيل الدخول" : "Sign In")}
              </button>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
