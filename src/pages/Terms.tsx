
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";

export default function Terms() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <Layout>
      <div className="container max-w-4xl pt-32 pb-20 font-body">
        <h1 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter text-gradient-accent">
          {isAr ? "شروط الاستخدام" : "Conditions d'Utilisation"}
        </h1>
        
        <div className="prose prose-invert prose-purple max-w-none space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptation des conditions</h2>
            <p>
              En accédant à BNKhub, vous acceptez d'être lié par les présentes conditions d'utilisation. 
              La plateforme est fournie gratuitement pour un usage personnel et non commercial.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Contenu de la plateforme</h2>
            <p>
              BNKhub est un agrégateur de contenus multimédias. Nous nous efforçons de fournir la meilleure qualité possible (Ultra HD), 
              mais la disponibilité du contenu peut varier selon les sources externes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Responsabilité de l'utilisateur</h2>
            <p>
              L'utilisateur est responsable du maintien de la confidentialité de son compte. 
              Tout usage abusif de la plateforme pourra entraîner une suspension du compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Modifications du service</h2>
            <p>
              BNKhub se réserve le droit de modifier ou d'interrompre le service à tout moment sans préavis. 
              Notre objectif reste de fournir un accès libre et gratuit au cinéma mondial.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
