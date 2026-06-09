/** True on desktop & TV layouts (≥768px). Uses synchronous matchMedia. */
export function isDesktopOrTVScreen(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches;
}
