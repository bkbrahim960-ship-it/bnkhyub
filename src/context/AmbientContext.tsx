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
    document.documentElement.style.setProperty("--ambient-color", color);
  }, []);

  return (
    <AmbientContext.Provider value={{ ambientColor, setAmbientColor: updateColor }}>
      <div className="dynamic-bg-container">
        <div className="ambient-glow" />
      </div>
      <div className="content-overlay">
        {children}
      </div>
    </AmbientContext.Provider>
  );
};

export const useAmbient = () => {
  const context = useContext(AmbientContext);
  if (!context) throw new Error("useAmbient must be used within AmbientProvider");
  return context;
};
