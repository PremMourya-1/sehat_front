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
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-(--border-color) bg-(--surface-alt) px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-(--foreground)">
        <FiRepeat size={15} className="text-(--primary)" />
        Subscribe &amp; Save{" "}
        <span className="text-(--secondary-text)">(extra 10% off)</span>
      </span>
      <input
        type="checkbox"
        checked={subscribe}
        onChange={(e) => setSubscribe(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}
