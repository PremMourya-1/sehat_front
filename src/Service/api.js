import { apiJson, apiMultipart } from "@/Service/service";
import {
  authUrl,
  blogUrl,
  cartRewardUrl,
  cartUrl,
  categoryUrl,
  checkoutUrl,
  cmsUrl,
  comboOfferUrl,
  couponUrl,
  faqUrl,
  heroBannerUrl,
  homeUrl,
  launchCountdownUrl,
  mixUrl,
  mobileUrl,
  newsletterUrl,
  orderUrl,
  productUrl,
  reviewUrl,
  securityUrl,
  testimonialUrl,
} from "@/Service/url";

// Checkout-time mobile number OTP verification (sign-in itself is handled
// by NextAuth — see src/auth.js / next-auth/react's signIn/signOut).
export const mobileApi = {
  sendOtp: (mobileNumber) => apiJson.post(mobileUrl.sendOtp, { mobileNumber }),
  verifyOtp: (mobileNumber, otp) => apiJson.post(mobileUrl.verifyOtp, { mobileNumber, otp }),
};

// Account Security — Change/Add password (see app/account/security/page.js).
// "Add" vs "Change" is the same endpoint; the backend decides which one
// applies based on whether the account already has a password.
export const securityApi = {
  getPasswordStatus: () => apiJson.get(securityUrl.passwordStatus),
  updatePassword: (data) => apiJson.put(securityUrl.updatePassword, data),
};

// Registration (name/email/password + 6-digit email OTP). Actual sign-in
// after verifying happens via next-auth/react's signIn("credentials", ...).
export const authApi = {
  register: (data) => apiJson.post(authUrl.register, data),
  verifyOtp: (data) => apiJson.post(authUrl.verifyOtp, data),
  resendOtp: (data) => apiJson.post(authUrl.resendOtp, data),
  // Forgot/reset password (logged-out flow — see Components/Auth/AuthModal.js).
  // Distinct from Change/Add Password on the account security page, which
  // requires being logged in already.
  forgotPassword: (data) => apiJson.post(authUrl.forgotPassword, data),
  resetPassword: (data) => apiJson.post(authUrl.resetPassword, data),
};

// Products
export const productApi = {
  list: (params) => apiJson.get(productUrl.list, { params }),
  search: (params) => apiJson.get(productUrl.search, { params }),
  featured: (params) => apiJson.get(productUrl.featured, { params }),
  browse: (params) => apiJson.get(productUrl.browse, { params }),
  getById: (id) => apiJson.get(productUrl.byId(id)),
};

// Categories
export const categoryApi = {
  list: () => apiJson.get(categoryUrl.list),
  getById: (id) => apiJson.get(categoryUrl.byId(id)),
};

// Combo offer detail page — the homepage list itself comes from homeApi.
export const comboOfferApi = {
  getById: (id) => apiJson.get(comboOfferUrl.byId(id)),
};

// Cart (server-persisted cart for logged-in customers) — see
// Store/StoreProvider.js for when/how these actually get called: `merge`
// once right after login (combines a guest's localStorage cart into
// whatever's already in their DB cart), `sync` on a debounce for every
// cart change made while already logged in. Guests never call any of
// this — their cart is localStorage-only, see cartSlice.js.
// merge/sync take the session's apiToken explicitly and set it as an
// Authorization header themselves, rather than trusting the shared axios
// instance's own interceptor (service.js, reads sessionBridge.js) to
// already have it — StoreProvider.js fires these from its own
// useSession()-driven effect, which can genuinely run before
// AuthSessionProvider's separate SessionBridgeSync effect has synced the
// bridge yet on the very same login transition. A stale/missing token
// there means a 401, and this axios instance's response interceptor
// hard-redirects to "/" on any 401 — worth avoiding explicitly.
function authHeader(apiToken) {
  return apiToken ? { headers: { Authorization: `Bearer ${apiToken}` } } : undefined;
}

