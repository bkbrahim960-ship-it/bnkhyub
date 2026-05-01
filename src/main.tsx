import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// نظام التنقل بالريموت (Android TV Navigation)
window.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const elements = Array.from(document.querySelectorAll(focusable) as HTMLElement[]);
  const index = elements.indexOf(active as HTMLElement);

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    let nextIndex = index;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextIndex = (index + 1) % elements.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nextIndex = (index - 1 + elements.length) % elements.length;

    elements[nextIndex]?.focus();
    elements[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("[SW] Registered", reg))
      .catch((err) => console.error("[SW] Registration failed", err));
  });
}
