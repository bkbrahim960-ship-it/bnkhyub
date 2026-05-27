import { useState, useEffect } from "react";

/**
 * Returns `true` when the device is in landscape orientation ON MOBILE ONLY.
 * Desktop always returns false (bars always visible).
 */
export const useImmersiveMode = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const isMobile = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const check = () => {
      if (!isMobile()) {
        setHidden(false);
        return;
      }
      setHidden(window.innerWidth > window.innerHeight);
    };

    check();
    window.addEventListener("resize", check, { passive: true });
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  return hidden;
};
