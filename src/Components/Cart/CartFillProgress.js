"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { FiGift, FiX } from "react-icons/fi";
import {
  removeCombo,
  removeFromCart,
  removeMix,
  selectCartItems,
  selectCartSubtotal,
} from "@/Store/Slices/cartSlice";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import Button from "@/Components/Button/Button";
import useScrollVisibility from "@/Hooks/useScrollVisibility";
import { cartRewardApi } from "@/Service/api";
import { formatPrice, resolveImageUrl } from "@/Utils/utils";

// Matches MobileBottomNav's own HIDE_AFTER_PX so both hide/reveal on
// exactly the same scroll event, staying visually in sync.
const NAV_HIDE_AFTER_PX = 200;

// The global floating widget follows the shopper everywhere except pages
// that already show their own richer version (the Cart page embeds
// <CartFillProgress variant="inline" />) or have no cart context at all.
const SUPPRESSED_ON = ["/cart", "/checkout", "/build-your-own-mix"];

// Shared glass look — same frosted-pill language as MobileBottomNav, so the
// achievement box reads as part of the same UI family as the bottom bar.
const GLASS_CLASSES = "border border-(--border-color) bg-(--surface)/75 backdrop-blur-lg";

const CONFETTI_COLORS = [
  "var(--primary)",
  "var(--accent-secondary)",
  "#FFD166",
  "#EF476F",
  "#06D6A0",
];

// Human-readable description of a tier's gift — "250g Almonds", "2 × 500g
// Cashews" — falling back to the admin's own label, then a generic phrase.
// Shared between the "add ₹X more to unlock..." hint and the achievement
// banner so both always describe the exact same thing.
function describeGift(tier) {
  if (!tier) return "a free gift";
  const qty = tier.giftQuantity > 1 ? `${tier.giftQuantity} × ` : "";
  const weight = tier.giftVariant?.weight ? `${tier.giftVariant.weight} ` : "";
  const name = tier.giftProduct?.name;
  if (name) return `${qty}${weight}${name}`;
  return tier.label || "a free gift";
}

// Randomized per-piece trajectories, generated once per burst outside of
// render (see the effect in CartFillProgress that produces `burst`) rather
// than via Math.random() during render itself. `left` is a fixed viewport
// percentage (set once via style, not animated) — only `y`/`x`/`rotate`
// animate, and all three are transform properties, never top/left, so the
// browser never has to reflow for a full-screen piece count.
function generateConfettiPieces() {
  return Array.from({ length: 70 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    size: 6 + Math.random() * 6,
    drift: (Math.random() - 0.5) * 140,
    rotate: 360 + Math.random() * 360,
    duration: 1.8 + Math.random() * 1.4,
    delay: Math.random() * 0.5,
  }));
}

// Whole-screen party-popper burst — confetti rains from the top edge of
// the viewport across its full width, not just the small progress widget.
// Rendered via a portal straight onto document.body so it's never clipped
// by an ancestor's overflow-hidden (the widget cards themselves are
// rounded-corner boxes that would otherwise crop it to their own bounds).
// Built from plain Framer Motion spans rather than a confetti dependency,
// to match this component's only-dependency-already-installed constraint.
function FullScreenConfetti({ pieces }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-100 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: "-10vh", x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", x: [0, p.drift, -p.drift * 0.5, p.drift * 0.3], opacity: [1, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          className="absolute top-0 rounded-xs"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.4, backgroundColor: p.color }}
        />
      ))}
    </div>,
    document.body,
  );
}

