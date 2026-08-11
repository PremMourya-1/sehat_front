import { CUSTOMER_STATUS_LABELS } from "@/Constant/Constant";
import { formatDate, formatPrice } from "@/Utils/utils";

// Keyed by Order.customerStatus (see models/Order.js) — deliberately
// separate from the admin's internal operational status, which customers
// never see.
const STATUS_STYLES = {
  confirmed: "bg-(--info)/15 text-(--info)",
  dispatched: "bg-(--primary)/15 text-(--primary)",
  picked_up: "bg-(--primary)/15 text-(--primary)",
  in_transit: "bg-(--primary)/15 text-(--primary)",
  out_for_delivery: "bg-(--primary)/15 text-(--primary)",
  delivered: "bg-(--success)/15 text-(--success)",
  rto: "bg-(--danger)/15 text-(--danger)",
};

export default function OrderCard({ order }) {
  if (!order) return null;

  const items = order.OrderItems || order.orderItems || order.items || [];

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--surface) p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color) pb-3">
        <div>
          <p className="text-sm font-semibold text-(--foreground)">
            {order.orderNumber}
          </p>
          <p className="text-xs text-(--secondary-text)">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[order.customerStatus] || "bg-(--surface-alt) text-(--secondary-text)"
          }`}
        >
          {CUSTOMER_STATUS_LABELS[order.customerStatus] || order.customerStatus}
        </span>
      </div>

      {items.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between text-sm text-(--secondary-text)"
            >
              <span>
                {item.Product?.name || item.name || "Product"}
                {item.weight ? ` (${item.weight})` : ""} &times; {item.quantity}
              </span>
              <span className="text-(--foreground)">{formatPrice(item.price)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-(--border-color) pt-3">
        <span className="text-sm text-(--secondary-text)">Total</span>
        <span className="font-semibold text-(--foreground)">
          {formatPrice(order.total)}
        </span>
      </div>
    </div>
  );
}
