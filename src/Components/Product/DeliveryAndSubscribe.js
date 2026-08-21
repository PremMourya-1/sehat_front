"use client";

import { useState } from "react";
import { FiRepeat } from "react-icons/fi";

// Per-product Subscribe & Save toggle (visual only — doesn't yet affect
// cart pricing/logic). The pincode/delivery check used to live here too,
// but that's now checkout-only (see app/checkout/page.js) — this page no
// longer does any delivery check of its own.
export default function DeliveryAndSubscribe() {
  const [subscribe, setSubscribe] = useState(false);

  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
        subscribe
          ? "border-(--primary) bg-(--primary)/5"
          : "border-(--border-color) bg-(--surface-alt) hover:border-(--primary)/40"
      }`}
    >
      <span className="flex items-center gap-2.5 text-sm text-(--foreground)">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
          <FiRepeat size={15} />
        </span>
        <span>
          Subscribe &amp; Save{" "}
          <span className="font-medium text-(--accent-secondary)">
            (extra 10% off)
          </span>
        </span>
      </span>
      <input
        type="checkbox"
        checked={subscribe}
        onChange={(e) => setSubscribe(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-(--primary)"
      />
    </label>
  );
}
