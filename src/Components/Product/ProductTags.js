// Renders the fixed set of product badge/tag chips. "Premium Quality" always
// gets the Deep Maroon/Wine accent color per brand spec; every other tag uses
// a neutral, primary-tinted style.
export default function ProductTags({ tags = [], size = "sm" }) {
  if (!Array.isArray(tags) || tags.length === 0) return null;

  const sizeClasses =
    size === "xs" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const isPremium = tag === "Premium Quality";
        return (
          <span
            key={tag}
            className={`rounded-full font-medium tracking-wide ${sizeClasses} ${
              isPremium
                ? "bg-(--accent-secondary) text-(--surface)"
                : "bg-(--surface-alt) text-(--primary) border border-(--border-color)"
            }`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}
