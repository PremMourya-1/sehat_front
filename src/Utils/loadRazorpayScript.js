// Razorpay's checkout is their own hosted widget, not a custom payment
// form — this just loads their script once (idempotent: skips re-injecting
// if window.Razorpay already exists, e.g. from a previous retry on the
// same page) so `new window.Razorpay(options)` is available.
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
