
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const LANDING_POSTERS = [
  "https://image.tmdb.org/t/p/w300/1E5baAaEAnUhcR6S4Ymjt9pZpES.jpg",
  "https://image.tmdb.org/t/p/w300/vpnVM9B6NMmQpWeZno4HjMBG0o5.jpg",
  "https://image.tmdb.org/t/p/w300/8Y4XvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/mS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/pB8172LfXUkvh9u4SVRD9S77vS5.jpg",
  "https://image.tmdb.org/t/p/w300/t6Sna4asZ9fS6YpOiY782X69Yn0.jpg",
  "https://image.tmdb.org/t/p/w300/ztkUQvFCz9Z96mZCNm60rxkv0BT.jpg",
  "https://image.tmdb.org/t/p/w300/riYIn11q39vSra36oJ6o9vSra36.jpg",
  "https://image.tmdb.org/t/p/w300/7WsyChvSra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/8c9XvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/9dAxvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/AeXxvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/BfXxvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/CgXxvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/DhXxvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/EiXxvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/FjXxvS9Sra36oJ6o9vSra36oJ6o.jpg",
  "https://image.tmdb.org/t/p/w300/GkXxvS9Sra36oJ6o9vSra36oJ6o.jpg",
];

export default function Landing() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    localStorage.setItem("hasSeenLanding", "true");
    navigate("/");
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-body">
      {/* Background Poster Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4 transform -rotate-12 scale-150 origin-center">
          {LANDING_POSTERS.concat(LANDING_POSTERS).map((url, i) => (
            <div 
              key={i} 
              className="aspect-[2/3] bg-surface-elevated rounded-xl overflow-hidden shadow-2xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms`, animationDuration: '3s' }}
            >
              <img 
                src={url} 
                alt="" 
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x450/111111/333333?text=BNK";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dark Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-black pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-radial-gradient from-transparent to-black pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-8 animate-fade-in">
        <Link to="/" className="flex items-center gap-2 group">
           <img 
            src="/logo.png" 
            alt="BNKhub" 
            className="h-16 md:h-24 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link to="/auth">
            <Button className="bg-white hover:bg-white/90 text-black font-bold px-6 py-2 rounded-full transition-all active:scale-95 shadow-xl">
              {lang === "ar" ? "تسجيل الدخول" : "Se connecter"}
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-30 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center animate-fade-slide-up">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md mb-8 animate-float">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/90">
              {lang === "ar" ? "بدون اشتراك • مجاني 100%" : "Sans abonnement • 100% Gratuit"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black leading-[0.9] mb-6 tracking-tighter uppercase drop-shadow-2xl">
            <span className="block text-white">
              {lang === "ar" ? "سينما" : "LE CINÉMA"}
            </span>
            <span className="block text-accent">
              {lang === "ar" ? "العالم" : "DU MONDE"}
            </span>
            <span className="block text-white">
              {lang === "ar" ? "بلا حدود" : "SANS LIMITES"}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {lang === "ar" 
              ? "اكتشف آلاف الأفلام والمسلسلات بجودة Ultra HD، مجاناً وبدون أي اشتراك." 
              : "Découvrez des milliers de films et séries en qualité Ultra HD, gratuitement et sans abonnement."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <Button 
              onClick={handleStart}
              size="lg"
              className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-12 text-lg md:text-xl font-black bg-accent hover:bg-accent/90 text-white rounded-full shadow-accent transition-all hover:scale-105 active:scale-95 group"
            >
              {lang === "ar" ? "ابدأ الآن" : "Commencer maintenant"}
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <Button 
              onClick={handleStart}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-12 text-lg md:text-xl font-black border-2 border-white/20 hover:bg-white/10 text-white rounded-full transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
            >
              {lang === "ar" ? "تصفح مجاناً" : "Parcourir gratuitement"}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer / Floating language switch for mobile */}
      <div className="sm:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <LanguageSwitcher />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-radial-gradient {
          background: radial-gradient(circle at center, transparent 0%, black 100%);
        }
      `}} />
    </div>
  );
}
