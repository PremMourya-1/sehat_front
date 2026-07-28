import { createSlice } from "@reduxjs/toolkit";

const initialState = { items: [] };

// A cart line is uniquely identified by the combination of product + the
// weight variant chosen (250g / 500g / 1kg), since each variant has its own
// price/stock.
const matchesLine = (item, productId, variantId) =>
  item.productId === productId && item.variantId === variantId;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const {
        productId,
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
