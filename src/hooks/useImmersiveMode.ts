import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Detects landscape orientation and hides UI after `timeout` ms of inactivity.
 * Returns `true` when the bars should be hidden.
 */
export const useImmersiveMode = (timeout = 10000) => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsIdle(true), timeout);
  }, [timeout]);

  // Detect orientation
  useEffect(() => {
    const checkOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
      if (!landscape) {
        // Back to portrait → always show bars
        setIsIdle(false);
        if (timerRef.current) window.clearTimeout(timerRef.current);
      } else {
        resetTimer();
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation, { passive: true });
    window.addEventListener("orientationchange", checkOrientation);
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, [resetTimer]);

  // Listen for user interaction when landscape
  useEffect(() => {
    if (!isLandscape) return;

    const events = ["touchstart", "touchmove", "mousemove", "mousedown", "scroll", "keydown"];
    const handler = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimer(); // start the initial timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isLandscape, resetTimer]);

  return isLandscape && isIdle;
};
