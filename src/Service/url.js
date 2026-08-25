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

export const cartUrl = {
  get: "/cart",
  add: "/cart/add",
  update: "/cart/update",
  remove: (id) => `/cart/remove/${id}`,
  clear: "/cart/clear",
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

export const blogUrl = {
  list: "/blog-posts",
  byId: (id) => `/blog-posts/${id}`,
};

export const faqUrl = {
  list: "/faqs",
};

export const newsletterUrl = {
  subscribe: "/newsletter/subscribe",
};

export const reviewUrl = {
  list: (productId) => `/products/${productId}/reviews`,
  verify: (productId) => `/products/${productId}/reviews/verify`,
  create: (productId) => `/products/${productId}/reviews`,
};
