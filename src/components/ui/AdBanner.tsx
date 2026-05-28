import { useSettings } from "@/context/SettingsContext";

export const AdBanner = () => {
  const { kidsMode } = useSettings();

  if (kidsMode) return null; // Don't show ads in kids mode

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12 mt-8 md:mt-6 relative z-30">
      <a 
        href="mailto:bnkhub.ads@gmail.com"
        className="block relative w-full rounded-2xl overflow-hidden hover:opacity-95 transition-opacity hover:scale-[1.01] duration-300 shadow-2xl shadow-accent/20 border border-white/10"
      >
        <img 
          src="/ad-banner.jpg" 
          alt="Ad Banner" 
          className="w-full h-auto"
        />
      </a>
    </div>
  );
};
