"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronUp, FiX } from "react-icons/fi";
import { formatPrice } from "@/Utils/utils";
import MixSummaryPanel from "./MixSummaryPanel";

// Mobile-only: a compact fixed bar showing weight/price at a glance, tap to
// expand into a full bottom sheet with the same MixSummaryPanel content the
// desktop sidebar shows. Desktop hides this entirely (see the sm:hidden on
// the root) since the sticky sidebar is already always visible there.
export default function MixSummaryMobileBar(props) {
  const { items, totalGrams, capGrams, totalPrice } = props;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sm:hidden">
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-(--border-color) bg-(--surface) px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <button type="button" onClick={() => setExpanded(true)} className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <FiChevronUp size={18} className="text-(--secondary-text)" />
            <div className="text-left">
              <p className="text-xs text-(--secondary-text)">
                {items.length} ingredient{items.length === 1 ? "" : "s"} · {totalGrams}g / {capGrams}g
              </p>
              <p className="font-heading text-lg text-(--primary)">{formatPrice(totalPrice)}</p>
            </div>
          </div>
          <span className="rounded-full bg-(--btn-primary) px-4 py-2 text-xs font-semibold text-(--surface)">
            View Mix
          </span>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-(--surface) p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-lg text-(--primary)">Your Mix</h3>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-(--secondary-text) hover:bg-(--surface-alt)"
                >
                  <FiX size={18} />
                </button>
              </div>
              <MixSummaryPanel {...props} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
