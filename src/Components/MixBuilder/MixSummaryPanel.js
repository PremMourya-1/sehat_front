"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { formatPrice, resolveImageUrl } from "@/Utils/utils";

// Shared "Your Mix" content — the running ingredient list, weight progress
// bar toward the cap, total price, and a primary action button. Rendered
// both inside the desktop sticky sidebar and the mobile bottom sheet (see
// MixSummaryMobileBar.js) so the two never drift out of sync.
export default function MixSummaryPanel({
  items,
  totalGrams,
  capGrams,
  totalPrice,
  onRemove,
  primaryLabel,
  onPrimaryAction,
  primaryDisabled,
}) {
  const percent = Math.min(100, (totalGrams / capGrams) * 100);
  const isFull = totalGrams >= capGrams;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-(--foreground)">Total Weight</span>
          <span className={`text-sm font-semibold ${isFull ? "text-(--danger)" : "text-(--foreground)"}`}>
            {totalGrams}g / {capGrams}g
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-(--surface-alt)">
          <motion.div
            className={`h-full rounded-full ${isFull ? "bg-(--danger)" : "bg-(--primary)"}`}
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
        {isFull && <p className="mt-1.5 text-xs text-(--danger)">Mix is full — remove something to add more.</p>}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--border-color) py-6 text-center text-sm text-(--secondary-text)">
          Your mix is empty. Add ingredients from below.
        </p>
      ) : (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <motion.li
              key={item.productId}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5"
            >
              <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-(--border-color) bg-(--surface-alt)">
                <Image src={resolveImageUrl(item.image)} alt={item.name} fill sizes="40px" className="object-cover" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-(--foreground)">{item.name}</p>
                <p className="text-xs text-(--secondary-text)">
                  {item.grams}g · {formatPrice(item.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.productId)}
                aria-label={`Remove ${item.name}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-(--secondary-text) transition-colors hover:bg-(--danger)/10 hover:text-(--danger)"
              >
                <FiX size={15} />
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between border-t border-(--border-color) pt-3">
        <span className="text-sm text-(--secondary-text)">Total</span>
        <span className="font-heading text-xl text-(--primary)">{formatPrice(totalPrice)}</span>
      </div>

      <button
        type="button"
        onClick={onPrimaryAction}
        disabled={primaryDisabled}
        className="rounded-full bg-(--btn-primary) py-3 text-sm font-semibold text-(--surface) transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {primaryLabel}
      </button>
    </div>
  );
}
