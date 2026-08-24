// Expands the mixed Redux cart (normal product lines + combo bundle lines,
// see Store/Slices/cartSlice.js addComboToCart) into the flat
// { productId, variantId, quantity, comboOfferId? }[] shape both
// POST /api/orders and POST /api/checkout/cod-availability expect —
// combos are never sent as one opaque line, so stock/shipping/COD on the
// backend see real products either way (see
// sehat-potli-backend/controllers/orderController.js). A combo line's
// embedded `items` breakdown is per ONE bundle, so each sub-item's
// quantity is multiplied by the combo line's own `quantity` (bundle count).
export function expandCartItems(cartItems) {
  const expanded = [];
  for (const item of cartItems) {
    if (item.type === "combo") {
      for (const sub of item.items) {
        expanded.push({
          productId: sub.productId,
          variantId: sub.variantId,
          quantity: sub.comboQuantity * item.quantity,
          comboOfferId: item.comboOfferId,
        });
      }
    } else {
      expanded.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  }
  return expanded;
}
