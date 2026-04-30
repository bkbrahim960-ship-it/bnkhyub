import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Tv, Film, Smartphone, Sparkles, X } from "lucide-react";

const SLIDES = [
  {
    icon: <Sparkles className="w-16 h-16 text-accent mx-auto mb-6" />,
    title: "مرحباً بك في BNKhub",
    titleFr: "Bienvenue sur BNKhub",
    desc: "منصتك السينمائية الفاخرة بدون حدود. استمتع بأحدث الأفلام والمسلسلات بجودة عالية مجاناً.",
    descFr: "Votre plateforme cinéma de luxe sans limites. Profitez des derniers films et séries en haute qualité gratuitement.",
  },
  {
    icon: <Film className="w-16 h-16 text-accent mx-auto mb-6" />,
    title: "مكتبة ضخمة ومتجددة",
    titleFr: "Une bibliothèque immense",
    desc: "آلاف الأفلام والمسلسلات المترجمة والمدبلجة، بالإضافة إلى قنوات البث المباشر.",
    descFr: "Des milliers de films et séries avec sous-titres, plus des chaînes TV en direct.",
  },
  {
    icon: <Tv className="w-16 h-16 text-accent mx-auto mb-6" />,
    title: "مصمم للشاشات الذكية",
    titleFr: "Conçu pour les Smart TV",
    desc: "تجربة مشاهدة مثالية على أجهزة Android TV مع دعم كامل لجهاز التحكم عن بُعد والتكبير التلقائي.",
    descFr: "Une expérience parfaite sur Android TV avec support complet de la télécommande.",
  },
  {
    icon: <Smartphone className="w-16 h-16 text-accent mx-auto mb-6" />,
    title: "في كل مكان معك",
    titleFr: "Partout avec vous",
    desc: "حمل التطبيق الرسمي أو استخدم الموقع كـ PWA لتجربة سريعة وسلسة على هاتفك.",
    descFr: "Installez l'application officielle ou utilisez la PWA pour une expérience fluide sur mobile.",
  }
];

export const Onboarding = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<"ar" | "fr">("ar");

  useEffect(() => {
    // Detect system language roughly or use default context, here we just guess or provide bilingual
    const savedLang = localStorage.getItem("bnkhub_lang") || "ar";
    if (savedLang === "fr" || savedLang === "en") setLang("fr");
    
    const hasSeen = localStorage.getItem("bnkhub_onboarding_seen");
    if (!hasSeen) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("bnkhub_onboarding_seen", "true");
    setShow(false);
  };

  const nextStep = () => {
    if (step < SLIDES.length - 1) setStep(step + 1);
    else handleClose();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md px-4 animate-fade-in" dir={lang === "ar" ? "rtl" : "ltr"}>
      <button 
        onClick={handleClose}
        className="absolute top-6 end-6 text-muted-foreground hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="w-full max-w-lg bg-surface-elevated border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-accent/20 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 min-h-[250px] flex flex-col justify-center text-center animate-fade-slide-up" key={step}>
          {SLIDES[step].icon}
          <h2 className="font-display text-3xl font-bold mb-4 text-foreground">
            {lang === "ar" ? SLIDES[step].title : SLIDES[step].titleFr}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {lang === "ar" ? SLIDES[step].desc : SLIDES[step].descFr}
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-accent" : "w-2 bg-white/20"}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {step > 0 && (
              <button 
                onClick={prevStep}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
              >
                {lang === "ar" ? "السابق" : "Précédent"}
              </button>
            )}
            <button 
              onClick={nextStep}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-gradient-accent text-accent-foreground font-bold shadow-accent hover:scale-105 active:scale-95 transition-all"
            >
              {step === SLIDES.length - 1 ? (lang === "ar" ? "ابدأ المشاهدة" : "Commencer") : (lang === "ar" ? "التالي" : "Suivant")}
              {step < SLIDES.length - 1 && <ChevronRight className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
