// Shared between the homepage "Combo & Bundle Offers" card
// (Components/Product/ComboOffers.js) and the combo detail page's Add to
// Cart button (Components/Product/ComboOfferAddToCart.js) so the exact
// shape handed to Store/Slices/cartSlice.js's addComboToCart can't drift
// between the two entry points.
export function buildComboCartPayload(offer) {
  const items = (offer.items || []).map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    comboQuantity: item.quantity,
    name: item.Product?.name,
    image: item.Product?.image,
    weight: item.variant?.weight,
  }));

  return {
    comboOfferId: offer.id,
    title: offer.title,
    image: offer.items?.[0]?.Product?.image,
    discountLabel: offer.discountLabel,
    price: Number(offer.comboPrice),
    items,
    quantity: 1,
  };
}
