"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { addToCart } from "@/Store/Slices/cartSlice";
import Button from "@/Components/Button/Button";
import { resolveImageUrl } from "@/Utils/utils";

// Variant-aware add-to-cart control. Expects `product` (with id/name/image)
// and `variant` (the currently selected weight option), so the caller
// (ProductCard or the product detail page) owns variant selection.
export default function AddToCartButton({
  product,
  variant,
  showQuantity = true,
  showBuyNow = false,
  className = "",
}) {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const router = useRouter();

  const outOfStock = !variant || Number(variant.stock) <= 0;
  const maxQty = variant && Number(variant.stock) > 0 ? Number(variant.stock) : undefined;

  const clampQuantity = (value) => {
    let next = Math.floor(value);
    if (!Number.isFinite(next) || next < 1) next = 1;
    if (maxQty && next > maxQty) next = maxQty;
    return next;
  };

  const handleQuantityChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw === "") {
      setQuantity("");
      return;
    }
    setQuantity(clampQuantity(Number(raw)));
  };

  const handleQuantityBlur = () => {
    if (quantity === "" || Number(quantity) < 1) setQuantity(1);
  };

  const buildCartLine = () => ({
    productId: product.id,
    // Carried through so cart/page.js can link straight to the product
    // without needing to re-fetch it — see Utils/utils.js getProductUrl.
    // null for a product that hasn't been given one yet; the cart page
    // falls back to productId in that case, same as everywhere else.
    slug: product.slug || null,
    variantId: variant.id,
    weight: variant.weight,
    price: variant.price,
    mrp: variant.mrp,
    name: product.name,
    image: resolveImageUrl(product.image),
    stock: variant.stock,
    quantity: clampQuantity(Number(quantity) || 1),
  });

  const handleAddToCart = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (outOfStock) return;
    dispatch(addToCart(buildCartLine()));
    toast.success(`${product.name} (${variant.weight}) added to cart`);
  };

  const handleBuyNow = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (outOfStock) return;
    dispatch(addToCart(buildCartLine()));
    router.push("/checkout");
  };

  return (
    <div className={`flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-center ${className}`}>
      {showQuantity && (
        <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-(--border-color) bg-(--surface) md:w-auto md:flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuantity((q) => clampQuantity(Number(q || 1) - 1));
            }}
            disabled={Number(quantity) <= 1}
            className="flex items-center justify-center px-3.5 py-3 text-(--secondary-text) transition-colors hover:bg-(--surface-alt) hover:text-(--foreground) active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent md:px-2.5 md:py-2"
            aria-label="Decrease quantity"
          >
            <FiMinus size={14} />
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            onClick={(e) => e.stopPropagation()}
            aria-label="Quantity"
            className="w-full min-w-0 flex-1 border-x border-(--border-color) bg-transparent text-center text-sm font-semibold text-(--foreground) focus:outline-none md:w-12 md:flex-none"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuantity((q) => clampQuantity(Number(q || 1) + 1));
            }}
            disabled={maxQty !== undefined && Number(quantity) >= maxQty}
            className="flex items-center justify-center px-3.5 py-3 text-(--secondary-text) transition-colors hover:bg-(--surface-alt) hover:text-(--foreground) active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent md:px-2.5 md:py-2"
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>
      )}

      <div className="flex w-full flex-1 gap-3 max-md:gap-2">
        <Button
          variant="primary"
          size="md"
          icon={FiShoppingBag}
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        {showBuyNow && (
          <Button variant="accent" size="md" onClick={handleBuyNow} disabled={outOfStock} className="flex-1">
            Buy Now
          </Button>
        )}
      </div>
    </div>
  );
}
