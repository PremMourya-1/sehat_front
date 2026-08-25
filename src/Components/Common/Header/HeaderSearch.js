"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import { productApi } from "@/Service/api";
import useDebounce from "@/Hooks/useDebounce";
import { formatPrice, getDefaultVariant, resolveImageUrl } from "@/Utils/utils";

// Header search: one icon button, one overlay that works for both desktop
// and mobile — full-bleed from the top edge on mobile, a centered rounded
// card with margin from sm up (see the responsive classes on the panel
// below) — rather than two separate implementations. Live results come
// from GET /api/products/search (see productController.js), debounced the
// same way the /products page's own search box already is.
export default function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    setIsLoading(true);
    productApi
      .search({ q: debouncedQuery })
      .then((res) => {
        if (cancelled) return;
        setResults(res.data.action ? res.data.data || [] : []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const goToProduct = (id) => {
    close();
    router.push(`/products/${id}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="text-(--foreground) transition-colors hover:text-(--primary)"
      >
        <FiSearch size={21} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-60 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-x-0 top-0 z-70 flex max-h-screen flex-col overflow-hidden bg-(--surface) shadow-xl sm:inset-x-0 sm:top-6 sm:mx-auto sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="flex items-center gap-3 border-b border-(--border-color) p-4">
                <FiSearch size={20} className="shrink-0 text-(--secondary-text)" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search almonds, cashews, walnuts..."
                  className="flex-1 bg-transparent text-base text-(--foreground) outline-none placeholder:text-(--secondary-text)"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close search"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-(--secondary-text) transition-colors hover:bg-(--surface-alt)"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-2">
                {!debouncedQuery.trim() && (
                  <p className="p-6 text-center text-sm text-(--secondary-text)">
                    Start typing to search products
                  </p>
                )}

                {isLoading && (
                  <p className="p-6 text-center text-sm text-(--secondary-text)">Searching...</p>
                )}

                {!isLoading && debouncedQuery.trim() && results.length === 0 && (
                  <p className="p-6 text-center text-sm text-(--secondary-text)">
                    No products found for &quot;{debouncedQuery}&quot;
                  </p>
                )}

                {!isLoading &&
                  results.map((product) => {
                    const variant = getDefaultVariant(product.variants);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => goToProduct(product.id)}
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-(--surface-alt)"
                      >
                        <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-(--border-color) bg-(--surface-alt)">
                          <Image
                            src={resolveImageUrl(product.image)}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-(--foreground)">{product.name}</p>
                          {product.category?.name && (
                            <p className="text-xs text-(--secondary-text)">{product.category.name}</p>
                          )}
                        </div>
                        {variant && (
                          <span className="shrink-0 text-sm font-semibold text-(--primary)">
                            {formatPrice(variant.price)}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
