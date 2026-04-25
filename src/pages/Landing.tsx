
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Tv, 
  ShieldCheck, 
  Star, 
  Users, 
  ChevronRight, 
  Zap, 
  Film,
  Monitor
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const Landing = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStart = () => {
    localStorage.setItem("hasSeenLanding", "true");
    navigate("/");
  };

  const isRTL = lang === "ar";

  const features = [
    {
      icon: <Film className="w-8 h-8 text-accent" />,
      title: lang === "ar" ? "سينما العالم" : "Cinéma Mondial",
      desc: lang === "ar" ? "آلاف الأفلام والمسلسلات الحصرية بجودة 4K." : "Des milliers de films et séries en qualité 4K."
    },
    {
      icon: <Monitor className="w-8 h-8 text-accent" />,
      title: lang === "ar" ? "قنوات مباشرة" : "Chaînes TV Live",
      desc: lang === "ar" ? "بث مباشر للقنوات العربية والعالمية بدون تقطيع." : "Streaming en direct des chaînes arabes et internationales."
    },
    {
      icon: <Zap className="w-8 h-8 text-accent" />,
      title: lang === "ar" ? "السينما القبائلية" : "Cinéma Kabyle",
      desc: lang === "ar" ? "أعمال حصرية ومدبلجة باللغة القبائلية (Kabyle Content)." : "Productions exclusives et doublages en langue Kabyle."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-accent" />,
      title: lang === "ar" ? "وضع الأطفال" : "Mode Enfants",
      desc: lang === "ar" ? "تصفح آمن ومحتوى مفلتر لجميع أفراد العائلة." : "Navigation sécurisée et contenu filtré pour toute la famille."
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: lang === "ar" ? "مجتمع تفاعلي" : "Communauté",
      desc: lang === "ar" ? "شارك رأيك وتقييمك للأفلام مع بقية المستخدمين." : "Partagez vos avis et notes avec les autres utilisateurs."
    },
    {
      icon: <Star className="w-8 h-8 text-accent" />,
      title: lang === "ar" ? "تجربة فاخرة" : "Expérience Premium",
      desc: lang === "ar" ? "واجهة حديثة تدعم الوضع المظلم (OLED) والسرعة الفائقة." : "Interface moderne, mode OLED et rapidité exceptionnelle."
    }
  ];

  return (
    <div className={`min-h-screen bg-black text-white selection:bg-accent selection:text-white overflow-hidden flex flex-col ${isRTL ? "font-arabic" : "font-sans"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col container max-w-6xl mx-auto px-6 py-12">
        {/* Header Logo */}
        <div className={`flex items-center gap-4 mb-16 transition-all duration-1000 transform ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-2xl border border-accent/30 flex items-center justify-center shadow-glow overflow-hidden">
            <div 
              style={{ 
                backgroundColor: 'var(--accent)',
                maskImage: 'url(/icon.png)',
                WebkitMaskImage: 'url(/icon.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center'
              }}
              className="w-full h-full scale-[0.7]"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">BNK<span className="text-accent">hub</span></h1>
            <p className="text-[11px] uppercase tracking-[0.4em] text-accent/60 font-semibold">{t("tagline")}</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}>
            <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              {lang === "ar" ? (
                <>اكتشف عالم <span className="text-accent">الترفيه</span> اللامحدود</>
              ) : (
                <>Découvrez un monde de <span className="text-accent">divertissement</span> illimité</>
              )}
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
              {lang === "ar" 
                ? "أول منصة تدمج بين السينما العالمية، القنوات الحية، والإنتاج المحلي القبائلي في تجربة واحدة فاخرة."
                : "La première plateforme qui fusionne le cinéma mondial, la TV live et les productions Kabyles locales."}
            </p>
            <button 
              onClick={handleStart}
              className="group relative inline-flex items-center gap-4 bg-accent text-accent-foreground font-bold px-12 py-5 rounded-full text-xl hover:scale-105 active:scale-95 transition-all shadow-accent/40 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {lang === "ar" ? "ابدأ الاستكشاف الآن" : "Commencer l'exploration"}
              <ChevronRight className={`w-7 h-7 group-hover:translate-x-2 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-2" : ""}`} />
            </button>
          </div>

          <div className={`relative transition-all duration-1000 delay-500 transform ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-video bg-gray-900 group">
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
               <video 
                 src="https://cdn.pixabay.com/vimeo/328515712/clouds-23232.mp4?width=1280&hash=85049386d3b3c3b3b3b3b3b3b3b3b3b3b3b3b3b3" 
                 autoPlay 
                 loop 
                 muted 
                 playsInline 
                 className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
               />
               <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center animate-pulse-glow cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-white fill-current" />
                  </div>
               </div>
               {/* Label indicating it's a preview */}
               <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-widest text-white/80">
                 {lang === "ar" ? "عرض حي" : "Aperçu Live"}
               </div>
            </div>
            {/* Float Floating Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">{lang === "ar" ? "لماذا BNKhub؟" : "Pourquoi BNKhub ?"}</h3>
            <div className="w-20 h-1.5 bg-accent mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div 
                key={i}
                className={`p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-white/[0.08] transition-all duration-500 group transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: `${700 + i * 100}ms` }}
              >
                <div className="mb-6 p-4 rounded-2xl bg-black/40 w-fit group-hover:scale-110 transition-transform duration-500 shadow-glow">
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-500 text-sm">
          <p>© 2026 BNKhub. {t("footer_rights")}</p>
          <div className="flex gap-8">
             <span>4K Ultra HD</span>
             <span>Dolby Digital</span>
             <span>Premium Interface</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
