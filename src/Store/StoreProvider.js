"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";
import { makeStore } from "@/Store/store";
import { setCartItems } from "@/Store/Slices/cartSlice";
import { setWishlistIds } from "@/Store/Slices/wishlistSlice";
import { cartApi } from "@/Service/api";
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from "@/Utils/localStorage";

const CART_STORAGE_KEY = "sehatpotli_cart_items";
const WISHLIST_STORAGE_KEY = "sehatpotli_wishlist_ids";
const CART_SYNC_DEBOUNCE_MS = 800;

// Backend CartItem (DB row + its Product/variant include, see
// cartController.js's cartItemIncludes) -> the flat, price/name-embedded
// shape cartSlice's items already use everywhere in the UI, so nothing
// downstream (cart page, CartFillProgress, header count, ...) needs to
// know or care whether a given render came from localStorage or the DB.
function mapDbItemsToReduxItems(dbItems) {
  return (dbItems || [])
    .filter((item) => item.variant && item.Product)
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      weight: item.variant.weight,
      price: Number(item.variant.price || 0),
      mrp: Number(item.variant.mrp || 0),
      name: item.Product.name,
      image: item.Product.image,
      stock: item.variant.stock,
      quantity: item.quantity,
    }));
}

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  const { status, data: session } = useSession();
  const apiToken = session?.apiToken;

  // Read from the subscribe callback below (a stable closure set up once
  // in the mount effect) — a plain useSession() read wouldn't be visible
  // there without re-subscribing on every session change.
  const authRef = useRef({ authenticated: false, apiToken: null, ready: false });
  authRef.current.authenticated = status === "authenticated";
  authRef.current.apiToken = apiToken || null;

  const hasMergedRef = useRef(false);
  const syncTimeoutRef = useRef(null);

  // Cart and wishlist have no server-side table for a GUEST — they live
  // only in this browser's localStorage. Rehydration happens in an effect
  // (client-only, after the first render) rather than as the slice's
  // initial state, since reading localStorage during the render Next.js
  // has to match against server-rendered HTML would cause a hydration
  // mismatch (the server never has access to localStorage, so it always
  // "sees" an empty cart).
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

    // Keep localStorage/DB in sync with every subsequent cart/wishlist
    // change — add/remove/quantity-update, toggling a heart, all of it.
    // Wishlist is always localStorage, logged in or not (no DB table for
    // it at all). Cart is localStorage ONLY while logged out; once
    // authenticated (and the login-merge effect below has finished),
    // changes instead debounce-push the customer's full current cart to
    // the DB via cartApi.sync — see that effect for why a full replace
    // rather than tracking individual DB row ids from here.
    let prevCartItems = store.getState().cart.items;
    let prevWishlistIds = store.getState().wishlist.ids;
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.cart.items !== prevCartItems) {
        prevCartItems = state.cart.items;
        const auth = authRef.current;
        if (auth.authenticated) {
          if (!auth.ready) return; // login-merge hasn't finished yet — don't race it
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = setTimeout(() => {
            // Combo/mix bundle lines have no DB representation (CartItem
            // is just productId/variantId/quantity) — only plain product
            // lines sync; bundles stay client-side, same as a guest cart.
            const plainItems = prevCartItems
              .filter((item) => !item.type)
              .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
            cartApi.sync(plainItems, auth.apiToken).catch(() => {});
          }, CART_SYNC_DEBOUNCE_MS);
        } else {
          setLocalStorageItem(CART_STORAGE_KEY, prevCartItems);
        }
      }
      if (state.wishlist.ids !== prevWishlistIds) {
        prevWishlistIds = state.wishlist.ids;
        setLocalStorageItem(WISHLIST_STORAGE_KEY, prevWishlistIds);
      }
    });

    return unsubscribe;
  }, []);

  // Fires once per genuine login transition (guarded by hasMergedRef, and
  // reset the moment auth drops again so a future login re-triggers it).
  // Combines whatever's sitting in the guest's localStorage cart into
  // their DB cart — sums quantities on any overlapping variant rather
  // than taking the max, matching addToCart's own existing
  // increment-on-repeat-add behavior (see cartController.js): the normal
  // case here is the same item independently added on two separate
  // sessions/devices, and a customer expects both adds to count. Also
  // covers the plain "already logged in, load my cart" case for free —
  // an empty local cart just means merge is a no-op fetch of what's
  // already in the DB.
  useEffect(() => {
    if (status !== "authenticated" || !apiToken) {
      hasMergedRef.current = false;
      authRef.current.ready = false;
      return;
    }
    if (hasMergedRef.current) return;
    hasMergedRef.current = true;

    const store = storeRef.current;
    const currentItems = store.getState().cart.items || [];
    const bundleItems = currentItems.filter((item) => item.type);
    const plainItems = currentItems
      .filter((item) => !item.type)
      .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));

    cartApi
      .merge(plainItems, apiToken)
      .then((res) => {
        if (res.data.action) {
          const merged = mapDbItemsToReduxItems(res.data.data?.items);
          store.dispatch(setCartItems([...merged, ...bundleItems]));
          // It's now represented in the DB — leaving it behind would just
          // be stale duplicate data that could confuse a later logout.
          removeLocalStorageItem(CART_STORAGE_KEY);
        }
      })
      .catch(() => {})
      .finally(() => {
        authRef.current.ready = true;
      });
  }, [status, apiToken]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
