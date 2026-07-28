// Deterministic per-product supplemental content for the Product Detail page
// (shelf life, storage, serving suggestion) — real products don't carry
// these fields in the backend yet, so we derive a stable pick from the id.
const SHELF_LIFE_PROFILES = [
  {
    shelfLife: "9 months from packaging",
    storage:
      "Store in a cool, dry place in an airtight container, away from direct sunlight.",
    servingSuggestion:
      "A handful (25–30g) daily as a snack, or add to salads, oats & smoothie bowls.",
  },
  {
    shelfLife: "6 months from packaging",
    storage:
      "Refrigerate after opening for extended freshness. Keep away from moisture.",
    servingSuggestion:
      "Sprinkle over yogurt, cereal, or blend into your morning smoothie.",
  },
  {
    shelfLife: "12 months from packaging",
    storage:
      "Store in the original resealable pouch/jar in a cool, dry pantry.",
    servingSuggestion:
      "Perfect for gifting, festive snacking, or an evening tea-time bowl.",
  },
];

export function getProductMeta(product) {
  if (!product) return SHELF_LIFE_PROFILES[0];
  const key = String(product.id || "").length;
  return SHELF_LIFE_PROFILES[key % SHELF_LIFE_PROFILES.length];
}
