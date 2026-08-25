"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiEdit2,
  FiLock,
  FiMapPin,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";
import { clearCart, selectCartItems, selectCartSubtotal } from "@/Store/Slices/cartSlice";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import { checkoutApi, couponApi, orderApi } from "@/Service/api";
import Button from "@/Components/Button/Button";
import Card from "@/Components/Card/Card";
import Loader from "@/Components/Common/Loader/Loader";
import MobileVerification from "@/Components/Checkout/MobileVerification";
import FloatingLabelInput from "@/Components/Form/FloatingLabelInput";
import { formatPrice } from "@/Utils/utils";
import { loadRazorpayScript } from "@/Utils/loadRazorpayScript";
import { expandCartItems } from "@/Utils/cartExpansion";

const PINCODE_REGEX = /^[0-9]{6}$/;
const DISABLED_FIELD_CLASS = "disabled:cursor-not-allowed disabled:opacity-50";

const initialShipping = {
  shippingName: "",
  shippingPhone: "",
  alternateMobile: "",
  shippingAddress: "",
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session, status } = useSession();
  const authUser = session?.user;
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [shipping, setShipping] = useState(initialShipping);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponSubtotalSnapshot, setCouponSubtotalSnapshot] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Step 1 of this page — nothing else is enterable until this passes.
  const [pincode, setPincode] = useState("");
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeResult, setPincodeResult] = useState(null); // { serviceable, codAvailable, shippingCharge } | null
  const pincodeVerified = pincodeResult?.serviceable === true;

  // Site/product-level COD policy (admin's site-wide toggle + any COD-disabled
  // product in the cart) — independent of pincode, checked as soon as the
  // cart is known. Final "can COD be offered" also needs courier-level COD
  // support for the checked pincode (pincodeResult.codAvailable).
  const [codPolicy, setCodPolicy] = useState(null); // { available, reason } | null
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Site-wide toggle (Settings > General in the admin panel, see
  // utils/webSettings.js mobileVerificationRequired) — off by default since
  // no SMS provider is configured yet. The OTP send/verify flow itself
  // (Components/Checkout/MobileVerification.js) is untouched and starts
  // gating checkout again the moment this is switched on, no code changes
  // needed then.
  const [mobileVerificationRequired, setMobileVerificationRequired] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      dispatch(openAuthModal({ view: "login", redirectTo: "/checkout" }));
    }
  }, [status, dispatch]);

  useEffect(() => {
    checkoutApi
      .getConfig()
      .then((res) => {
        if (res.data.action) setMobileVerificationRequired(Boolean(res.data.data.mobileVerificationRequired));
      })
      .catch(() => {
        // Fail closed on "required" here would block checkout entirely if
        // this call ever fails — leave the default (false) so a transient
        // error never blocks orders over a feature that's off by default anyway.
      })
      .finally(() => setConfigLoading(false));
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const { items: expandedItems, customMixes } = expandCartItems(items);
    checkoutApi
      .checkCodAvailability(expandedItems, customMixes)
      .then((res) => setCodPolicy(res.data.action ? res.data.data : { available: false, reason: null }))
      .catch(() => setCodPolicy({ available: false, reason: null }));
  }, [items]);

  const courierCodAvailable = pincodeVerified && pincodeResult?.codAvailable === true;
  const codOffered = pincodeVerified && courierCodAvailable && codPolicy?.available === true;
  const codDisabledReason = !pincodeVerified
    ? null
    : codPolicy && !codPolicy.available
      ? codPolicy.reason
      : !courierCodAvailable
        ? "Cash on Delivery isn't available via courier for this pincode"
        : null;

  // Never leave "Cash on Delivery" selected once it stops being offerable —
  // e.g. the customer changes to a pincode without courier COD support.
  useEffect(() => {
    if (!codOffered && paymentMethod === "cod") {
      setPaymentMethod("prepaid");
    }
  }, [codOffered, paymentMethod]);

  // If the cart subtotal changes after a coupon was applied (item added /
  // removed / quantity changed), the previously computed discount is stale —
  // drop it and ask the user to re-apply.
  useEffect(() => {
    if (appliedCoupon && couponSubtotalSnapshot !== null && couponSubtotalSnapshot !== subtotal) {
      setAppliedCoupon(null);
      toast("Your cart changed — please re-apply your coupon.");
    }
  }, [subtotal, appliedCoupon, couponSubtotalSnapshot]);

  const handlePaymentSuccess = async (response) => {
    setVerifyingPayment(true);
    try {
      const res = await checkoutApi.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      if (res.data.action) {
        // Only cleared on confirmed success — see openRazorpayModal for why
        // it's deliberately still intact if the customer gets this far and
        // then backs out.
        dispatch(clearCart());
        toast.success("Payment successful! Order confirmed.");
        router.push(`/account/orders/${res.data.data.id}`);
      } else {
        toast.error(res.data.message || "Payment verification failed. Please contact support with your payment ID.");
        setPlacingOrder(false);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Payment verification failed. If money was deducted, please contact support with your payment ID.",
      );
      setPlacingOrder(false);
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Razorpay's own hosted checkout widget — never a custom payment form, and
  // never swaps this page's own content away either: it's a modal overlay
  // on top of the checkout form, which stays exactly as the customer left
  // it underneath. That matters specifically for what happens if they close
  // it without paying — see ondismiss below.
  const openRazorpayModal = async ({ razorpayOrderId, razorpayKeyId, amount, orderNumber, orderId }) => {
    const loaded = await loadRazorpayScript();
    if (!loaded || typeof window === "undefined" || !window.Razorpay) {
      toast.error("Could not load the payment gateway. Please retry.");
      setPlacingOrder(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: razorpayKeyId,
      amount,
      currency: "INR",
      order_id: razorpayOrderId,
      name: "Sehat Potli",
      description: `Order ${orderNumber}`,
      prefill: { name: shipping.shippingName, contact: shipping.shippingPhone },
      theme: { color: "#2E4A3B" },
      handler: (response) => handlePaymentSuccess(response),
      modal: {
        // Fires when the customer closes Razorpay's window (X, Escape,
        // clicking outside) without completing payment. The order created
        // just before this modal opened was never actually paid for, so it
        // gets cancelled here the same way the customer's own "Cancel
        // Order" button would (restocks the items, no-ops the refund since
        // nothing was ever charged) — instead of lingering as an
        // unfulfillable "prepaid, unpaid" order that later breaks admin
        // label generation. The cart was never cleared for this path (see
        // handlePlaceOrder), so the customer lands right back on this same
        // filled-in checkout form, not a separate retry/pay-later screen.
        ondismiss: async () => {
          try {
            await orderApi.cancel(orderId, "Payment window closed before completing payment");
          } catch {
            // Best-effort — even if this fails (e.g. some other path
            // already cancelled it), the customer still lands back on a
            // normal, usable checkout page either way.
          }
          toast("Payment wasn't completed, so that order was cancelled. Feel free to try again.");
          setPlacingOrder(false);
        },
      },
    });

    rzp.on("payment.failed", () => toast.error("Payment failed. Please retry."));
    rzp.open();
  };

  if (status === "loading" || configLoading) return <Loader fullScreen />;

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--surface-alt) text-(--primary)">
          <FiLock size={24} />
        </span>
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
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--surface-alt) text-(--primary)">
          <FiShoppingBag size={24} />
        </span>
        <h1 className="font-heading text-2xl text-(--primary)">Your Cart is Empty</h1>
        <Button url="/products">Continue Shopping</Button>
      </div>
    );
  }

  if (mobileVerificationRequired && !authUser?.mobileVerified) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="font-heading text-3xl text-(--primary)">Checkout</h1>
        <div className="mt-8">
          <MobileVerification />
        </div>
      </div>
    );
  }

  const discountAmount = appliedCoupon?.discountAmount || 0;
  // Only meaningful once Step 1 passes — shippingCharge comes back from
  // checkoutApi.checkPincode() (see utils/shippingZones.js getShippingCharge
  // server-side). The order's actual total is recomputed authoritatively at
  // creation time from the same helper — this is a preview, not the charge.
  const shippingCharge = pincodeVerified ? pincodeResult?.shippingCharge || 0 : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCharge);
  const canPlaceOrder =
    pincodeVerified &&
    shipping.shippingName.trim() &&
    shipping.shippingPhone.trim() &&
    shipping.shippingAddress.trim() &&
    (paymentMethod !== "cod" || codOffered);

  const handleShippingChange = (field) => (event) => {
    setShipping((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleCheckPincode = async (event) => {
    event?.preventDefault?.();
    if (!PINCODE_REGEX.test(pincode) || pincodeChecking) return;

    setPincodeChecking(true);
    setPincodeResult(null);
    try {
      const res = await checkoutApi.checkPincode(pincode);
      setPincodeResult(res.data.action ? res.data.data : { serviceable: false, codAvailable: false, shippingCharge: 0 });
    } catch {
      setPincodeResult({ serviceable: false, codAvailable: false, shippingCharge: 0 });
    } finally {
      setPincodeChecking(false);
    }
  };

  // Re-locks Step 2 — the pincode field re-opens for editing and has to be
  // re-checked before name/phone/address become interactive again.
  const handleChangePincode = () => {
    setPincodeResult(null);
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
    // Guards the same condition the submit button's `disabled` already
    // reflects — belt-and-suspenders in case a stray Enter keypress ever
    // reaches this handler before the button itself would allow it.
    if (!canPlaceOrder || placingOrder) return;

    setPlacingOrder(true);
    try {
      const { items: expandedItems, customMixes } = expandCartItems(items);
      const payload = {
        ...shipping,
        shippingPincode: pincode,
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
        items: expandedItems,
        customMixes,
      };
      const res = await orderApi.create(payload);
      if (res.data.action) {
        const orderData = res.data.data;

        if (paymentMethod === "prepaid" && orderData.razorpay) {
          // Cart deliberately NOT cleared here — this order isn't paid for
          // yet. openRazorpayModal's handler clears it on confirmed
          // success; its ondismiss cancels this order and leaves the cart
          // (and placingOrder) exactly as they are so the customer is still
          // looking at a normal, usable checkout form either way.
          openRazorpayModal({
            ...orderData.razorpay,
            orderNumber: orderData.orderNumber,
            orderId: orderData.id,
          });
        } else {
          dispatch(clearCart());
          toast.success("Order placed successfully!");
          router.push(`/account/orders/${orderData.id}`);
          setPlacingOrder(false);
        }
      } else {
        toast.error(res.data.message || "Could not place order");
        setPlacingOrder(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not place order");
      setPlacingOrder(false);
    }
    // No top-level `finally` — the prepaid/Razorpay path intentionally
    // leaves placingOrder(true) (button stays disabled, no double-submit)
    // until openRazorpayModal's handler or ondismiss resolves it.
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="font-heading text-3xl text-(--primary)">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <h2 className="font-heading text-xl text-(--primary)">Shipping Details</h2>

            <div className="mt-4 rounded-xl border border-(--border-color) bg-(--surface-alt) p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--foreground)">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary) text-xs text-(--surface)">
                  1
                </span>
                <FiMapPin size={15} className="text-(--primary)" /> Verify Delivery
              </p>

              {pincodeVerified ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm text-(--success)">
                      <FiCheckCircle size={15} /> Delivery available to {pincode}
                      {pincodeResult.codAvailable ? " · COD available" : " · Prepaid only"}
                    </p>
                    {pincodeResult.estimatedDeliveryDays && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-(--secondary-text)">
                        <FiTruck size={14} />
                        Estimated delivery in{" "}
                        {pincodeResult.estimatedDeliveryDays.min === pincodeResult.estimatedDeliveryDays.max
                          ? `${pincodeResult.estimatedDeliveryDays.min} days`
                          : `${pincodeResult.estimatedDeliveryDays.min}-${pincodeResult.estimatedDeliveryDays.max} days`}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePincode}
                    className="flex items-center gap-1 text-sm font-medium text-(--primary) underline"
                  >
                    <FiEdit2 size={13} /> Change
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <FloatingLabelInput
                      id="checkout-pincode"
                      label="Delivery Pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value.replace(/\D/g, ""));
                        setPincodeResult(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCheckPincode(e);
                      }}
                      wrapperClassName="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleCheckPincode}
                      disabled={!PINCODE_REGEX.test(pincode) || pincodeChecking}
                      className="sm:w-auto"
                    >
                      {pincodeChecking ? "Checking..." : "Check"}
                    </Button>
                  </div>
                  {pincodeResult && !pincodeResult.serviceable && (
                    <p className="flex items-center gap-1.5 text-sm text-(--danger)">
                      <FiAlertCircle size={14} /> Sorry, we don&apos;t deliver to this pincode yet
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="my-5 border-t border-(--border-color)" />

            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-(--foreground)">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary) text-xs text-(--surface)">
                2
              </span>
              Your Details
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FloatingLabelInput
                id="shipping-name"
                required
                label="Full name"
                value={shipping.shippingName}
                onChange={handleShippingChange("shippingName")}
                disabled={!pincodeVerified}
                className={DISABLED_FIELD_CLASS}
              />
              <FloatingLabelInput
                id="shipping-phone"
                required
                type="tel"
                label="Phone number"
                pattern="[0-9]{10}"
                value={shipping.shippingPhone}
                onChange={handleShippingChange("shippingPhone")}
                disabled={!pincodeVerified}
                className={DISABLED_FIELD_CLASS}
              />
              <FloatingLabelInput
                id="shipping-alternate-mobile"
                type="tel"
                label="Alternate mobile number (optional)"
                pattern="[0-9]{10}"
                title="Enter a 10-digit mobile number"
                value={shipping.alternateMobile}
                onChange={handleShippingChange("alternateMobile")}
                disabled={!pincodeVerified}
                className={DISABLED_FIELD_CLASS}
              />
              <FloatingLabelInput
                id="shipping-address"
                required
                label="Address"
                value={shipping.shippingAddress}
                onChange={handleShippingChange("shippingAddress")}
                disabled={!pincodeVerified}
                className={DISABLED_FIELD_CLASS}
                wrapperClassName="sm:col-span-2"
              />
            </div>

            <p className="mb-3 mt-5 text-sm font-semibold text-(--foreground)">Payment Method</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors ${
                  paymentMethod === "cod" ? "border-(--primary) bg-(--surface-alt)" : "border-(--border-color)"
                } ${!pincodeVerified || !codOffered ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-(--foreground)">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    disabled={!pincodeVerified || !codOffered}
                    className="h-4 w-4 accent-(--primary)"
                  />
                  <FiTruck size={16} className="text-(--primary)" />
                  Cash on Delivery
                </span>
                {pincodeVerified && codDisabledReason && (
                  <span className="text-xs text-(--danger)">{codDisabledReason}</span>
                )}
              </label>

              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                  paymentMethod === "prepaid" ? "border-(--primary) bg-(--surface-alt)" : "border-(--border-color)"
                } ${!pincodeVerified ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="prepaid"
                  checked={paymentMethod === "prepaid"}
                  onChange={() => setPaymentMethod("prepaid")}
                  disabled={!pincodeVerified}
                  className="h-4 w-4 accent-(--primary)"
                />
                <FiCreditCard size={16} className="text-(--primary)" />
                <span className="text-sm font-medium text-(--foreground)">Pay Online</span>
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="font-heading text-xl text-(--primary)">Have a Coupon?</h2>
            <div className="mt-4 flex gap-3">
              <FloatingLabelInput
                id="coupon-code"
                label="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={Boolean(appliedCoupon)}
                className="uppercase disabled:opacity-60"
                wrapperClassName="flex-1"
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
          </Card>
        </div>

        <Card className="h-fit">
          <h2 className="font-heading text-xl text-(--primary)">Order Summary</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-(--secondary-text)">
            {items.map((item) => {
              if (item.type === "combo") {
                return (
                  <li key={`combo-${item.comboOfferId}`} className="flex justify-between">
                    <span>
                      {item.title} (Combo) &times; {item.quantity}
                    </span>
                    <span className="text-(--foreground)">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                );
              }
              if (item.type === "mix") {
                return (
                  <li key={`mix-${item.mixId}`} className="flex justify-between">
                    <span>
                      {item.name || "Custom Mix"} ({item.totalWeightGrams}g) &times; {item.quantity}
                    </span>
                    <span className="text-(--foreground)">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                );
              }
              return (
                <li key={`${item.productId}-${item.variantId}`} className="flex justify-between">
                  <span>
                    {item.name} ({item.weight}) &times; {item.quantity}
                  </span>
                  <span className="text-(--foreground)">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              );
            })}
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
            <div className="flex justify-between text-(--secondary-text)">
              <span>Shipping</span>
              <span className="text-(--foreground)">
                {pincodeVerified ? formatPrice(shippingCharge) : "Calculated after Step 1"}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold text-(--foreground)">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={!canPlaceOrder || placingOrder}>
            {placingOrder ? "Placing Order..." : "Place Order"}
          </Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-(--secondary-text)">
            <FiLock size={13} className="text-(--primary)" />
            Secure checkout &middot; Razorpay encrypted payments
          </p>
        </Card>
      </form>
    </div>
  );
}
