import { createSlice } from "@reduxjs/toolkit";

const initialState = { ids: [] };

// Just a list of productIds — there's no server-side wishlist table, this
// (like the cart, see cartSlice.js) lives only in the browser via
// StoreProvider's localStorage rehydrate/persist, so it survives reloads
// and login without ever touching the database.
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const productId = action.payload;
      const index = state.ids.indexOf(productId);
      if (index >= 0) state.ids.splice(index, 1);
      else state.ids.push(productId);
    },
    setWishlistIds(state, action) {
      state.ids = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const { toggleWishlist, setWishlistIds } = wishlistSlice.actions;

export const selectWishlistIds = (state) => state.wishlist.ids;
export const selectIsWishlisted = (productId) => (state) => state.wishlist.ids.includes(productId);

export default wishlistSlice.reducer;
