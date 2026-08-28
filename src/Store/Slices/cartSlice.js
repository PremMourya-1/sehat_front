import { createSlice } from "@reduxjs/toolkit";

const initialState = { items: [] };

// A cart line is uniquely identified by the combination of product + the
// weight variant chosen (250g / 500g / 1kg), since each variant has its own
// price/stock. Combo lines (see addComboToCart below) never carry a
// top-level productId/variantId, so they never collide with this.
const matchesLine = (item, productId, variantId) =>
  item.productId === productId && item.variantId === variantId;

const matchesCombo = (item, comboOfferId) =>
  item.type === "combo" && item.comboOfferId === comboOfferId;

const matchesMix = (item, mixId) => item.type === "mix" && item.mixId === mixId;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const {
        productId,
        slug,
        variantId,
        weight,
        price,
        mrp,
        name,
        image,
        stock,
        quantity,
      } = action.payload;

      const existing = state.items.find((item) =>
        matchesLine(item, productId, variantId),
      );

      if (existing) {
        existing.quantity += quantity || 1;
      } else {
        state.items.push({
          productId,
          slug: slug || null,
          variantId,
          weight,
          price,
          mrp,
          name,
          image,
          stock,
          quantity: quantity || 1,
        });
      }
    },
    updateQuantity(state, action) {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find((item) =>
        matchesLine(item, productId, variantId),
      );
      if (item) item.quantity = Math.max(1, quantity);
    },
    removeFromCart(state, action) {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        (item) => !matchesLine(item, productId, variantId),
      );
    },
    // A combo is cart as ONE bundle-quantity line (not N separately
    // editable product lines) — `items` is the fixed per-bundle product
    // breakdown (not multiplied by `quantity`); see
    // Utils/cartExpansion.js for where that gets expanded into real
    // productId/variantId/quantity lines at checkout time. `price` is the
    // combo's total comboPrice, so selectCartSubtotal below needs no
    // combo-specific branch — quantity * price already means
    // instanceCount * comboPrice.
    addComboToCart(state, action) {
      const { comboOfferId, title, image, discountLabel, price, items, quantity } = action.payload;
      const existing = state.items.find((item) => matchesCombo(item, comboOfferId));
      if (existing) {
        existing.quantity += quantity || 1;
      } else {
        state.items.push({
          type: "combo",
          comboOfferId,
          title,
          image,
          discountLabel,
          price,
          items,
          quantity: quantity || 1,
        });
      }
    },
    updateComboQuantity(state, action) {
      const { comboOfferId, quantity } = action.payload;
      const item = state.items.find((item) => matchesCombo(item, comboOfferId));
      if (item) item.quantity = Math.max(1, quantity);
    },
    removeCombo(state, action) {
      const { comboOfferId } = action.payload;
      state.items = state.items.filter((item) => !matchesCombo(item, comboOfferId));
    },
    // A Build Your Own Mix instance, same "one bundle-quantity line" shape
    // as a combo — `items` is the fixed per-bundle ingredient breakdown
    // (grams, not multiplied by `quantity`), expanded at checkout time by
    // Utils/cartExpansion.js into the `customMixes` array
    // POST /api/orders expects. `mixId` is generated client-side (in the
    // builder page) purely so two separate mixes never merge into one
    // cart line just because they happen to share ingredients — unlike a
    // combo, a mix has no admin-authored id to key on instead.
    addMixToCart(state, action) {
      const { mixId, name, totalWeightGrams, price, items, quantity } = action.payload;
      const existing = state.items.find((item) => matchesMix(item, mixId));
      if (existing) {
        existing.quantity += quantity || 1;
      } else {
        state.items.push({
          type: "mix",
          mixId,
          name,
          totalWeightGrams,
          price,
          items,
          quantity: quantity || 1,
        });
      }
    },
    updateMixQuantity(state, action) {
      const { mixId, quantity } = action.payload;
      const item = state.items.find((item) => matchesMix(item, mixId));
      if (item) item.quantity = Math.max(1, quantity);
    },
    removeMix(state, action) {
      const { mixId } = action.payload;
      state.items = state.items.filter((item) => !matchesMix(item, mixId));
    },
    clearCart(state) {
      state.items = [];
    },
    setCartItems(state, action) {
      state.items = action.payload || [];
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  addComboToCart,
  updateComboQuantity,
  removeCombo,
  addMixToCart,
  updateMixQuantity,
  removeMix,
  clearCart,
  setCartItems,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.quantity * Number(item.price || 0),
    0,
  );

export default cartSlice.reducer;
