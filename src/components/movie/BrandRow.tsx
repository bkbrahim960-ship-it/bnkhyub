
import { useNavigate } from "react-router-dom";

interface Brand {
  id: number;
  name: string;
  logo: string;
  color: string;
}

const BRANDS: Brand[] = [
  { 
    id: 8, 
    name: "Netflix", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    color: "from-red-600/20 to-transparent"
  },
  { 
    id: 337, 
    name: "Disney+", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    color: "from-blue-600/20 to-transparent"
  },
  { 
    id: 350, 
    name: "Apple TV+", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg",
    color: "from-gray-400/20 to-transparent"
  },
  { 
    id: 119, 
    name: "Prime Video", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg",
    color: "from-cyan-500/20 to-transparent"
  },
  { 
    id: 384, 
    name: "HBO Max", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg",
    color: "from-purple-600/20 to-transparent"
  },
  { 
    id: 15, 
    name: "Hulu", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg",
    color: "from-green-500/20 to-transparent"
  }
];

export const BrandRow = () => {
  const navigate = useNavigate();

  return (
    <section className="container py-8 overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-8 w-1.5 bg-accent rounded-full" />
        <h2 className="text-2xl font-bold tracking-tight">المنصات العالمية • Brands</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {BRANDS.map((brand) => (
          <button
            key={brand.id}
            onClick={() => navigate(`/movies?provider=${brand.id}&providerName=${brand.name}`)}
            className={`relative group overflow-hidden rounded-2xl border border-white/10 bg-surface-card hover:border-accent/40 transition-all duration-500 hover:scale-[1.03] hover:shadow-glow-sm aspect-[16/9] flex items-center justify-center p-6`}
          >
            {/* Ambient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${brand.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Logo */}
            <img 
              src={brand.logo} 
              alt={brand.name} 
              className="relative z-10 w-full h-full object-contain filter brightness-100 group-hover:brightness-110 transition-all duration-500 drop-shadow-lg"
            />
            
            {/* Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-shine" />
          </button>
        ))}
      </div>
    </section>
  );
};
