// Pill-button weight selector (250g / 500g / 1kg). Purely presentational —
// the parent owns which variant is selected.
export default function VariantPicker({ variants = [], selectedId, onSelect, size = "md" }) {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  const sizeClasses =
    size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <div className="flex flex-wrap gap-2">
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
