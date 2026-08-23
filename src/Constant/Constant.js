// Centralized constants used across the storefront.

export const CART_STORAGE_KEY = "SEHAT_POTLI_CART";

export const BRAND_NAME = "Sehat Potli";
export const BRAND_TAGLINE = "Sehat Ki Potli, Har Ghar Ki Zaroorat";
export const BRAND_TAGLINE_SHORT = "Pure. Natural. Wholesome.";

export const WEIGHT_OPTIONS = ["250g", "500g", "1kg"];

export const PRODUCT_TAGS = [
  "100% Natural",
  "Rich in Nutrition",
  "Premium Quality",
  "Healthy Lifestyle",
];

// Level-2 "Shop by Health Goal" tags (multi-select on Product.healthGoalTags)
export const HEALTH_GOALS = [
  { key: "protein", label: "Protein Rich" },
  { key: "heart", label: "Heart Health" },
  { key: "weight-management", label: "Weight Management" },
  { key: "brain", label: "Brain Health" },
  { key: "kids", label: "Kids Nutrition" },
  { key: "energy", label: "Daily Energy" },
];

// Level-3 "Shop by Occasion" tags (multi-select on Product.occasionTags)
export const OCCASION_TAGS = [
  { key: "daily", label: "Daily Use" },
  { key: "festival", label: "Festival Gifting" },
  { key: "corporate", label: "Corporate Gifting" },
  { key: "kids", label: "Kids Snack Box" },
];

// Product.type enum → display label
export const PRODUCT_TYPE_LABELS = {
  single: "Single",
  seeds: "Seeds",
  "seeds-mix": "Seeds Mix",
  "dryfruit-mix": "Mix",
  combo: "Combo",
  "gift-hamper": "Gift Hamper",
};

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Customer-facing status (Order.customerStatus) — separate from the
// internal/admin status above. confirmed/dispatched are set by order
// creation/label generation; picked_up/in_transit/out_for_delivery/
// delivered/rto are driven by Shiprocket's status webhook (see backend
// utils/shiprocket.js handleShiprocketStatusWebhook).
export const CUSTOMER_STATUS_LABELS = {
  confirmed: "Order Confirmed",
  dispatched: "Dispatched",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  rto: "Returned to Origin",
  cancelled: "Cancelled",
};

export const AUTH_VIEWS = {
  LOGIN: "login",
  REGISTER: "register",
};
