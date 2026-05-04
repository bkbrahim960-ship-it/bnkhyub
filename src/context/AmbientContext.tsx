import React, { createContext, useContext, useState, useCallback } from "react";

interface AmbientContextType {
  ambientColor: string;
  ambientImage: string | null;
  ambientVideo: string | null;
  setAmbientColor: (color: string) => void;
  setAmbientImage: (image: string | null) => void;
  setAmbientVideo: (video: string | null) => void;
}

const AmbientContext = createContext<AmbientContextType | undefined>(undefined);

export const AmbientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ambientColor, setAmbientColor] = useState("transparent");
  const [ambientImage, setAmbientImage] = useState<string | null>(null);
  const [ambientVideo, setAmbientVideo] = useState<string | null>(null);

  const updateColor = useCallback((color: string) => {
    setAmbientColor(color);
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--ambient-color", color);
    }
  }, []);

  return (
    <AmbientContext.Provider value={{ 
      ambientColor, 
      ambientImage, 
      ambientVideo,
      setAmbientColor: updateColor,
      setAmbientImage,
      setAmbientVideo
    }}>
      {children}
    </AmbientContext.Provider>
  );
};

export const AmbientBackground: React.FC = () => {
  const { ambientColor, ambientImage, ambientVideo } = useAmbient();
  return (
    <div className="dynamic-bg-container" aria-hidden="true">
      {ambientVideo ? (
        <video
          src={ambientVideo}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110 transition-opacity duration-1000 ease-in-out"
        />
      ) : ambientImage ? (
        <div 
          className="absolute inset-0 opacity-20 scale-125 transition-all duration-1000 ease-in-out"
          style={{ 
            backgroundImage: `url(${ambientImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ) : (
        <div 
          className="ambient-glow" 
          style={{ background: `radial-gradient(circle at center, ${ambientColor} 0%, transparent 70%)` }} 
        />
      )}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export const useAmbient = () => {
  const context = useContext(AmbientContext);
  if (!context) throw new Error("useAmbient must be used within AmbientProvider");
  return context;
};
