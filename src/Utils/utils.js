// Small, framework-agnostic helper functions shared across components.

// Joins truthy class name fragments together (like classnames/clsx) —
// used by shared presentational components (Card, skeletons, ...).
export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const formatPrice = (value) => {
  const num = Number(value) || 0;
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Same as formatDate but with a time-of-day, for per-stage timestamps (e.g.
// order tracking stepper's statusHistory) where the date alone doesn't
// distinguish same-day transitions.
export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getDiscountPercent = (mrp, price) => {
  const mrpNum = Number(mrp) || 0;
  const priceNum = Number(price) || 0;
  if (!mrpNum || mrpNum <= priceNum) return 0;
  return Math.round(((mrpNum - priceNum) / mrpNum) * 100);
};

// Returns the "default" variant to preselect for a product: the first
// in-stock variant (by sortOrder), falling back to the first variant.
export const getDefaultVariant = (variants = []) => {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const sorted = [...variants].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  return sorted.find((variant) => Number(variant.stock) > 0) || sorted[0];
};

export const sortVariants = (variants = []) =>
  [...variants].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

// The single place every product-detail link is built from — slug if the
// product has one (set on create/edit, see backend utils/generateSlug.js),
// else its id. A product saved before this feature existed (slug: null)
// keeps resolving to its current UUID URL exactly as before; nothing
// breaks, nothing needs a backfill. Accepts either a full product object
// or a plain {slug, id}/{slug, productId} shape (cart lines don't carry a
// full product object, just these two fields — see cartSlice.js).
export const getProductUrl = (product) => {
  if (!product) return "/products";
  const identifier = product.slug || product.id || product.productId;
  return `/products/${identifier}`;
};

export const resolveImageUrl = (path) => {
  if (!path) return "/product-placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"
  ).replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
