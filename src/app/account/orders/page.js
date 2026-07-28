"use client";

import { useEffect, useState } from "react";
import { orderApi } from "@/Service/api";
import OrderCard from "@/Components/Account/OrderCard";
import Button from "@/Components/Button/Button";
import Loader from "@/Components/Common/Loader/Loader";

const PAGE_SIZE = 5;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    orderApi
      .list({ page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        if (res.data.action) {
          const data = res.data.data;
          const list = Array.isArray(data) ? data : data?.orders || [];
          setOrders(list);
          setHasMore(Array.isArray(data) ? false : Boolean(data?.page < data?.totalPages));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await orderApi.list({ page: nextPage, limit: PAGE_SIZE });
      if (res.data.action) {
        const data = res.data.data;
        const list = Array.isArray(data) ? data : data?.orders || [];
        setOrders((prev) => [...prev, ...list]);
        setHasMore(Array.isArray(data) ? false : Boolean(data?.page < data?.totalPages));
        setPage(nextPage);
      }
    } catch {
      // ignore — user can retry
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-heading text-2xl text-(--primary)">My Orders</h1>
      <p className="mt-1 text-sm text-(--secondary-text)">
        A complete history of everything you&apos;ve ordered.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-(--secondary-text)">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
