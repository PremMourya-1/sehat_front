import { FiCheck, FiHome, FiMapPin, FiPackage, FiRotateCcw, FiTruck } from "react-icons/fi";
import { CUSTOMER_STATUS_LABELS } from "@/Constant/Constant";

// Same linear happy-path order as the backend's STATUS_PROGRESSION (see
// utils/shiprocket.js isForwardProgress) — "rto" is deliberately not part of
// this sequence there either, since it's a branch that can follow any
// post-dispatch step, not a position along it. Labels come from
// CUSTOMER_STATUS_LABELS (Constant.js) — the one place that vocabulary is
// defined, reused here rather than duplicated.
const STEP_ORDER = ["confirmed", "dispatched", "picked_up", "in_transit", "out_for_delivery", "delivered"];

const STEP_ICONS = {
  confirmed: FiCheck,
  dispatched: FiPackage,
  picked_up: FiTruck,
  in_transit: FiTruck,
  out_for_delivery: FiMapPin,
  delivered: FiHome,
};

export default function OrderStatusStepper({ customerStatus }) {
  const isRto = customerStatus === "rto";
  const currentIndex = STEP_ORDER.indexOf(customerStatus);

  return (
    <div className="flex flex-col">
      {STEP_ORDER.map((step, index) => {
        const Icon = STEP_ICONS[step];
        // Once a shipment is RTO, nothing in the normal sequence can be
        // confidently marked "reached" — the exact step it branched from
        // isn't tracked — so every normal step renders muted and the RTO
        // banner below is the only definitive marker.
        const isDone = !isRto && index <= currentIndex;
        const isCurrent = !isRto && index === currentIndex;
        const isLast = index === STEP_ORDER.length - 1;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                  isDone
                    ? "border-(--primary) bg-(--primary) text-(--surface)"
                    : "border-(--border-color) bg-(--surface) text-(--secondary-text)"
                }`}
              >
                <Icon size={16} />
              </span>
              {!isLast && (
                <span
                  className={`w-0.5 flex-1 ${index < currentIndex && !isRto ? "bg-(--primary)" : "bg-(--border-color)"}`}
                  style={{ minHeight: "2rem" }}
                />
              )}
            </div>
            <div className={isLast ? "pb-0" : "pb-8"}>
              <p
                className={`text-sm font-medium ${
                  isCurrent ? "text-(--primary)" : isDone ? "text-(--foreground)" : "text-(--secondary-text)"
                }`}
              >
                {CUSTOMER_STATUS_LABELS[step]}
              </p>
              {isCurrent && <p className="text-xs text-(--secondary-text)">Current status</p>}
            </div>
          </div>
        );
      })}

      {isRto && (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-(--danger)/30 bg-(--danger)/5 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--danger)/15 text-(--danger)">
            <FiRotateCcw size={16} />
          </span>
          <div>
            <p className="text-sm font-medium text-(--danger)">{CUSTOMER_STATUS_LABELS.rto}</p>
            <p className="text-xs text-(--secondary-text)">This shipment is being returned to origin.</p>
          </div>
        </div>
      )}
    </div>
  );
}
