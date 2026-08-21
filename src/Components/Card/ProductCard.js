"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiEye, FiHeart, FiShield, FiStar, FiX } from "react-icons/fi";
import ProductTags from "@/Components/Product/ProductTags";
import VariantPicker from "@/Components/Product/VariantPicker";
import AddToCartButton from "@/Components/Card/AddToCartButton";
import {
  formatPrice,
  getDefaultVariant,
  getDiscountPercent,
  resolveImageUrl,
  sortVariants,
} from "@/Utils/utils";

// Trust badges shown as small icon+label chips when the product carries the
// matching tag — a subset of ProductTags picked out for visual emphasis.
const TRUST_BADGE_TAGS = ["100% Natural", "No Preservatives"];

function StarRating({ rating, reviewCount }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-(--secondary-text)">
      <div className="flex text-(--accent)">
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar
            key={i}
            size={12}
            fill={i < Math.round(rating) ? "currentColor" : "none"}
          />
        ))}
      </div>
      <span>
        {rating.toFixed(1)}
        {reviewCount ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const variants = useMemo(
    () => sortVariants(product?.variants || []),
    [product],
  );
  const [selectedVariant, setSelectedVariant] = useState(() =>
    getDefaultVariant(variants),
  );
  const [wishlisted, setWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  if (!product) return null;

  const activeVariant = selectedVariant || variants[0] || null;
  const discount = activeVariant
    ? getDiscountPercent(activeVariant.mrp, activeVariant.price)
    : 0;
  const inStock =
    variants.length === 0 || variants.some((v) => Number(v.stock) > 0);
  const trustBadges = (product.tags || []).filter((tag) =>
    TRUST_BADGE_TAGS.includes(tag),
  );

  return (
    <>
      <div className="group flex min-w-0 flex-col rounded-2xl border border-(--border-color) bg-(--surface) p-3 shadow-sm transition-shadow hover:shadow-md max-md:p-2">
        <div className="relative overflow-hidden rounded-xl bg-(--surface-alt)">
          <Link
            href={`/products/${product.id}`}
            className="relative block aspect-square"
          >
            <Image
              src={resolveImageUrl(product.image)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-(--accent) px-2 py-1 text-xs font-semibold text-(--foreground)">
              {discount}% OFF
            </span>
          )}

          <button
            type="button"
            onClick={() => setWishlisted((v) => !v)}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-(--surface)/90 shadow-sm transition-colors ${
              wishlisted
                ? "text-(--danger)"
                : "text-(--foreground) hover:text-(--danger)"
            }`}
          >
            <FiHeart size={15} fill={wishlisted ? "currentColor" : "none"} />
          </button>

          {/* Desktop-only: hover never fires on touch, so a hover-revealed
              button would be unreachable on mobile — tapping the image
              (which already opens the full product page) is the mobile
              equivalent, so this is hidden there rather than pinned open. */}
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1.5 rounded-full bg-(--foreground)/85 py-2 text-xs font-medium text-(--surface) opacity-100 transition-all duration-200 max-md:hidden md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            <FiEye size={14} /> Quick View
          </button>
        </div>

        <div className="mt-3 flex flex-1 flex-col gap-2 max-md:mt-2 max-md:gap-1.5">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-heading text-lg text-(--foreground) line-clamp-1 max-md:text-sm">
              {product.name}
            </h3>
          </Link>

          <StarRating rating={product.rating} reviewCount={product.reviewCount} />

          {trustBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 max-md:hidden">
              {trustBadges.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] text-(--secondary-text)"
                >
                  <FiShield size={11} className="text-(--primary)" /> {tag}
                </span>
              ))}
            </div>
          )}

          {product.shortDescription && (
            <p className="text-sm text-(--secondary-text) line-clamp-2 max-md:text-xs">
              {product.shortDescription}
            </p>
          )}

          {variants.length > 0 && (
            <div className="max-md:hidden">
              <VariantPicker
                variants={variants}
                selectedId={activeVariant?.id}
                onSelect={setSelectedVariant}
                size="sm"
              />
            </div>
          )}

          <div className="mt-1 flex items-baseline gap-2 max-md:gap-1.5">
            <span className="text-lg font-semibold text-(--foreground) max-md:text-sm">
              {activeVariant ? formatPrice(activeVariant.price) : "--"}
            </span>
            {activeVariant?.mrp > activeVariant?.price && (
              <span className="text-sm text-(--muted) line-through max-md:text-xs">
                {formatPrice(activeVariant.mrp)}
              </span>
            )}
          </div>

          <p
            className={`text-xs font-medium max-md:hidden ${inStock ? "text-(--success)" : "text-(--danger)"}`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </p>

          <div className="mt-auto pt-2 max-md:pt-1">
            {activeVariant ? (
              <AddToCartButton
                product={product}
                variant={activeVariant}
                showQuantity={false}
              />
            ) : (
              <span className="text-sm text-(--muted)">
                No variants available
              </span>
            )}
          </div>
        </div>
      </div>

      {quickViewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setQuickViewOpen(false)}
        >
          <div
            className="relative flex w-full max-w-2xl flex-col gap-4 rounded-2xl bg-(--surface) p-5 sm:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuickViewOpen(false)}
              aria-label="Close quick view"
              className="absolute right-3 top-3 text-(--secondary-text) hover:text-(--foreground)"
            >
              <FiX size={20} />
            </button>

            <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-xl bg-(--surface-alt) sm:w-56">
              <Image
                src={resolveImageUrl(product.image)}
                alt={product.name}
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <ProductTags tags={product.tags} size="xs" />
              <h3 className="font-heading text-xl text-(--foreground)">
                {product.name}
              </h3>
              <StarRating
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
              {product.shortDescription && (
                <p className="text-sm text-(--secondary-text)">
                  {product.shortDescription}
                </p>
              )}

              {variants.length > 0 && (
                <VariantPicker
                  variants={variants}
                  selectedId={activeVariant?.id}
                  onSelect={setSelectedVariant}
                />
              )}

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-semibold text-(--foreground)">
                  {activeVariant ? formatPrice(activeVariant.price) : "--"}
                </span>
                {activeVariant?.mrp > activeVariant?.price && (
                  <span className="text-sm text-(--muted) line-through">
                    {formatPrice(activeVariant.mrp)}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {activeVariant && (
                  <AddToCartButton
                    product={product}
                    variant={activeVariant}
                    showQuantity={false}
                  />
                )}
                <Link
                  href={`/products/${product.id}`}
                  className="text-center text-sm font-medium text-(--primary) underline"
                  onClick={() => setQuickViewOpen(false)}
                >
                  View full details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
