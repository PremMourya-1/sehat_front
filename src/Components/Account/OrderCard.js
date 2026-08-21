import Link from "next/link";
import { FiChevronRight, FiPackage } from "react-icons/fi";
import { CUSTOMER_STATUS_LABELS } from "@/Constant/Constant";
import Card from "@/Components/Card/Card";
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
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color) pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
            <FiPackage size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-(--foreground)">
              {order.orderNumber}
            </p>
            <p className="text-xs text-(--secondary-text)">
              {formatDate(order.createdAt)}
            </p>
          </div>
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

      <Link
        href={`/account/orders/${order.id}`}
        className="mt-3 flex items-center justify-center gap-1 rounded-full border border-(--border-color) py-2 text-sm font-medium text-(--primary) transition-colors hover:bg-(--surface-alt)"
      >
        Track Order <FiChevronRight size={15} />
      </Link>
    </Card>
  );
}
