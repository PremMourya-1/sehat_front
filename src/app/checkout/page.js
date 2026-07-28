"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { selectAuthUser } from "@/Store/Slices/authSlice";
import { clearCart, selectCartItems, selectCartSubtotal } from "@/Store/Slices/cartSlice";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import { couponApi, orderApi } from "@/Service/api";
import Button from "@/Components/Button/Button";
import Loader from "@/Components/Common/Loader/Loader";
import { formatPrice } from "@/Utils/utils";

const initialShipping = {
  shippingName: "",
  shippingPhone: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: "",
  shippingPincode: "",
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authUser = useSelector(selectAuthUser);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [shipping, setShipping] = useState(initialShipping);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponSubtotalSnapshot, setCouponSubtotalSnapshot] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (!authUser) {
      dispatch(openAuthModal({ view: "login", redirectTo: "/checkout" }));
    }
    setCheckedAuth(true);
  }, [authUser, dispatch]);

  // If the cart subtotal changes after a coupon was applied (item added /
  // removed / quantity changed), the previously computed discount is stale —
  // drop it and ask the user to re-apply.
  useEffect(() => {
    if (appliedCoupon && couponSubtotalSnapshot !== null && couponSubtotalSnapshot !== subtotal) {
      setAppliedCoupon(null);
      toast("Your cart changed — please re-apply your coupon.");
    }
  }, [subtotal, appliedCoupon, couponSubtotalSnapshot]);

  if (!checkedAuth) return <Loader fullScreen />;

  if (!authUser) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl text-(--primary)">Login Required</h1>
        <p className="text-(--secondary-text)">
          Please login to continue to checkout.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl text-(--primary)">Your Cart is Empty</h1>
        <Button url="/products">Continue Shopping</Button>
      </div>
    );
  }

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleShippingChange = (field) => (event) => {
    setShipping((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await couponApi.apply({ code: couponCode.trim(), subtotal });
      if (res.data.action) {
        setAppliedCoupon(res.data.data);
        setCouponSubtotalSnapshot(subtotal);
        toast.success("Coupon applied");
      } else {
        toast.error(res.data.message || "Invalid coupon");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSubtotalSnapshot(null);
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setPlacingOrder(true);
    try {
      const payload = {
        ...shipping,
        couponCode: appliedCoupon?.code || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };
      const res = await orderApi.create(payload);
      if (res.data.action) {
        toast.success("Order placed successfully!");
        dispatch(clearCart());
        router.push("/account");
      } else {
        toast.error(res.data.message || "Could not place order");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="font-heading text-3xl text-(--primary)">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-(--border-color) bg-(--surface) p-6">
            <h2 className="font-heading text-xl text-(--primary)">Shipping Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Full name"
                value={shipping.shippingName}
                onChange={handleShippingChange("shippingName")}
                className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                pattern="[0-9]{10}"
                value={shipping.shippingPhone}
                onChange={handleShippingChange("shippingPhone")}
                className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
              />
              <input
                required
                placeholder="Address"
                value={shipping.shippingAddress}
                onChange={handleShippingChange("shippingAddress")}
                className="sm:col-span-2 rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
              />
              <input
                required
                placeholder="City"
                value={shipping.shippingCity}
                onChange={handleShippingChange("shippingCity")}
                className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
              />
              <input
                required
                placeholder="State"
                value={shipping.shippingState}
                onChange={handleShippingChange("shippingState")}
                className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
              />
              <input
                required
                placeholder="Pincode"
                pattern="[0-9]{6}"
                value={shipping.shippingPincode}
                onChange={handleShippingChange("shippingPincode")}
                className="rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-(--border-color) bg-(--surface) p-6">
            <h2 className="font-heading text-xl text-(--primary)">Have a Coupon?</h2>
            <div className="mt-4 flex gap-3">
              <input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={Boolean(appliedCoupon)}
                className="flex-1 rounded-lg border border-(--border-color) bg-(--background) px-4 py-2.5 text-sm uppercase outline-none focus:border-(--primary) disabled:opacity-60"
              />
              {appliedCoupon ? (
                <Button type="button" variant="outline" onClick={handleRemoveCoupon}>
                  Remove
                </Button>
              ) : (
                <Button type="button" onClick={handleApplyCoupon} disabled={applyingCoupon}>
                  {applyingCoupon ? "Applying..." : "Apply"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-(--border-color) bg-(--surface) p-6">
          <h2 className="font-heading text-xl text-(--primary)">Order Summary</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-(--secondary-text)">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId}`} className="flex justify-between">
                <span>
                  {item.name} ({item.weight}) &times; {item.quantity}
                </span>
                <span className="text-(--foreground)">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-(--border-color) pt-4 text-sm">
            <div className="flex justify-between text-(--secondary-text)">
              <span>Subtotal</span>
              <span className="text-(--foreground)">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-(--success)">
                <span>Discount</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-(--foreground)">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={placingOrder}>
            {placingOrder ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
