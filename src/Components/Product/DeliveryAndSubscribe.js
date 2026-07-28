"use client";

import { useState } from "react";
import { FiCheckCircle, FiRepeat, FiTruck } from "react-icons/fi";

const PINCODE_REGEX = /^[0-9]{6}$/;

// Delivery estimate (dummy pincode check, no real serviceability API yet)
// + a per-product Subscribe & Save toggle (visual only — doesn't yet affect
// cart pricing/logic).
export default function DeliveryAndSubscribe() {
  const [pincode, setPincode] = useState("");
  const [checked, setChecked] = useState(false);
  const [subscribe, setSubscribe] = useState(false);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!PINCODE_REGEX.test(pincode)) return;
    setChecked(true);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-(--border-color) p-4">
      <form onSubmit={handleCheck} className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-(--foreground)">
          <FiTruck size={15} className="text-(--primary)" /> Check delivery & COD
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, ""));
              setChecked(false);
            }}
            placeholder="Enter pincode"
            className="w-32 rounded-lg border border-(--border-color) bg-(--surface) px-3 py-1.5 text-sm text-(--foreground) focus:outline-none focus:ring-1 focus:ring-(--primary)"
          />
          <button
            type="submit"
            disabled={!PINCODE_REGEX.test(pincode)}
            className="rounded-lg bg-(--btn-primary) px-4 py-1.5 text-sm font-medium text-(--surface) transition-colors hover:bg-(--btn-primary-hover) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check
          </button>
        </div>
        {checked && (
          <p className="flex items-center gap-1.5 text-sm text-(--success)">
            <FiCheckCircle size={14} /> Delivery in 3–5 days &middot; COD available
          </p>
        )}
      </form>

      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-(--border-color) bg-(--surface-alt) px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm text-(--foreground)">
          <FiRepeat size={15} className="text-(--primary)" />
          Subscribe &amp; Save <span className="text-(--secondary-text)">(extra 10% off)</span>
        </span>
        <input
          type="checkbox"
          checked={subscribe}
          onChange={(e) => setSubscribe(e.target.checked)}
          className="h-4 w-4"
        />
      </label>
    </div>
  );
}
