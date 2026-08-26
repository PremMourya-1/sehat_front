import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/Store/Slices/cartSlice";
import uiReducer from "@/Store/Slices/uiSlice";
import wishlistReducer from "@/Store/Slices/wishlistSlice";

// Factory (rather than a singleton) so every SSR request / client mount
// gets its own store instance — required for Next.js App Router safety.
// Auth state itself lives in NextAuth's session (useSession()), not Redux.
// cart/wishlist are rehydrated from and persisted to localStorage by
// StoreProvider.js — neither has a server-side table backing it.
export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      ui: uiReducer,
      wishlist: wishlistReducer,
    },
  });
