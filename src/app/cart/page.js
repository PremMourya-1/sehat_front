"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  removeFromCart,
  selectCartItems,
  selectCartSubtotal,
  updateQuantity,
} from "@/Store/Slices/cartSlice";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import Button from "@/Components/Button/Button";
import { formatPrice, resolveImageUrl } from "@/Utils/utils";

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { status } = useSession();

  const handleCheckout = () => {
    if (status !== "authenticated") {
      dispatch(openAuthModal({ view: "login", redirectTo: "/checkout" }));
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl text-(--primary)">Your Cart is Empty</h1>
        <p className="text-(--secondary-text)">
          Looks like you haven&apos;t added any goodness to your cart yet.
        </p>
        <Button url="/products">Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="font-heading text-3xl text-(--primary)">Shopping Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex gap-4 rounded-2xl border border-(--border-color) bg-(--surface) p-4"
            >
              <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-(--surface-alt)">
                <Image
                  src={resolveImageUrl(item.image)}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </span>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-medium text-(--foreground) hover:text-(--primary)"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-(--secondary-text)">
                      Weight: {item.weight}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        removeFromCart({
                          productId: item.productId,
                          variantId: item.variantId,
                        }),
                      )
                    }
                    className="text-(--danger) hover:opacity-80"
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-(--border-color)">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            variantId: item.variantId,
                            quantity: Math.max(1, item.quantity - 1),
                          }),
                        )
                      }
                      className="p-2 text-(--secondary-text) hover:text-(--foreground)"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            variantId: item.variantId,
                            quantity: item.quantity + 1,
                          }),
                        )
                      }
                      className="p-2 text-(--secondary-text) hover:text-(--foreground)"
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <span className="font-semibold text-(--foreground)">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-(--border-color) bg-(--surface) p-6">
          <h2 className="font-heading text-xl text-(--primary)">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-(--secondary-text)">
            <span>Subtotal</span>
            <span className="text-(--foreground)">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-(--secondary-text)">
            Shipping &amp; coupon applied at checkout.
          </p>
          <Button className="mt-6 w-full" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
