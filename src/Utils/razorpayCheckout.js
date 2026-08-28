import { loadRazorpayScript } from "@/Utils/loadRazorpayScript";

// Opens Razorpay's hosted checkout for an ALREADY-CREATED order — used both
// right after order creation (see app/checkout/page.js) and as a later
// retry for an order still sitting at customerStatus "payment_pending"
// (see app/account/orders/[id]/page.js's "Complete Payment" button). One
// place builds the Razorpay options object and wires the callbacks, so
// both entry points stay in sync.
export async function openRazorpayCheckout({
  razorpayOrderId,
  razorpayKeyId,
  amount,
  orderNumber,
  customerName,
  customerPhone,
  onSuccess,
  onDismiss,
  onLoadFailure,
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded || typeof window === "undefined" || !window.Razorpay) {
    onLoadFailure?.();
    return;
  }

  const rzp = new window.Razorpay({
    key: razorpayKeyId,
    amount,
    currency: "INR",
    order_id: razorpayOrderId,
    name: "Sehat Potli",
    description: `Order ${orderNumber}`,
    prefill: { name: customerName, contact: customerPhone },
    theme: { color: "#2E4A3B" },
    handler: onSuccess,
    modal: { ondismiss: onDismiss },
  });

  // Razorpay's own modal already shows an inline failure message — nothing
  // else to do here. The order simply stays "payment_pending", retryable
  // again from wherever this was opened.
  rzp.on("payment.failed", () => {});
  rzp.open();
}
