import { useIsMobile } from "@/hooks/use-mobile";

/** Returns the auth route appropriate for the current device. */
export function useAuthPath() {
  const isMobile = useIsMobile();
  return isMobile ? "/auth" : "/auth-desktop";
}
