import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/Store/Slices/cartSlice";
import uiReducer from "@/Store/Slices/uiSlice";

// Factory (rather than a singleton) so every SSR request / client mount
// gets its own store instance — required for Next.js App Router safety.
// Auth state itself lives in NextAuth's session (useSession()), not Redux.
export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      ui: uiReducer,
    },
  });