// Left-to-right avatar row of everything already in the cart — each one
// carries its own small remove badge so a customer can drop an item right
// from the progress widget instead of having to open the cart page first.
function AvatarStack({ items, onRemove }) {
  const avatars = useMemo(() => {
    const list = [];
    for (const item of items) {
      if (item.type === "combo") {
        list.push({
          key: `combo-${item.comboOfferId}`,
          image: item.image,
          name: item.title,
          remove: () => onRemove({ comboOfferId: item.comboOfferId }, "combo"),
        });
      } else if (item.type === "mix") {
        list.push({
          key: `mix-${item.mixId}`,
          image: item.items?.[0]?.image,
          name: item.name || "Your Mix",
          remove: () => onRemove({ mixId: item.mixId }, "mix"),
        });
      } else {
        list.push({
          key: `${item.productId}-${item.variantId}`,
          image: item.image,
          name: item.name,
          remove: () => onRemove({ productId: item.productId, variantId: item.variantId }, "product"),
        });
      }
    }
    return list;
  }, [items, onRemove]);

  const shown = avatars.slice(0, 4);
  const extra = avatars.length - shown.length;

  return (
    <div className="flex shrink-0 items-center">
      {shown.map((a, i) => (
        <span key={a.key} className="relative -ml-2.5 first:ml-0" style={{ zIndex: shown.length - i }}>
          <span className="block h-9 w-9 overflow-hidden rounded-full border-2 border-(--surface) bg-(--surface-alt)">
            {a.image ? (
              <Image src={resolveImageUrl(a.image)} alt={a.name || ""} fill sizes="36px" className="object-cover" />
            ) : (
              <FiGift className="absolute inset-0 m-auto text-(--primary)" size={14} />
            )}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              a.remove();
            }}
            aria-label={`Remove ${a.name || "item"} from cart`}
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--danger) text-white ring-2 ring-(--surface)"
          >
            <FiX size={9} />
          </button>
        </span>
      ))}
      {extra > 0 && (
        <span className="relative -ml-2.5 flex h-9 w-9 items-center justify-center rounded-full border-2 border-(--surface) bg-(--primary) text-[10px] font-semibold text-white">
          +{extra}
        </span>
      )}
    </div>
  );
}

