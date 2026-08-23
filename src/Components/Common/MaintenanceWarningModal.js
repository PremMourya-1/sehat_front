"use client";

import { useEffect, useState } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import Button from "@/Components/Button/Button";

// Temporary, dismissible heads-up while checkout/payment work is in
// progress — remove this component (and its import in layout.js) once
// that's done. Shows once per browser tab session, not on every page nav.
const DISMISS_KEY = "maintenanceWarningDismissed";

export default function MaintenanceWarningModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(DISMISS_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — worst case the popup shows again next page load
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-(--surface) p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-(--secondary-text) hover:text-(--foreground)"
        >
          <FiX size={20} />
        </button>

        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--danger)/10 text-(--danger)">
          <FiAlertTriangle size={26} />
        </span>

        <h2 className="mt-4 font-heading text-xl text-(--primary)">Please Read Before Ordering</h2>

        <p className="mt-3 text-sm text-(--secondary-text)">
          We&apos;re currently doing maintenance work on our checkout &amp; payments system. Please avoid
          placing new orders right now.
        </p>
        <p className="mt-2 text-sm text-(--secondary-text)">
          <strong className="text-(--danger)">Prepaid (online payment) orders:</strong> money may get
          deducted from your account, but the order might not be confirmed or reach you.
        </p>
        <p className="mt-2 text-sm text-(--secondary-text)">
          Cash on Delivery orders are safe to place as usual.
        </p>

        <Button onClick={handleClose} className="mt-5 w-full" showArrow={false}>
          Got it, I understand
        </Button>
      </div>
    </div>
  );
}
