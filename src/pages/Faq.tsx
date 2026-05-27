import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: 1,
    q: {
      ar: "هل موقع BNKhub مجاني؟",
      fr: "Est-ce que BNKhub est gratuit ?",
    },
    a: {
      ar: "نعم، BNKhub مجاني بالكامل لجميع المستخدمين. يمكنك مشاهدة المحتوى المفضل لديك بدون أي رسوم.",
      fr: "Oui, BNKhub est entièrement gratuit pour tous les utilisateurs. Vous pouvez regarder votre contenu préféré sans frais.",
    }
  },
  {
    id: 2,
    q: {
      ar: "كيف أستخدم هاتفي كجهاز تحكم (ريموت)؟",
      fr: "Comment utiliser mon téléphone comme télécommande ?",
    },
    a: {
      ar: "انتقل إلى صفحة البروفايل وقم بمسح كود الـ QR باستخدام كاميرا هاتفك. سيتم توجيهك إلى صفحة التحكم بالتلفاز مباشرة.",
      fr: "Allez sur la page de profil et scannez le code QR avec l'appareil photo de votre téléphone. Vous serez dirigé vers la page de la télécommande.",
    }
  },
  {
    id: 3,
    q: {
      ar: "هل يوجد تطبيق للهواتف الذكية؟",
      fr: "Y a-t-il une application pour smartphone ?",
    },
    a: {
      ar: "نعم! يمكنك تحميل التطبيق الخاص بنا لأجهزة الأندرويد من خلال صفحة البروفايل للاستمتاع بتجربة مشاهدة أفضل.",
      fr: "Oui ! Vous pouvez télécharger notre application Android depuis la page de profil pour une meilleure expérience de visionnage.",
    }
  },
  {
    id: 4,
    q: {
      ar: "كيف أقوم بتغيير لغة الموقع؟",
      fr: "Comment changer la langue du site ?",
    },
    a: {
      ar: "يمكنك تغيير لغة الموقع بسهولة من خلال الشريط السفلي، بالنقر على زر اللغة.",
      fr: "Vous pouvez facilement changer la langue du site via la barre inférieure, en cliquant sur le bouton de langue.",
    }
  },
  {
    id: 5,
    q: {
      ar: "ما هو وضع الأطفال (Kids Mode)؟",
      fr: "Qu'est-ce que le Mode Enfants (Kids Mode) ?",
    },
    a: {
      ar: "وضع الأطفال يتيح لك تصفية المحتوى لعرض البرامج والمسلسلات المناسبة للأطفال فقط. يمكنك تفعيله من البروفايل أو الشريط السفلي.",
      fr: "Le Mode Enfants vous permet de filtrer le contenu pour n'afficher que les programmes adaptés aux enfants. Vous pouvez l'activer depuis le profil ou la barre inférieure.",
    }
  }
];

const FaqPage = () => {
  const { lang, t } = useLanguage();
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <Layout>
      <div className="container max-w-3xl pt-28 pb-20">
        <div className="text-center mb-12 animate-fade-slide-up transform-gpu">
          <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-4 shadow-glow">
            <HelpCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-4xl text-gradient-accent mb-4">
            {lang === "ar" ? "الأسئلة الشائعة (FAQ)" : "Foire Aux Questions (FAQ)"}
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            {lang === "ar" 
              ? "إليك بعض الأسئلة الأكثر شيوعاً حول كيفية استخدام المنصة."
              : "Voici quelques-unes des questions les plus fréquemment posées sur l'utilisation de la plateforme."}
          </p>
        </div>

        <div className="space-y-4 animate-fade-slide-up transform-gpu delay-100">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div 
                key={item.id} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 transform-gpu ${
                  isOpen ? "border-accent bg-accent/5 shadow-glow-sm" : "border-border bg-surface-card/60 backdrop-blur-md"
                }`}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <span className="font-semibold text-foreground text-sm md:text-base">
                    {lang === "ar" ? item.q.ar : item.q.fr}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 transform-gpu ${isOpen ? "rotate-180 text-accent" : ""}`} />
                </button>
                
                <div 
                  className={`px-5 transition-all duration-300 transform-gpu overflow-hidden ${
                    isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {lang === "ar" ? item.a.ar : item.a.fr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default FaqPage;
