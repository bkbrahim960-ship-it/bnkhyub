import { useState, useEffect } from "react";

/**
 * Returns `true` when the device is in landscape orientation.
 * Bars should be hidden in landscape and shown in portrait.
 */
export const useImmersiveMode = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    check();
    window.addEventListener("resize", check, { passive: true });
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  return isLandscape;
};
