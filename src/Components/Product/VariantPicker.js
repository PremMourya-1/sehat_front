// Pill-button weight selector (250g / 500g / 1kg). Purely presentational —
// the parent owns which variant is selected.
//
// `wrap` controls what happens when the pills don't all fit: `true` (the
// product detail page, which has plenty of width) lets them wrap to a
// second line; `false` (product cards, which are narrow — see ProductCard)
// keeps them on one line and lets that line scroll horizontally instead,
// since a 2-line pill block inside an already-tight card looks broken far
// more often than a rare 4th/5th variant needing a nudge-scroll.
export default function VariantPicker({ variants = [], selectedId, onSelect, size = "md", wrap = true }) {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  const sizeClasses =
    size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <div className={wrap ? "flex flex-wrap gap-2" : "flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide"}>
      {variants.map((variant) => {
        const isSelected = variant.id === selectedId;
        const outOfStock = Number(variant.stock) <= 0;
        return (
          <button
            key={variant.id}
            type="button"
            disabled={outOfStock}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect?.(variant);
            }}
            className={`rounded-full border font-medium transition-colors ${sizeClasses} ${
              outOfStock
                ? "cursor-not-allowed border-(--border-color) text-(--muted) line-through"
                : isSelected
                  ? "border-(--btn-primary) bg-(--btn-primary) text-(--surface)"
                  : "border-(--border-color) text-(--foreground) hover:border-(--btn-primary)"
            }`}
          >
            {variant.weight}
          </button>
        );
      })}
    </div>
  );
}
