"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { FiGift } from "react-icons/fi";
import { selectCartItems, selectCartSubtotal } from "@/Store/Slices/cartSlice";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import { cartRewardApi } from "@/Service/api";
import { formatPrice, resolveImageUrl } from "@/Utils/utils";

// The global floating widget follows the shopper everywhere except pages
// that already show their own richer version (the Cart page embeds
// <CartFillProgress variant="inline" />) or have no cart context at all.
const SUPPRESSED_ON = ["/cart", "/checkout", "/build-your-own-mix"];

const CONFETTI_COLORS = [
  "var(--primary)",
  "var(--accent-secondary)",
  "#FFD166",
  "#EF476F",
  "#06D6A0",
];

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

function AvatarStack({ items }) {
  const avatars = useMemo(() => {
    const list = [];
    for (const item of items) {
      if (item.type === "combo") {
        list.push({ key: `combo-${item.comboOfferId}`, image: item.image, name: item.title });
      } else if (item.type === "mix") {
        list.push({ key: `mix-${item.mixId}`, image: item.items?.[0]?.image, name: item.name || "Your Mix" });
      } else {
        list.push({ key: `${item.productId}-${item.variantId}`, image: item.image, name: item.name });
      }
    }
    return list;
  }, [items]);

  const shown = avatars.slice(0, 4);
  const extra = avatars.length - shown.length;

  return (
    <div className="flex shrink-0 items-center">
      {shown.map((a, i) => (
        <span
          key={a.key}
          className="relative -ml-2.5 block h-8 w-8 overflow-hidden rounded-full border-2 border-(--surface) bg-(--surface-alt) first:ml-0"
          style={{ zIndex: shown.length - i }}
        >
          {a.image ? (
            <Image src={resolveImageUrl(a.image)} alt={a.name || ""} fill sizes="32px" className="object-cover" />
          ) : (
            <FiGift className="absolute inset-0 m-auto text-(--primary)" size={14} />
          )}
        </span>
      ))}
      {extra > 0 && (
        <span className="relative -ml-2.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-(--surface) bg-(--primary) text-[10px] font-semibold text-white">
          +{extra}
        </span>
      )}
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

  // The whole widget doubles as a "go finish this order" shortcut — tapping
  // it jumps straight to checkout, same auth gate the Cart page's own
  // Proceed to Checkout button uses.
  const goToCheckout = () => {
    if (status !== "authenticated") {
      dispatch(openAuthModal({ view: "login", redirectTo: "/checkout" }));
      return;
    }
    router.push("/checkout");
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToCheckout();
    }
  };

  if (variant === "inline") {
    if (!loaded || tiers.length === 0) return null;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={goToCheckout}
        onKeyDown={handleKeyDown}
        aria-label="Go to checkout"
        className="relative cursor-pointer overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface) p-5 transition-colors hover:border-(--primary)"
      >
        {burst && <FullScreenConfetti pieces={burst.pieces} />}
        <RewardBody
          items={items}
          subtotal={subtotal}
          awarded={awarded}
          next={next}
          targetAmount={targetAmount}
          pct={pct}
          compact={false}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-60 md:inset-x-auto md:bottom-6 md:right-6 md:left-auto md:w-96">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            role="button"
            tabIndex={0}
            onClick={goToCheckout}
            onKeyDown={handleKeyDown}
            aria-label="Go to checkout"
            className="pointer-events-auto relative mx-auto max-w-sm cursor-pointer overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface)/95 p-3.5 shadow-xl backdrop-blur-lg md:max-w-none"
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RewardBody({ items, subtotal, awarded, next, targetAmount, pct, compact }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <AvatarStack items={items} />
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

      <p className={`flex items-center gap-1.5 font-medium ${compact ? "text-[11px]" : "text-xs"}`}>
        <FiGift className="shrink-0 text-(--primary)" size={compact ? 13 : 14} />
        {next ? (
          <span className="text-(--secondary-text)">
            Add <span className="text-(--foreground)">{formatPrice(next.minCartAmount - subtotal)}</span> more to
            unlock{" "}
            <span className="text-(--primary)">
              {next.label || `a free ${next.giftProduct?.name || "gift"}`}
            </span>
          </span>
        ) : awarded.length > 0 ? (
          <span className="text-(--primary)">
            🎉{" "}
            {awarded.length > 1
              ? `All rewards unlocked — ${awarded.map((t) => t.label || t.giftProduct?.name).filter(Boolean).join(", ")} added free!`
              : `${awarded[0].label || `Free ${awarded[0].giftProduct?.name || "gift"}`} added to your order!`}
          </span>
        ) : (
          <span className="text-(--secondary-text)">Add items to unlock a free gift</span>
        )}
      </p>
    </div>
  );
}
