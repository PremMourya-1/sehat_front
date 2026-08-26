"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/Store/store";
import { setCartItems } from "@/Store/Slices/cartSlice";
import { setWishlistIds } from "@/Store/Slices/wishlistSlice";
import { getLocalStorageItem, setLocalStorageItem } from "@/Utils/localStorage";

const CART_STORAGE_KEY = "sehatpotli_cart_items";
const WISHLIST_STORAGE_KEY = "sehatpotli_wishlist_ids";

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // Cart and wishlist have no server-side table — they live only in this
  // browser's localStorage. Rehydration happens in an effect (client-only,
  // after the first render) rather than as the slice's initial state,
  // since reading localStorage during the render Next.js has to match
  // against server-rendered HTML would cause a hydration mismatch (the
  // server never has access to localStorage, so it always "sees" an empty
  // cart). This is also what fixes the bug where a guest's cart emptied
  // out after logging in — that had nothing to do with auth, the cart was
  // never persisted anywhere before, so any full reload lost it.
  useEffect(() => {
    const store = storeRef.current;

    const savedCart = getLocalStorageItem(CART_STORAGE_KEY);
    if (Array.isArray(savedCart) && savedCart.length > 0) {
      store.dispatch(setCartItems(savedCart));
    }
    const savedWishlist = getLocalStorageItem(WISHLIST_STORAGE_KEY);
    if (Array.isArray(savedWishlist) && savedWishlist.length > 0) {
      store.dispatch(setWishlistIds(savedWishlist));
    }

    // Keep localStorage in sync with every subsequent cart/wishlist
    // change — add/remove/quantity-update, toggling a heart, all of it.
    let prevCartItems = store.getState().cart.items;
    let prevWishlistIds = store.getState().wishlist.ids;
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.cart.items !== prevCartItems) {
        prevCartItems = state.cart.items;
        setLocalStorageItem(CART_STORAGE_KEY, prevCartItems);
      }
      if (state.wishlist.ids !== prevWishlistIds) {
        prevWishlistIds = state.wishlist.ids;
        setLocalStorageItem(WISHLIST_STORAGE_KEY, prevWishlistIds);
      }
    });

    return unsubscribe;
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