// A persistent "here's what you've earned" banner — stays visible the
// whole time a gift is awarded, not just as a one-off toast, so the
// customer always knows exactly what free item is riding along in the
// order (see describeGift above for the exact "250g Almonds" wording).
function AchievementBanner({ awarded, compact }) {
  if (awarded.length === 0) return null;
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-(--border-color) bg-(--surface)/60 p-2 backdrop-blur-md ${
        compact ? "text-[11px]" : "text-xs"
      }`}
    >
      {awarded.map((tier) => (
        <div key={tier.id} className="flex items-center gap-2">
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-(--border-color) bg-(--surface-alt)">
            {tier.giftProduct?.image ? (
              <Image
                src={resolveImageUrl(tier.giftProduct.image)}
                alt={tier.giftProduct.name || ""}
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <FiGift className="absolute inset-0 m-auto text-(--primary)" size={14} />
            )}
          </span>
          <span className="font-semibold text-(--primary)">🎉 FREE {describeGift(tier)} added to your order!</span>
        </div>
      ))}
    </div>
  );
}

// Shared progress math — takes the tier catalog + current subtotal and
// returns everything the UI (either variant) needs to render. `awarded` is
// what actually ends up as a free line on the order (see
// calculateRewardLines in the backend's calculateSubtotal.js): every
// cleared tier when cartRewardMode is "all", but only the single
// best-qualifying one otherwise — `unlocked` (every tier cleared,
// regardless of mode) is kept separately since `next`/`pct` still need to
// treat every threshold as a milestone worth progressing toward, even one
// that won't itself add a second gift in "highest" mode.
function useRewardProgress(tiers, subtotal, cartRewardMode) {
  return useMemo(() => {
    const sorted = [...tiers].sort((a, b) => a.minCartAmount - b.minCartAmount);
    const unlocked = sorted.filter((t) => subtotal >= t.minCartAmount);
    const next = sorted.find((t) => subtotal < t.minCartAmount) || null;
    const targetAmount = next ? next.minCartAmount : sorted[sorted.length - 1]?.minCartAmount || 0;
    const pct = targetAmount > 0 ? Math.min(100, (subtotal / targetAmount) * 100) : 0;
    const awarded = cartRewardMode === "all" ? unlocked : unlocked.slice(-1);
    return { sorted, unlocked, awarded, next, targetAmount, pct };
  }, [tiers, subtotal, cartRewardMode]);
}

// variant="floating" (default) — compact global widget, mounted once in
// the root layout, fixed above the mobile bottom nav / bottom-right on
// desktop. variant="inline" — the fuller card embedded at the top of the
// Cart page itself.
export default function CartFillProgress({ variant = "floating" }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { status } = useSession();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const navVisible = useScrollVisibility(NAV_HIDE_AFTER_PX);

  const [tiers, setTiers] = useState([]);
  const [cartRewardMode, setCartRewardMode] = useState("highest");
  const [loaded, setLoaded] = useState(false);
  const [burst, setBurst] = useState(null);
  const prevAwardedIds = useRef(null);

  useEffect(() => {
    cartRewardApi
      .getTiers()
      .then((res) => {
        if (res.data.action) {
          setTiers(res.data.data?.tiers || []);
          setCartRewardMode(res.data.data?.cartRewardMode || "highest");
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const { awarded, next, targetAmount, pct } = useRewardProgress(tiers, subtotal, cartRewardMode);

  // Fires the confetti burst exactly once per newly-awarded gift, not on
  // every re-render / quantity tweak that keeps the same awarded set — and
  // never on the very first computation (page load with an already-
  // qualifying cart shouldn't feel like a fresh celebration).
  useEffect(() => {
    const ids = awarded.map((t) => t.id).sort().join(",");
    if (prevAwardedIds.current === null) {
      prevAwardedIds.current = ids;
      return;
    }
    if (ids !== prevAwardedIds.current && awarded.length > 0) {
      const prevSet = new Set(prevAwardedIds.current.split(",").filter(Boolean));
      const isNewlyAwarded = awarded.some((t) => !prevSet.has(t.id));
      if (isNewlyAwarded) setBurst({ key: Date.now(), pieces: generateConfettiPieces() });
    }
    prevAwardedIds.current = ids;
  }, [awarded]);

  const suppressed = variant === "floating" && SUPPRESSED_ON.some((p) => pathname.startsWith(p));
  const visible = loaded && tiers.length > 0 && items.length > 0 && !suppressed;

  const goToCheckout = () => {
    if (status !== "authenticated") {
      dispatch(openAuthModal({ view: "login", redirectTo: "/checkout" }));
      return;
    }
    router.push("/checkout");
  };

  const handleRemoveItem = (payload, type) => {
    if (type === "combo") dispatch(removeCombo(payload));
    else if (type === "mix") dispatch(removeMix(payload));
    else dispatch(removeFromCart(payload));
  };

  if (variant === "inline") {
    if (!loaded || tiers.length === 0) return null;
    return (
      <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm ${GLASS_CLASSES}`}>
        {burst && <FullScreenConfetti pieces={burst.pieces} />}
        <RewardBody
          items={items}
          subtotal={subtotal}
          awarded={awarded}
          next={next}
          targetAmount={targetAmount}
          pct={pct}
          compact={false}
          onRemoveItem={handleRemoveItem}
          onCheckout={goToCheckout}
        />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none fixed inset-x-4 z-60 transition-[bottom] duration-300 ease-out md:inset-x-auto md:bottom-6 md:right-6 md:left-auto md:w-96 ${
        navVisible ? "bottom-24" : "bottom-4"
      }`}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`pointer-events-auto relative mx-auto max-w-sm overflow-hidden rounded-2xl p-3.5 shadow-xl md:max-w-none ${GLASS_CLASSES}`}
          >
            {burst && <FullScreenConfetti pieces={burst.pieces} />}
            <RewardBody
              items={items}
              subtotal={subtotal}
              awarded={awarded}
              next={next}
              targetAmount={targetAmount}
              pct={pct}
              compact
              onRemoveItem={handleRemoveItem}
              onCheckout={goToCheckout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RewardBody({ items, subtotal, awarded, next, targetAmount, pct, compact, onRemoveItem, onCheckout }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <AvatarStack items={items} onRemove={onRemoveItem} />
        <span className={`shrink-0 font-semibold text-(--foreground) ${compact ? "text-xs" : "text-sm"}`}>
          {formatPrice(subtotal)}
          {targetAmount > 0 && <span className="text-(--secondary-text)"> / {formatPrice(targetAmount)}</span>}
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-(--surface-alt)">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-(--primary) to-(--accent-secondary)"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <AchievementBanner awarded={awarded} compact={compact} />

      {next ? (
        <p className={`flex items-center gap-1.5 font-medium ${compact ? "text-[11px]" : "text-xs"}`}>
          <FiGift className="shrink-0 text-(--primary)" size={compact ? 13 : 14} />
          <span className="text-(--secondary-text)">
            Add <span className="text-(--foreground)">{formatPrice(next.minCartAmount - subtotal)}</span> more to
            unlock <span className="text-(--primary)">FREE {describeGift(next)}</span>
          </span>
        </p>
      ) : (
        awarded.length === 0 && (
          <p className={`flex items-center gap-1.5 font-medium text-(--secondary-text) ${compact ? "text-[11px]" : "text-xs"}`}>
            <FiGift className="shrink-0 text-(--primary)" size={compact ? 13 : 14} />
            Add items to unlock a free gift
          </p>
        )
      )}

      <Button size="sm" onClick={onCheckout} className="mt-0.5 w-full justify-center">
        Proceed to Checkout
      </Button>
    </div>
  );
}
