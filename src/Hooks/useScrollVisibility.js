"use client";

import { useEffect, useRef, useState } from "react";

// Classic "hide on scroll down, reveal on scroll up" — shared by
// MobileBottomNav and CartFillProgress so the floating cart widget can
// slide down into the space the bottom nav vacates (and back up) exactly
// in sync with it, rather than each computing its own independent timing
// off two separate scroll listeners.
export default function useScrollVisibility(hideAfterPx = 200) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrolledUp = currentY < lastScrollY.current;

        if (currentY <= hideAfterPx) {
          setVisible(true);
        } else {
          setVisible(scrolledUp);
        }

        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideAfterPx]);

  return visible;
}
