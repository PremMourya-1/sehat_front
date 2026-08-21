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

export const resolveImageUrl = (path) => {
  if (!path) return "/product-placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api"
  ).replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};
