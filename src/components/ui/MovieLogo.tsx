import { useState, useEffect, useRef } from "react";
import { IMG } from "@/services/tmdb";

interface Props {
  id: number;
  type: "movie" | "tv";
  title: string;
  className?: string;
  textClassName?: string;
}

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "b4324b67a08420e0a1d85a6c90314211";

export const MovieLogo = ({ id, type, title, className = "h-20 md:h-32", textClassName = "text-2xl sm:text-3xl md:text-5xl lg:text-7xl" }: Props) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Fetch slightly before it enters the screen
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let mounted = true;
    setLoading(true);
    const fetchLogo = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/images?api_key=${API_KEY}&include_image_language=en,null,ar,fr`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (!mounted) return;
        
        if (data.logos && data.logos.length > 0) {
          // Prefer english or null (usually the best quality transparent PNGs)
          const bestLogo = data.logos.find((l: any) => l.iso_639_1 === 'en') || 
                           data.logos.find((l: any) => l.iso_639_1 === null) || 
                           data.logos[0];
          setLogoUrl(IMG.backdrop(bestLogo.file_path, "w500"));
        } else {
          setLogoUrl(null);
        }
      } catch (err) {
        console.error("Failed to fetch logo", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLogo();
    return () => { mounted = false; };
  }, [id, type, isVisible]);

  return (
    <div ref={containerRef} className={`flex items-center w-full h-full ${className}`}>
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={title} 
          className="w-full h-full object-contain object-left drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter brightness-110 contrast-125 transition-all duration-700"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <h1 className={`font-display font-bold leading-[1.1] ${textClassName} ${loading ? "opacity-50" : "opacity-100"} transition-opacity duration-500 w-full truncate`}>
          <span className="text-white drop-shadow-2xl">{title}</span>
        </h1>
      )}
    </div>
  );
};
