"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { resolveImageUrl } from "@/Utils/utils";

export default function ProductGallery({ product }) {
  const images = useMemo(() => {
    const list = Array.isArray(product?.images) && product.images.length > 0
      ? product.images.map((img) => img.image)
      : [product?.image];
    return list.filter(Boolean);
  }, [product]);

  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-(--surface-alt)">
        <Image
          src={resolveImageUrl(images[active])}
          alt={product?.name || "Product image"}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 ${
                index === active ? "border-(--primary)" : "border-transparent"
              }`}
            >
              <Image
                src={resolveImageUrl(image)}
                alt={`${product?.name || "Product"} thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
