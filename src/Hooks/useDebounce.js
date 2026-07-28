"use client";

import { useEffect, useState } from "react";

// Returns a debounced copy of `value` that only updates after `delay` ms
// of no further changes. Used for the products search box.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
