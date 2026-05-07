import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, X } from "lucide-react";
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
      getTrendingMovies("fr", 1),
      getTrendingMovies("fr", 2)
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
      q: "Comment puis-je commencer à regarder ?",
      a: "Créez simplement un compte gratuit ou connectez-vous pour accéder à des milliers de films et séries."
    },
    {
      q: "Quels appareils sont pris en charge ?",
      a: "Vous pouvez regarder sur les smartphones, tablettes, ordinateurs et télévisions intelligentes."
    },
    {
      q: "Le contenu est-il entièrement gratuit ?",
      a: "Oui, tous les films et séries sont disponibles gratuitement sans aucun abonnement."
    },
    {
      q: "Comment télécharger OSN+ ?",
      a: "BNKhub est accessible directement depuis votre navigateur, pas besoin de télécharger quoi que ce soit !"
    },
    {
      q: "Où est disponible BNKhub ?",
      a: "BNKhub est disponible partout dans le monde, pour tout le monde."
    },
    {
      q: "Comment contacter le support ?",
      a: "Pour toute question, vous pouvez nous contacter via les réseaux sociaux."
    }
  ];

  return (
    <div className={`min-h-screen bg-black text-white ${isRTL ? "font-arabic" : "font-body"}`} dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent">
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
            className="px-6 py-2 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all"
          >
            Se connecter
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Posters Grid */}
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 p-6 transform -rotate-3 scale-125">
            {trending.map((m, i) => (
              m.poster_path && (
                <div key={i} className="aspect-[2/3] relative overflow-hidden rounded-lg">
                  <img 
                    src={IMG.poster(m.poster_path, "w500")} 
                    alt={m.title || m.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 p-1">
                    <img 
                      src="/logo.png" 
                      alt="BNKhub" 
                      className="w-6 md:w-8 h-auto opacity-85"
                    />
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black" />
        </div>

        <div className="relative z-10 px-6 md:px-12 max-w-4xl">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 bg-[#C124A0] rounded-full animate-pulse" />
              <span className="text-sm font-medium">Sans abonnement • 100% Gratuit</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight" style={{ fontFamily: 'Anton, sans-serif' }}>
            LE CINÉMA<br />
            <span className="text-[#C124A0]">DU MONDE</span><br />
            SANS LIMITES
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-xl">
            Découvrez des milliers de films et séries en qualité Ultra HD, gratuitement et sans abonnement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => openAuth("signup")}
              className="inline-flex items-center justify-center gap-3 bg-[#C124A0] text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-[#D93AB0] hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(193,36,160,0.4)]"
            >
              Commencer maintenant
            </button>
            <Link 
              to="/" 
              onClick={() => localStorage.setItem("hasSeenLanding", "true")}
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300"
            >
              Parcourir gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* 4K Ultra HD Picks */}
      <section className="py-20 px-6 md:px-12 bg-black">
        <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: 'Anton, sans-serif' }}>
          SÉLECTIONS 4K ULTRA HD
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trending.slice(0, 6).map((m, i) => (
            m.poster_path && (
              <div key={i} className="aspect-[2/3] rounded-xl overflow-hidden relative group cursor-pointer">
                <img 
                  src={IMG.poster(m.poster_path, "w500")} 
                  alt={m.title || m.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <img 
                    src="/logo.png" 
                    alt="BNKhub" 
                    className="w-10 md:w-12 h-auto opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
                  />
                </div>
                <div className="absolute top-3 left-3 px-3 py-1 bg-[#C124A0] rounded text-xs font-bold">
                  4K UHD
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <h3 className="font-bold text-sm">{m.title || m.name}</h3>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Seamless Streaming Experience */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Anton, sans-serif' }}>
              EXPÉRIENCE DE<br />
              <span className="text-[#C124A0]">STREAMING FLUIDE</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Regardez sur tous vos appareils, en simultané, avec une qualité exceptionnelle.
            </p>
            <button 
              onClick={() => openAuth("signup")}
              className="inline-flex items-center justify-center gap-3 bg-[#C124A0] text-white font-bold px-8 py-4 rounded-full hover:bg-[#D93AB0] hover:scale-105 transition-all duration-300"
            >
              Commencer maintenant
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#C124A0]/20 blur-[100px] rounded-full" />
            <img 
              src={trending[0]?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${trending[0].backdrop_path}` : 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop'} 
              alt="Devices" 
              className="relative z-10 w-full h-auto rounded-2xl border border-white/10 object-cover aspect-video"
            />
            <div className="absolute -right-8 top-1/4 w-40 md:w-48 aspect-[2/3] rounded-lg overflow-hidden border-2 border-[#C124A0] shadow-2xl rotate-6">
              <img 
                src={trending[0]?.poster_path ? IMG.poster(trending[0].poster_path, "w342") : ''} 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <img 
                  src="/logo.png" 
                  alt="BNKhub" 
                  className="w-10 md:w-12 h-auto opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top in Algeria */}
      <section className="py-24 px-6 md:px-12 bg-[#0a0a0a]">
        <div className="text-center mb-12">
          <p className="text-[#C124A0] font-bold mb-2">Sélectionnez ce qui est populaire cette semaine, dans votre région.</p>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12" style={{ fontFamily: 'Anton, sans-serif' }}>
          TOP EN <span className="text-[#C124A0]">ALGÉRIE</span>
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x px-4">
          {trending.slice(0, 10).map((m, i) => (
            <div key={i} className="min-w-[180px] md:min-w-[220px] snap-start relative group">
              <span className="text-[140px] md:text-[200px] font-black leading-none text-white/5 absolute -left-6 md:-left-10 -bottom-6" style={{ fontFamily: 'Anton, sans-serif', WebkitTextStroke: '3px rgba(255,255,255,0.1)' }}>
                {i + 1}
              </span>
              <div className="relative aspect-[2/3] ml-8 md:ml-12">
                <img 
                  src={m.poster_path ? IMG.poster(m.poster_path, "w500") : ''} 
                  alt={m.title || m.name} 
                  className="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <img 
                    src="/logo.png" 
                    alt="BNKhub" 
                    className="w-10 md:w-14 h-auto opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                  />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="px-2 py-1 bg-[#C124A0] rounded text-xs font-bold text-center">
                    TOP 10
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kid-Friendly Fun */}
      <section className="py-24 px-6 md:px-12 bg-gradient-b-b-[#0a0a0a] to-black">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
             <div className="relative">
               <img 
                 src="https://image.tmdb.org/t/p/w500/qA5kPYZA7FkVvqcEfJRoOy4kpHg.jpg" 
                 className="w-full rounded-2xl border border-white/10" 
                 alt=""
               />
               <div className="absolute top-3 left-3">
                 <img 
                   src="/logo.png" 
                   alt="BNKhub" 
                   className="w-10 md:w-14 h-auto opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                 />
               </div>
             </div>
             <div className="relative mt-8">
               <img 
                 src="https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" 
                 className="w-full rounded-2xl border border-white/10" 
                 alt=""
               />
               <div className="absolute top-3 left-3">
                 <img 
                   src="/logo.png" 
                   alt="BNKhub" 
                   className="w-10 md:w-14 h-auto opacity-90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                 />
               </div>
             </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Anton, sans-serif' }}>
              AMUSEMENT<br />
              <span className="text-[#C124A0]">POUR LES ENFANTS</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Découvrez une sélection de contenu à la fois sûr et amusant pour toute la famille.
            </p>
            <button 
              onClick={() => openAuth("signup")}
              className="inline-flex items-center justify-center gap-3 bg-[#C124A0] text-white font-bold px-8 py-4 rounded-full hover:bg-[#D93AB0] hover:scale-105 transition-all duration-300"
            >
              Commencer maintenant
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12 bg-black">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ fontFamily: 'Anton, sans-serif' }}>
          FOIRE AUX QUESTIONS
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/10 mb-2 bg-[#0a0a0a] rounded-lg">
                <AccordionTrigger className="text-left px-6 py-4 hover:no-underline hover:text-[#C124A0]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 px-6 pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Ready to get started */}
      <section className="py-24 px-6 md:px-12 text-center bg-gradient-to-t from-[#C124A0]/10 to-b-b-black">
        <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: 'Anton, sans-serif' }}>
          PRÊT À COMMENCER ?
        </h2>
        <button 
          onClick={() => openAuth("signup")}
          className="inline-flex items-center justify-center gap-3 bg-[#C124A0] text-white font-bold text-lg px-12 py-5 rounded-full hover:bg-[#D93AB0] hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(193,36,160,0.5)]"
        >
          Commencer maintenant
        </button>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-8 mb-8">
            <img src="/logo.png" alt="BNKhub" className="h-10 w-auto" />
            <div className="flex gap-4">
              {/* Social icons placeholder */}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm text-gray-500">
            <div>
              <h4 className="text-white font-bold mb-4">Centre d'aide</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Compte</a></li>
                <li><a href="#" className="hover:text-white">Gestion</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Juridique</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Conditions</a></li>
              </ul>
            </div>
          </div>
          <p className="text-gray-600 text-sm">© 2026 BNKhub. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl animate-modal-in">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="font-bold text-3xl mb-2" style={{ fontFamily: 'Anton, sans-serif' }}>
              {mode === "signin" ? "SE CONNECTER" : "CRÉER UN COMPTE"}
            </h2>
            <p className="text-sm text-gray-400 mb-8">
              Sauvegardez vos favoris et continuez la lecture sur n'importe quel appareil.
            </p>

            <button
              onClick={google}
              disabled={busy}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-60 mb-4"
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
              <span className="flex-1 h-px bg-white/10" />
              <span className="text-xs uppercase tracking-widest text-gray-500">ou</span>
              <span className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a] border border-white/10 focus:border-[#C124A0] focus:outline-none transition-colors"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse e-mail"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a] border border-white/10 focus:border-[#C124A0] focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#1a1a1a] border border-white/10 focus:border-[#C124A0] focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#C124A0] text-white font-bold py-3.5 rounded-xl hover:bg-[#D93AB0] transition-all disabled:opacity-60 mt-2"
              >
                {busy && <Loader2 className="w-5 h-5 animate-spin" />}
                {mode === "signin" ? "Se connecter" : "Créer un compte"}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-400">
              {mode === "signin" ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}{" "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-[#C124A0] hover:underline font-bold"
              >
                {mode === "signin" ? "Créer un compte" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
