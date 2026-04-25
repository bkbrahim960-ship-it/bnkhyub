/**
 * BNKhub — TV D-Pad Navigation Hook.
 * Enables smooth spatial navigation for TV remotes and keyboards.
 * Arrow keys move focus between focusable elements, Enter activates them.
 */
import { useEffect } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex="0"], input, select, textarea';

function getVisibleFocusable(): HTMLElement[] {
  const all = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE));
  return all.filter((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  });
}

function getRect(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}

function findNearest(
  current: HTMLElement,
  direction: "up" | "down" | "left" | "right"
): HTMLElement | null {
  const items = getVisibleFocusable().filter((el) => el !== current);
  if (items.length === 0) return null;

  const cur = getRect(current);
  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of items) {
    const r = getRect(el);
    let valid = false;
    let primaryDist = 0;
    let secondaryDist = 0;

    switch (direction) {
      case "up":
        valid = r.y < cur.y - 2;
        primaryDist = cur.y - r.y;
        secondaryDist = Math.abs(cur.x - r.x);
        break;
      case "down":
        valid = r.y > cur.y + 2;
        primaryDist = r.y - cur.y;
        secondaryDist = Math.abs(cur.x - r.x);
        break;
      case "left":
        valid = r.x < cur.x - 2;
        primaryDist = cur.x - r.x;
        secondaryDist = Math.abs(cur.y - r.y);
        break;
      case "right":
        valid = r.x > cur.x + 2;
        primaryDist = r.x - cur.x;
        secondaryDist = Math.abs(cur.y - r.y);
        break;
    }

    if (valid) {
      // Score: primary distance weighted heavily, secondary distance (alignment) weighted lightly
      // This ensures we prefer items directly in front of us.
      const score = primaryDist + secondaryDist * 2.5;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }
  }

  return best;
}

export function useTVNavigation() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore keys if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        if (e.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      
      if (!active || active === document.body) {
        const first = getVisibleFocusable()[0];
        if (first) first.focus();
        return;
      }

      let direction: "up" | "down" | "left" | "right" | null = null;

      switch (e.key) {
        case "ArrowUp": direction = "up"; break;
        case "ArrowDown": direction = "down"; break;
        case "ArrowLeft": direction = "left"; break;
        case "ArrowRight": direction = "right"; break;
        case "Enter":
          active.click();
          e.preventDefault();
          return;
      }

      if (direction) {
        e.preventDefault();
        const next = findNearest(active, direction);
        if (next) {
          next.focus();
          next.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
        }
      }
    };

    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, []);
}
