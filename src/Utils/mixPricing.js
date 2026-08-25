// Client-side mirror of sehat-potli-backend's
// utils/calculateMixPricing.js pickReferenceVariant — used only to show a
// live running price while the customer builds their mix. The backend
// recomputes and validates this from scratch at order time (see
// controllers/orderController.js), so a mismatch here can never
// under/overcharge — at worst the preview total looks briefly stale.
function parseWeightToGrams(weightLabel) {
  const match = /^(\d+(?:\.\d+)?)\s*(kg|g)$/i.exec(String(weightLabel || "").trim());
  if (!match) return 0;
  return match[2].toLowerCase() === "kg" ? Number(match[1]) * 1000 : Number(match[1]);
}

export function getReferenceVariant(ingredient) {
  const withGrams = (ingredient.variants || [])
    .map((v) => ({ variant: v, grams: parseWeightToGrams(v.weight) }))
    .filter((v) => v.grams > 0);
  if (withGrams.length === 0) return null;
  withGrams.sort((a, b) => a.grams - b.grams);
  return withGrams[0];
}

export function getPerGramRate(ingredient) {
  const reference = getReferenceVariant(ingredient);
  if (!reference) return 0;
  return Number(reference.variant.price) / reference.grams;
}

export function isIngredientAvailable(ingredient) {
  const reference = getReferenceVariant(ingredient);
  return !!reference && Number(reference.variant.stock) > 0;
}
