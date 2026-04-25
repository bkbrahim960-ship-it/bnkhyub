import React, { createContext, useContext, useState, useCallback } from "react";

interface AmbientContextType {
  ambientColor: string;
  setAmbientColor: (color: string) => void;
}

const AmbientContext = createContext<AmbientContextType | undefined>(undefined);

export const AmbientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ambientColor, setAmbientColor] = useState("transparent");

  const updateColor = useCallback((color: string) => {
    setAmbientColor(color);
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--ambient-color", color);
    }
  }, []);

  return (
    <AmbientContext.Provider value={{ ambientColor, setAmbientColor: updateColor }}>
      {children}
    </AmbientContext.Provider>
  );
};

export const AmbientBackground: React.FC = () => {
  const { ambientColor } = useAmbient();
  return (
    <div className="dynamic-bg-container" aria-hidden="true">
      <div 
        className="ambient-glow" 
        style={{ background: `radial-gradient(circle at center, ${ambientColor} 0%, transparent 70%)` }} 
      />
    </div>
  );
};

export const useAmbient = () => {
  const context = useContext(AmbientContext);
  if (!context) throw new Error("useAmbient must be used within AmbientProvider");
  return context;
};
