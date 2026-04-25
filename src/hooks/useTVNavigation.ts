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
  let bestDist = Infinity;

  for (const el of items) {
    const r = getRect(el);
    let valid = false;
    let dist = 0;

    switch (direction) {
      case "up":
        valid = r.y < cur.y - 5;
        dist = Math.abs(cur.x - r.x) * 0.4 + (cur.y - r.y);
        break;
      case "down":
        valid = r.y > cur.y + 5;
        dist = Math.abs(cur.x - r.x) * 0.4 + (r.y - cur.y);
        break;
      case "left":
        valid = r.x < cur.x - 5;
        dist = Math.abs(cur.y - r.y) * 0.4 + (cur.x - r.x);
        break;
      case "right":
        valid = r.x > cur.x + 5;
        dist = Math.abs(cur.y - r.y) * 0.4 + (r.x - cur.x);
        break;
    }

    if (valid && dist < bestDist) {
      bestDist = dist;
      best = el;
    }
  }

  return best;
}

export function useTVNavigation() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      
      // If nothing is focused, focus the first focusable element
      if (!active || active === document.body) {
        const first = getVisibleFocusable()[0];
        if (first) {
          first.focus({ preventScroll: false });
          first.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      let direction: "up" | "down" | "left" | "right" | null = null;

      switch (e.key) {
        case "ArrowUp":
          direction = "up";
          break;
        case "ArrowDown":
          direction = "down";
          break;
        case "ArrowLeft":
          direction = "left";
          break;
        case "ArrowRight":
          direction = "right";
          break;
        case "Enter":
          // Simulate click on focused element
          active.click();
          e.preventDefault();
          return;
      }

      if (direction) {
        e.preventDefault();
        const next = findNearest(active, direction);
        if (next) {
          next.focus({ preventScroll: false });
          next.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
