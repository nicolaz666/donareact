import { useState, useEffect } from "react";

/**
 * Detects viewport size and returns responsive flags.
 * Breakpoint matches Tailwind md: 768px
 */
export function useResponsiveView(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return { isMobile, isDesktop: !isMobile };
}
