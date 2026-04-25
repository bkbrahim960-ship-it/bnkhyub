
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

interface Brand {
  id: number;
  name: string;
  logo: string;
}

const BRANDS: Brand[] = [
  { 
    id: 8, 
    name: "Netflix", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
  },
  { 
    id: 337, 
    name: "Disney+", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg"
  },
  { 
    id: 350, 
    name: "Apple TV+", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg"
  },
  { 
    id: 119, 
    name: "Prime Video", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg"
  },
  { 
    id: 384, 
    name: "HBO Max", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg"
  },
  { 
    id: 15, 
    name: "Hulu", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg"
  }
];

export const BrandRow = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-8 w-1.5 bg-accent rounded-full shadow-glow" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground/90">{t("brands_title")}</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {BRANDS.map((brand) => (
          <button
            key={brand.id}
            onClick={() => navigate(`/movies?provider=${brand.id}&providerName=${brand.name}`)}
            className="group relative flex flex-col items-center justify-center aspect-[16/9] p-6 rounded-2xl bg-surface-card/40 backdrop-blur-xl border border-border/50 hover:border-accent/60 transition-all duration-500 hover:scale-[1.05] hover:shadow-glow active:scale-95 overflow-hidden"
          >
            {/* Golden Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Logo with shadow and scale effect */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
               <img 
                src={brand.logo} 
                alt={brand.name} 
                className="w-full h-full object-contain filter grayscale brightness-200 contrast-125 opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
              />
            </div>

            {/* Accent line at bottom */}
            <div className="absolute bottom-0 inset-x-0 h-[2px] bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            
            {/* Animated Shine */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-shine" />
          </button>
        ))}
      </div>
    </section>
  );
};
