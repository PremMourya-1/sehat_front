"use client";

import { useEffect, useState } from "react";
import { orderApi } from "@/Service/api";
import OrderCard from "@/Components/Account/OrderCard";
import Loader from "@/Components/Common/Loader/Loader";

export default function RecentOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    orderApi
      .recent()
      .then((res) => {
        if (!cancelled && res.data.action) setOrders(res.data.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-2xl text-(--primary)">Recent Orders</h1>
      <p className="mt-1 text-sm text-(--secondary-text)">
        Orders that are pending, processing, or on their way to you.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-(--secondary-text)">
          No orders currently in progress.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
