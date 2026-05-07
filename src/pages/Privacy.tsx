
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";

export default function Privacy() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <Layout>
      <div className="container max-w-4xl pt-32 pb-20 font-body">
        <h1 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter text-gradient-accent">
          {isAr ? "سياسة الخصوصية" : "Politique de Confidentialité"}
        </h1>
        
        <div className="prose prose-invert prose-purple max-w-none space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Collecte des données</h2>
            <p>
              BNKhub s'engage à protéger votre vie privée. Nous ne collectons que les informations nécessaires 
              au bon fonctionnement de votre compte, telles que votre adresse e-mail et votre nom d'utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Utilisation des informations</h2>
            <p>
              Vos données sont utilisées exclusivement pour personnaliser votre expérience de streaming, 
              sauvegarder votre liste de favoris et synchroniser votre progression de lecture sur vos appareils.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Sécurité</h2>
            <p>
              Nous utilisons des technologies de pointe, notamment Supabase pour la gestion sécurisée de l'authentification 
              et du stockage des données, afin de garantir que vos informations restent confidentielles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies</h2>
            <p>
              Nous utilisons des cookies essentiels pour maintenir votre session active et mémoriser vos préférences 
              de langue et de thème.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
