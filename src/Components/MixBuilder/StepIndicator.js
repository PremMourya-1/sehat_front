"use client";

import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const STEPS = [
  { step: 1, label: "Pick Ingredients" },
  { step: 2, label: "Review" },
  { step: 3, label: "Add to Cart" },
];

// Horizontal 3-step progress bar — same rounded-pill/step-circle visual
// language as Account/OrderStatusStepper.js (that one's vertical, for order
// history), reused here as a horizontal top-of-page indicator.
export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center">
      {STEPS.map(({ step, label }, index) => {
        const isDone = step < currentStep;
        const isCurrent = step === currentStep;
        const isLast = index === STEPS.length - 1;

        return (
          // items-start (not items-center) on purpose: the sibling line
          // below is vertically positioned with its own mt-4.25 (17px), measured
          // against the circle's fixed h-9 (36px) size — 17px + half the
          // line's own 2px height (1px) = 18px = exactly the circle's
          // vertical center. items-center would instead center the line
          // against this row's full height (circle + gap + label), pulling
          // it down toward the label on every screen where the label is
          // visible — the misalignment this replaces. Both circle and line
          // heights are fixed (not responsive), so this stays exact on
          // every device, including mobile where the label is hidden
          // (max-sm:hidden) and the row shrinks to just the circle's height.
          <div key={step} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5">
              <motion.span
                initial={false}
                animate={{ scale: isCurrent ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  isDone
                    ? "border-(--primary) bg-(--primary) text-(--surface)"
                    : isCurrent
                      ? "border-(--primary) text-(--primary)"
                      : "border-(--border-color) text-(--secondary-text)"
                }`}
              >
                {isDone ? <FiCheck size={16} /> : step}
              </motion.span>
              <span
                className={`text-center text-xs font-medium max-sm:hidden ${
                  isCurrent || isDone ? "text-(--foreground)" : "text-(--secondary-text)"
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div className="mx-2 mt-4.25 h-0.5 flex-1 shrink-0 overflow-hidden rounded-full bg-(--border-color) sm:mx-1.5">
                <motion.div
                  className="h-full bg-(--primary)"
                  initial={false}
                  animate={{ width: isDone ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
