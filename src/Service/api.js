import { apiJson, apiMultipart } from "@/Service/service";
import {
  authUrl,
  blogUrl,
  cartUrl,
  categoryUrl,
  checkoutUrl,
  cmsUrl,
  couponUrl,
  faqUrl,
  heroBannerUrl,
  homeUrl,
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

// Cart (server-persisted cart for logged-in customers)
export const cartApi = {
  get: () => apiJson.get(cartUrl.get),
  add: (data) => apiJson.post(cartUrl.add, data),
  update: (data) => apiJson.put(cartUrl.update, data),
  remove: (id) => apiJson.delete(cartUrl.remove(id)),
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

// Blog
export const blogApi = {
  list: () => apiJson.get(blogUrl.list),
  getById: (id) => apiJson.get(blogUrl.byId(id)),
};

// FAQs
export const faqApi = {
  list: () => apiJson.get(faqUrl.list),
};

// Newsletter
export const newsletterApi = {
  subscribe: (email) => apiJson.post(newsletterUrl.subscribe, { email }),
};

// Product reviews (order-number verified)
export const reviewApi = {
  list: (productId) => apiJson.get(reviewUrl.list(productId)),
  verify: (productId, orderNumber) => apiJson.post(reviewUrl.verify(productId), { orderNumber }),
  create: (productId, formData) => apiMultipart.post(reviewUrl.create(productId), formData),
};
