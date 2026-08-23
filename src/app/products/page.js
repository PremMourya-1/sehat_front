"use client";

import { useEffect, useState, useTransition } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { productApi, categoryApi } from "@/Service/api";
import useDebounce from "@/Hooks/useDebounce";
import ProductCard from "@/Components/Card/ProductCard";
import ProductCardSkeleton from "@/Components/Card/ProductCardSkeleton";
import ProductGrid from "@/Components/Product/ProductGrid";
import Button from "@/Components/Button/Button";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    categoryApi
      .list()
      .then((res) => {
        if (res.data.action) setCategories(res.data.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    productApi
      .browse({
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
      })
      .then((res) => {
        if (cancelled) return;
        if (res.data.action) {
          setProducts(res.data.data?.items || []);
          setCursor(res.data.data?.nextCursor || null);
          setHasMore(Boolean(res.data.data?.hasMore));
        } else {
          setProducts([]);
          setHasMore(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, categoryId]);

  const loadMore = () => {
    startTransition(async () => {
      try {
        const res = await productApi.browse({
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          categoryId: categoryId || undefined,
          cursor,
        });
        if (res.data.action) {
          setProducts((prev) => [...prev, ...(res.data.data?.items || [])]);
          setCursor(res.data.data?.nextCursor || null);
          setHasMore(Boolean(res.data.data?.hasMore));
        }
      } catch {
        // ignore — user can retry via the Load More button
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl text-(--primary) md:text-4xl">
          Shop All Products
        </h1>
        <p className="font-accent text-(--accent-secondary)">
          Pure. Natural. Wholesome.
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-(--secondary-text)"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search almonds, cashews, walnuts..."
            className="w-full rounded-full border border-(--border-color) bg-(--surface) py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15"
          />
        </div>
        {categories.length > 0 && (
          <div className="relative sm:w-56">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full appearance-none rounded-full border border-(--border-color) bg-(--surface) px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <FiChevronDown
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--secondary-text)"
              size={16}
            />
          </div>
        )}
      </div>

      <div className="mt-10">
        {loading ? (
          <ProductGrid>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </ProductGrid>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-(--secondary-text)">
            No products found. Try a different search or category.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-(--secondary-text)">
              {products.length} product{products.length === 1 ? "" : "s"}
              {hasMore ? "+" : ""}
            </p>
            <ProductGrid>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isPending}
                >
                  {isPending ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
