// Expands the mixed Redux cart (normal product lines, combo bundle lines,
// and Build Your Own Mix lines — see Store/Slices/cartSlice.js) into the
// two shapes POST /api/orders and POST /api/checkout/cod-availability
// expect: a flat `items` array ({ productId, variantId, quantity,
// comboOfferId? }) and a separate `customMixes` array. Combos are never
// sent as one opaque line, so stock/shipping/COD on the backend see real
// products either way (see sehat-potli-backend/controllers/orderController.js).
//
// A combo line's embedded `items` breakdown is per ONE bundle, so each
// sub-item's quantity is multiplied by the combo line's own `quantity`
// (bundle count) — one flat entry covers every instance, since
// calculateSubtotal.js's combo validation already accepts any whole-number
// multiple of the combo's defined per-item quantity.
//
// A mix line's `quantity` (bundle/instance count) has no such multiplier on
// the backend — utils/calculateMixPricing.js prices exactly one composition
// per submitted mix object — so N instances of the same mix become N
// separate (identical) entries in `customMixes` instead.
export function expandCartItems(cartItems) {
  const items = [];
  const customMixes = [];

  for (const item of cartItems) {
    if (item.type === "combo") {
      for (const sub of item.items) {
        items.push({
          productId: sub.productId,
          variantId: sub.variantId,
          quantity: sub.comboQuantity * item.quantity,
          comboOfferId: item.comboOfferId,
        });
      }
    } else if (item.type === "mix") {
      const mixPayload = {
        name: item.name || undefined,
        items: item.items.map((ingredient) => ({
          productId: ingredient.productId,
          grams: ingredient.grams,
        })),
      };
      for (let i = 0; i < item.quantity; i++) {
        customMixes.push(mixPayload);
      }
    } else {
      items.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  }

  return { items, customMixes };
}
