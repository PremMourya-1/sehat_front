// Flat objects of endpoint path segments, grouped by resource. These map
// 1:1 onto the public routes exposed by sehat-potli-backend.

export const authUrl = {
  register: "/auth/register",
  verifyOtp: "/auth/verify-otp",
  resendOtp: "/auth/resend-otp",
  login: "/auth/login",
  logout: "/auth/logout",
  profile: "/auth/profile",
  changePassword: "/auth/change-password",
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
