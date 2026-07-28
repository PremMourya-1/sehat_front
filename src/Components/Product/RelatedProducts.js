"use client";

import { useEffect, useState, useTransition } from "react";
import { productApi } from "@/Service/api";
import ProductCard from "@/Components/Card/ProductCard";
import Button from "@/Components/Button/Button";

export default function RelatedProducts({ categoryId, excludeId }) {
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    let cancelled = false;
    setInitialLoad(true);

    productApi
      .browse({ categoryId, limit: 8 })
      .then((res) => {
        if (cancelled) return;
        if (res.data.action) {
          const items = (res.data.data?.items || []).filter(
            (item) => item.id !== excludeId,
          );
          setProducts(items);
          setCursor(res.data.data?.nextCursor || null);
          setHasMore(Boolean(res.data.data?.hasMore));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInitialLoad(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, excludeId]);

  const loadMore = () => {
    startTransition(async () => {
      try {
        const res = await productApi.browse({ categoryId, limit: 8, cursor });
        if (res.data.action) {
          const items = (res.data.data?.items || []).filter(
            (item) => item.id !== excludeId,
          );
          setProducts((prev) => [...prev, ...items]);
          setCursor(res.data.data?.nextCursor || null);
          setHasMore(Boolean(res.data.data?.hasMore));
        }
      } catch {
        // silently ignore — related products are a non-critical enhancement
      }
    });
  };

  if (initialLoad || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h2 className="font-heading text-2xl text-(--primary)">You may also like</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 max-[400px]:gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isPending}>
            {isPending ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </section>
  );
}
