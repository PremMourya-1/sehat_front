"use client";

import { useMemo, useState } from "react";
import VariantPicker from "@/Components/Product/VariantPicker";
import AddToCartButton from "@/Components/Card/AddToCartButton";
import {
  formatPrice,
  getDefaultVariant,
  getDiscountPercent,
  sortVariants,
} from "@/Utils/utils";

export default function ProductDetailInteractive({ product }) {
  const variants = useMemo(
    () => sortVariants(product?.variants || []),
    [product],
  );
  const [selectedVariant, setSelectedVariant] = useState(() =>
    getDefaultVariant(variants),
  );

  const activeVariant = selectedVariant || variants[0] || null;
  const discount = activeVariant
    ? getDiscountPercent(activeVariant.mrp, activeVariant.price)
    : 0;
  const inStock = activeVariant && Number(activeVariant.stock) > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-3xl text-(--foreground)">
          {activeVariant ? formatPrice(activeVariant.price) : "--"}
        </span>
        {Number(activeVariant?.mrp) > Number(activeVariant?.price) && (
          <>
            <span className="text-lg text-(--muted) line-through">
              {formatPrice(activeVariant.mrp)}
            </span>
            <span className="rounded-full bg-(--accent) px-2.5 py-1 text-xs font-semibold text-(--foreground)">
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-(--secondary-text)">
            Select Weight
          </p>
          <VariantPicker
            variants={variants}
            selectedId={activeVariant?.id}
            onSelect={setSelectedVariant}
          />
        </div>
      )}

      <p className="text-sm text-(--secondary-text)">
        {inStock ? (
          <span className="text-(--success)">In Stock</span>
        ) : (
          <span className="text-(--danger)">Out of Stock</span>
        )}
        {activeVariant && inStock && Number(activeVariant.stock) <= 10 && (
          <span> &middot; Only {activeVariant.stock} left</span>
        )}
      </p>

      {activeVariant ? (
        <AddToCartButton product={product} variant={activeVariant} showBuyNow />
      ) : (
        <p className="text-sm text-(--muted)">
          This product currently has no available weight options.
        </p>
      )}
    </div>
  );
}
