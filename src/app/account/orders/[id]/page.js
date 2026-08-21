"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiChevronRight, FiExternalLink, FiPackage, FiTruck } from "react-icons/fi";
import { orderApi } from "@/Service/api";
import { CUSTOMER_STATUS_LABELS } from "@/Constant/Constant";
import Card from "@/Components/Card/Card";
import Button from "@/Components/Button/Button";
import Loader from "@/Components/Common/Loader/Loader";
import OrderStatusStepper from "@/Components/Account/OrderStatusStepper";
import { formatDate, formatPrice, resolveImageUrl } from "@/Utils/utils";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    orderApi
      .getById(id)
      .then((res) => {
        if (cancelled) return;
        if (res.data.action) setOrder(res.data.data);
        else setNotFound(true);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <Loader />;

  if (notFound || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--surface-alt) text-(--primary)">
          <FiPackage size={24} />
        </span>
        <h1 className="font-heading text-2xl text-(--primary)">Order Not Found</h1>
        <p className="text-(--secondary-text)">
          We couldn&apos;t find this order, or it doesn&apos;t belong to your account.
        </p>
        <Button url="/account/orders">Back to My Orders</Button>
      </div>
    );
  }

  const items = order.OrderItems || order.orderItems || order.items || [];

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-(--secondary-text)">
        <Link href="/account/orders" className="hover:text-(--primary)">
          My Orders
        </Link>
        <FiChevronRight size={12} />
        <span className="text-(--foreground)">{order.orderNumber}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl text-(--primary)">{order.orderNumber}</h1>
          <p className="text-sm text-(--secondary-text)">Placed on {formatDate(order.createdAt)}</p>
        </div>
        {order.trackingUrl && (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-(--border-color) px-4 py-2 text-sm font-medium text-(--primary) transition-colors hover:bg-(--surface-alt)"
          >
            <FiTruck size={15} /> Track on Shiprocket <FiExternalLink size={13} />
          </a>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-heading text-lg text-(--primary)">Order Status</h2>
            <OrderStatusStepper customerStatus={order.customerStatus} />
            {(order.awbCode || order.courierName) && (
              <p className="mt-4 border-t border-(--border-color) pt-4 text-xs text-(--secondary-text)">
                {order.courierName && <>Courier: {order.courierName}</>}
                {order.courierName && order.awbCode && " · "}
                {order.awbCode && <>AWB: {order.awbCode}</>}
              </p>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-heading text-lg text-(--primary)">Items</h2>
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-(--border-color) bg-(--surface-alt)">
                    <Image
                      src={resolveImageUrl(item.Product?.image)}
                      alt={item.Product?.name || item.name || "Product"}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-medium text-(--foreground)">
                      {item.Product?.name || item.name || "Product"}
                      {item.weight ? ` (${item.weight})` : ""}
                    </p>
                    <p className="text-xs text-(--secondary-text)">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-(--foreground)">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-3 font-heading text-lg text-(--primary)">Delivery Address</h2>
            <p className="text-sm font-medium text-(--foreground)">
              {order.shippingName} · {order.shippingPhone}
            </p>
            <p className="mt-1 text-sm text-(--secondary-text)">
              {order.shippingAddress}, {order.shippingCity}, {order.shippingState} -{" "}
              {order.shippingPincode}
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 font-heading text-lg text-(--primary)">Order Summary</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-(--secondary-text)">
                <span>Subtotal</span>
                <span className="text-(--foreground)">{formatPrice(order.subtotal)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-(--success)">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-(--secondary-text)">
                <span>Shipping</span>
                <span className="text-(--foreground)">{formatPrice(order.shippingCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-(--border-color) pt-2 text-base font-semibold text-(--foreground)">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-(--secondary-text)">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online (Razorpay)"}
            </p>
          </Card>

          <p className="rounded-xl border border-(--border-color) bg-(--surface-alt) p-3 text-xs text-(--secondary-text)">
            Status shown here: <strong className="text-(--foreground)">{CUSTOMER_STATUS_LABELS[order.customerStatus] || order.customerStatus}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
