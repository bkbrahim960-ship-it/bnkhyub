import { useEffect, useState } from "react";
import { isDesktopOrTVScreen } from "@/utils/screen";

/** True on screens ≥768px (desktop & smart TV layouts). */
export function useIsDesktopOrTV() {
  const [value, setValue] = useState(isDesktopOrTVScreen);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setValue(mql.matches);
    mql.addEventListener("change", onChange);
    setValue(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return value;
}
