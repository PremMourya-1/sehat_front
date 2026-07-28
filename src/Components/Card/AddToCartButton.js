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

  const buildCartLine = () => ({
    productId: product.id,
    variantId: variant.id,
    weight: variant.weight,
    price: variant.price,
    mrp: variant.mrp,
    name: product.name,
    image: resolveImageUrl(product.image),
    stock: variant.stock,
    quantity,
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
    <div className={`flex w-full min-w-0 items-center gap-3 max-md:gap-2 ${className}`}>
      {showQuantity && (
        <div className="flex items-center rounded-full border border-(--border-color)">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuantity((q) => Math.max(1, q - 1));
            }}
            className="p-2 text-(--secondary-text) hover:text-(--foreground)"
            aria-label="Decrease quantity"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuantity((q) => q + 1);
            }}
            className="p-2 text-(--secondary-text) hover:text-(--foreground)"
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>
      )}

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
  );
}
