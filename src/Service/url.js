// Flat objects of endpoint path segments, grouped by resource. These map
// 1:1 onto the public routes exposed by sehat-potli-backend.

export const mobileUrl = {
  sendOtp: "/customer/mobile/send-otp",
  verifyOtp: "/customer/mobile/verify-otp",
};

export const securityUrl = {
  passwordStatus: "/customer/security/password-status",
  updatePassword: "/customer/security/password",
};

// Registration (name/email/password + email OTP). Sign-in itself goes
// through NextAuth's "credentials" provider — see next-auth/react's
// signIn()/signOut(), not these.
export const authUrl = {
  register: "/auth/register",
  verifyOtp: "/auth/register/verify-otp",
  resendOtp: "/auth/register/resend-otp",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
};

export const productUrl = {
  list: "/products",
  search: "/products/search",
  featured: "/products/featured",
  browse: "/products/browse",
  byId: (id) => `/products/${id}`,
};

export const categoryUrl = {
  list: "/categories",
  byId: (id) => `/categories/${id}`,
};

// Combo offer detail page (see app/combo-offers/[id]/page.js) — the
// homepage list itself comes bundled in homeUrl's /home response, this is
// just the single-combo lookup for the click-through detail page.
export const comboOfferUrl = {
  byId: (id) => `/combo-offers/${id}`,
};

// Matches the real backend routes in routes/cartRoutes.js exactly (this
// object previously had guessed paths — /cart/add, /cart/update,
// /cart/remove/:id — that never matched anything live; nothing called
// cartApi at all until the login-merge/logged-in-sync feature wired it up).
export const cartUrl = {
  get: "/cart",
  add: "/cart",
  merge: "/cart/merge",
  sync: "/cart/sync",
  update: (itemId) => `/cart/${itemId}`,
  remove: (itemId) => `/cart/${itemId}`,
  clear: "/cart",
};

export const orderUrl = {
  create: "/orders",
  list: "/orders",
  recent: "/orders/recent",
  byId: (id) => `/orders/${id}`,
  cancel: (id) => `/orders/${id}/cancel`,
};

export const checkoutUrl = {
  config: "/checkout/config",
  checkPincode: "/checkout/check-pincode",
  codAvailability: "/checkout/cod-availability",
  verifyPayment: "/checkout/verify-payment",
};

export const couponUrl = {
  apply: "/coupons/apply",
};

export const heroBannerUrl = {
  list: "/hero-banners",
};

export const testimonialUrl = {
  list: "/testimonials",
};

export const cmsUrl = {
  bySlug: (slug) => `/cms/${slug}`,
};

export const homeUrl = {
  get: "/home",
};

export const mixUrl = {
  get: "/mix-ingredients",
};

export const cartRewardUrl = {
  get: "/cart-reward-tiers",
};

export const blogUrl = {
  list: "/blog-posts",
  byId: (id) => `/blog-posts/${id}`,
};

export const faqUrl = {
  list: "/faqs",
};

export const launchCountdownUrl = {
  get: "/web-settings/launch-countdown",
};

export const newsletterUrl = {
  subscribe: "/newsletter/subscribe",
};

export const reviewUrl = {
  list: (productId) => `/products/${productId}/reviews`,
  create: (productId) => `/products/${productId}/reviews`,
};
