
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MovieCard } from "@/components/movie/MovieCard";
import { IMG, getPersonDetails, TMDBPerson } from "@/services/tmdb";
import { useLanguage } from "@/context/LanguageContext";
import { tmdbLang } from "@/services/i18n";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Calendar, MapPin, Star, User } from "lucide-react";

const Person = () => {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPersonDetails(id, tmdbLang(lang))
      .then(setPerson)
      .finally(() => setLoading(false));
  }, [id, lang]);

  if (loading || !person) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-glow-accent animate-pulse-glow mb-6">
              <img src="/icon.png" alt="Loading..." className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  const profile = IMG.profile(person.profile_path);
  const castCredits = person.combined_credits?.cast
    .filter(c => c.poster_path)
    .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    .slice(0, 30) || [];

  return (
    <Layout>
      <SEO 
        title={person.name}
        description={person.biography?.slice(0, 160) || `Découvrez la filmographie de ${person.name} sur BNKhub.`}
        image={profile || undefined}
      />

      <div className="container pt-32 pb-20">
        <Link to={-1 as any} className="inline-flex items-center gap-2 text-accent/80 hover:text-accent mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
          <span className="text-xs font-bold uppercase tracking-widest">{t("nav_back") || "Retour"}</span>
        </Link>

        <div className="grid lg:grid-cols-[350px_1fr] gap-16 items-start">
          {/* Sidebar */}
          <div className="space-y-8 animate-fade-in">
            <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-accent/10 group">
              {profile ? (
                <img src={profile} alt={person.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-surface-card flex items-center justify-center">
                  <User className="w-20 h-20 text-accent/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="p-8 rounded-3xl bg-surface-card/40 backdrop-blur-md border border-border/50 space-y-6">
               <h3 className="text-[11px] uppercase tracking-[0.2em] text-accent font-black opacity-60">Informations personnelles</h3>
               
               <div className="space-y-4">
                 {person.birthday && (
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Date de naissance</p>
                     <p className="text-sm font-bold flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-accent" /> {person.birthday}</p>
                   </div>
                 )}
                 {person.place_of_birth && (
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Lieu de naissance</p>
                     <p className="text-sm font-bold flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-accent" /> {person.place_of_birth}</p>
                   </div>
                 )}
                 {person.known_for_department && (
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Domaine</p>
                     <p className="text-sm font-bold flex items-center gap-2"><Star className="w-3.5 h-3.5 text-accent" /> {person.known_for_department}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="animate-fade-slide-up">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 text-white">{person.name}</h1>
            
            {person.biography && (
              <div className="mb-16">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent font-black mb-6 flex items-center gap-4">
                  <span className="w-10 h-px bg-accent/30" />
                  Biographie
                </h2>
                <p className="text-lg text-white/60 leading-relaxed max-w-4xl italic font-light">
                  {person.biography}
                </p>
              </div>
            )}

            <div>
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent font-black mb-10 flex items-center gap-4">
                <span className="w-10 h-px bg-accent/30" />
                Filmographie notable
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-6 pb-12">
                {castCredits.map((m, idx) => (
                  <div key={`${m.id}-${idx}`} className="animate-fade-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                    <MovieCard
                      id={m.id}
                      title={m.title ?? m.name}
                      posterPath={m.poster_path}
                      year={(m.release_date ?? m.first_air_date ?? "").slice(0, 4)}
                      rating={m.vote_average}
                      type={m.media_type}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Person;
