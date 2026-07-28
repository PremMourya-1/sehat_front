import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/Store/Slices/authSlice";
import cartReducer from "@/Store/Slices/cartSlice";
import uiReducer from "@/Store/Slices/uiSlice";

// Factory (rather than a singleton) so every SSR request / client mount
// gets its own store instance — required for Next.js App Router safety.
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      ui: uiReducer,
    },
  });
