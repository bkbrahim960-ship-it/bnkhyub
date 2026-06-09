import { useEffect, useRef } from "react";

/**
 * Enhanced remote button handling with smooth, comfortable navigation
 * Provides feedback and proper debouncing for all primary and secondary buttons
 */
export const useRemoteButtons = () => {
  const lastKeyTimeRef = useRef<Record<string, number>>({});
  const repeatDelayRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounce settings for smooth remote handling
  const INITIAL_REPEAT_DELAY = 250; // ms before repeat starts
  const REPEAT_INTERVAL = 100; // ms between repeats

  // Button configuration
  const buttonConfig = {
    // Navigation buttons - allow repeat
    ArrowUp: { repeat: true, feedback: true },
    ArrowDown: { repeat: true, feedback: true },
    ArrowLeft: { repeat: true, feedback: true },
    ArrowRight: { repeat: true, feedback: true },

    // Action buttons - no repeat
    Enter: { repeat: false, feedback: true },
    " ": { repeat: false, feedback: true }, // Space = Play/Pause
    Escape: { repeat: false, feedback: true },

    // Secondary buttons
    Home: { repeat: false, feedback: true },
    End: { repeat: false, feedback: true },
    PageUp: { repeat: false, feedback: true },
    PageDown: { repeat: false, feedback: true },
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const config = buttonConfig[key as keyof typeof buttonConfig];

      if (!config) return;

      const now = Date.now();
      const lastTime = lastKeyTimeRef.current[key] || 0;

      // If key is already being held, it's a repeat - ignore if no repeat allowed
      if (now - lastTime < 50 && !config.repeat) {
        return;
      }

      lastKeyTimeRef.current[key] = now;

      // Visual feedback
      if (config.feedback) {
        provideVisualFeedback();
      }

      // Haptic feedback (vibration) for remote
      if (config.feedback && window.navigator?.vibrate) {
        if (key === "Enter" || key === "Escape") {
          window.navigator.vibrate([30]); // Single tap for confirm/back
        } else {
          window.navigator.vibrate([10]); // Light tap for navigation
        }
      }

      // Setup repeat if allowed
      if (config.repeat && !repeatDelayRef.current[key]) {
        repeatDelayRef.current[key] = setTimeout(() => {
          const repeatHandler = () => {
            const event = new KeyboardEvent("keydown", {
              key,
              code: key,
              bubbles: true,
              cancelable: true,
            });
            window.dispatchEvent(event);

            // Continue repeating until key is released
            repeatDelayRef.current[key] = setTimeout(repeatHandler, REPEAT_INTERVAL);
          };

          repeatHandler();
        }, INITIAL_REPEAT_DELAY);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;

      // Clear repeat timeout
      if (repeatDelayRef.current[key]) {
        clearTimeout(repeatDelayRef.current[key]);
        delete repeatDelayRef.current[key];
      }

      // Clear last time tracking
      delete lastKeyTimeRef.current[key];
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      // Cleanup any pending timeouts
      Object.values(repeatDelayRef.current).forEach(timer => clearTimeout(timer));
    };
  }, []);
};

/**
 * Provide visual feedback for remote button press
 */
function provideVisualFeedback() {
  // Create a brief visual indicator on screen
  const indicator = document.createElement("div");
  indicator.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    pointer-events: none;
    z-index: 9999;
    animation: fadeInOut 0.3s ease-in-out;
  `;

  // Add animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
      50% { opacity: 1; transform: translateX(-50%) translateY(0); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }
  `;

  if (!document.head.querySelector("style[data-remote-feedback]")) {
    style.setAttribute("data-remote-feedback", "true");
    document.head.appendChild(style);
  }

  // Get active element to show which button is focused
  const active = document.activeElement as HTMLElement;
  const label = (active?.textContent || active?.getAttribute("title") || "Button").slice(0, 20);

  indicator.textContent = `→ ${label}`;
  document.body.appendChild(indicator);

  setTimeout(() => indicator.remove(), 300);
}

/**
 * Helper to trigger haptic feedback
 */
export function triggerHapticFeedback(pattern: "tap" | "double" | "hold" = "tap") {
  if (!window.navigator?.vibrate) return;

  const patterns: Record<string, number[]> = {
    tap: [20],
    double: [20, 30, 20],
    hold: [100],
  };

  window.navigator.vibrate(patterns[pattern]);
}

/**
 * Helper to focus an element with smooth scroll
 */
export function focusElementSmoothly(element: HTMLElement | null) {
  if (!element) return;

  element.focus();
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });

  // Add visual highlight
  element.style.outline = "2px solid rgba(255, 255, 255, 0.5)";
  element.style.outlineOffset = "2px";

  // Remove highlight after interaction
  const cleanup = () => {
    element.style.outline = "";
    element.style.outlineOffset = "";
    element.removeEventListener("blur", cleanup);
  };
  element.addEventListener("blur", cleanup);
}