export const cartApi = {
  get: () => apiJson.get(cartUrl.get),
  add: (data) => apiJson.post(cartUrl.add, data),
  merge: (items, apiToken) => apiJson.post(cartUrl.merge, { items }, authHeader(apiToken)),
  sync: (items, apiToken) => apiJson.put(cartUrl.sync, { items }, authHeader(apiToken)),
  update: (itemId, quantity) => apiJson.put(cartUrl.update(itemId), { quantity }),
  remove: (itemId) => apiJson.delete(cartUrl.remove(itemId)),
  clear: () => apiJson.delete(cartUrl.clear),
};

// Orders
export const orderApi = {
  create: (data) => apiJson.post(orderUrl.create, data),
  list: (params) => apiJson.get(orderUrl.list, { params }),
  recent: () => apiJson.get(orderUrl.recent),
  getById: (id) => apiJson.get(orderUrl.byId(id)),
  // Self-cancel — only works server-side while the order is still
  // "confirmed" (see controllers/orderController.js cancelOrder); reason is
  // optional.
  cancel: (id, reason) => apiJson.post(orderUrl.cancel(id), { reason }),
};

// Checkout (pincode serviceability + COD availability checks are public, no
// auth needed; verifyPayment requires the customer's auth token, attached
// automatically by apiJson's interceptor — see Service/service.js)
export const checkoutApi = {
  getConfig: () => apiJson.get(checkoutUrl.config),
  checkPincode: (pincode) => apiJson.get(checkoutUrl.checkPincode, { params: { pincode } }),
  checkCodAvailability: (items, customMixes) => apiJson.post(checkoutUrl.codAvailability, { items, customMixes }),
  verifyPayment: (data) => apiJson.post(checkoutUrl.verifyPayment, data),
};

// Coupons
export const couponApi = {
  apply: (data) => apiJson.post(couponUrl.apply, data),
};

// Hero banners
export const heroBannerApi = {
  list: () => apiJson.get(heroBannerUrl.list),
};

// Testimonials
export const testimonialApi = {
  list: () => apiJson.get(testimonialUrl.list),
};

// CMS
export const cmsApi = {
  getBySlug: (slug) => apiJson.get(cmsUrl.bySlug(slug)),
};

// Homepage (single aggregated call — hero, categories, products, and every
// admin-managed homepage section in one response)
export const homeApi = {
  get: () => apiJson.get(homeUrl.get),
};

// Build Your Own Mix — ingredient catalog + admin-configured weight
// increments/cap, in one call (see mixController.js)
export const mixApi = {
  getIngredients: () => apiJson.get(mixUrl.get),
};

// "Spend ₹X, get a free gift" tiers — powers the cart fill progress bar
// (see Components/Cart/CartRewardProgress.js). Public, no auth — the same
// tiers the server independently re-derives and auto-applies at checkout
// (see calculateSubtotal.js's calculateRewardLines), this call is display
// only.
export const cartRewardApi = {
  getTiers: () => apiJson.get(cartRewardUrl.get),
};

// Blog
export const blogApi = {
  list: () => apiJson.get(blogUrl.list),
  getById: (id) => apiJson.get(blogUrl.byId(id)),
};

// FAQs
export const faqApi = {
  list: () => apiJson.get(faqUrl.list),
};

// Pre-launch / sale hype countdown banner — admin-managed (see
// Components/Common/LaunchCountdownBanner.js), public + unauthenticated.
export const launchCountdownApi = {
  get: () => apiJson.get(launchCountdownUrl.get),
};

// Newsletter
export const newsletterApi = {
  subscribe: (email) => apiJson.post(newsletterUrl.subscribe, { email }),
};

// Product reviews — public listing (paginated, approved-only), creation
// requires a logged-in customer with a delivered order containing the
// product (see Components/Account/ReviewPrompt.js, used from the order
// detail page — not the product page anymore).
export const reviewApi = {
  list: (productId, params) => apiJson.get(reviewUrl.list(productId), { params }),
  create: (productId, formData) => apiMultipart.post(reviewUrl.create(productId), formData),
};
