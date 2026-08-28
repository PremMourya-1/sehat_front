"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiChevronRight, FiCreditCard, FiExternalLink, FiPackage, FiTruck, FiXCircle } from "react-icons/fi";
import { checkoutApi, orderApi } from "@/Service/api";
import { CUSTOMER_STATUS_LABELS } from "@/Constant/Constant";
import Card from "@/Components/Card/Card";
import Button from "@/Components/Button/Button";
import Loader from "@/Components/Common/Loader/Loader";
import OrderStatusStepper from "@/Components/Account/OrderStatusStepper";
import ReviewPrompt from "@/Components/Account/ReviewPrompt";
import { openRazorpayCheckout } from "@/Utils/razorpayCheckout";
import { formatDate, formatPrice, resolveImageUrl } from "@/Utils/utils";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState([]);

  // Self-cancel — only ever offered while customerStatus is "confirmed"
  // (see controllers/orderController.js cancelOrder for the same check
  // enforced server-side too). "confirming" is a two-step guard against an
  // accidental tap: clicking "Cancel Order" just reveals the reason field +
  // a final confirm button, it doesn't cancel anything by itself.
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // "Complete Payment" — offered while customerStatus is "payment_pending"
  // (see Components/Account/OrderStatusStepper.js for how that state is
  // shown). Reopens the SAME Razorpay order this order was created with
  // (order.razorpayOrderId), same shared helper the checkout page's own
  // retry uses — see Utils/razorpayCheckout.js.
  const [retryingPayment, setRetryingPayment] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setNotFound(false);

    orderApi
      .getById(id)
      .then((res) => {
        if (ignore) return;
        if (res.data.action) {
          setOrder(res.data.data);
          setReviewedProductIds(res.data.data.reviewedProductIds || []);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!ignore) setNotFound(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await orderApi.cancel(id, cancelReason.trim() || undefined);
      if (res.data.action) {
        toast.success(res.data.message || "Order cancelled");
        setOrder(res.data.data);
        setConfirmingCancel(false);
        setCancelReason("");
      } else {
        toast.error(res.data.message || "Could not cancel order");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!order?.razorpayOrderId || !order?.razorpayKeyId) {
      toast.error("Payment isn't available for this order right now — please contact support.");
      return;
    }
    setRetryingPayment(true);
    await openRazorpayCheckout({
      razorpayOrderId: order.razorpayOrderId,
      razorpayKeyId: order.razorpayKeyId,
      amount: Math.round(Number(order.total) * 100),
      orderNumber: order.orderNumber,
      customerName: order.shippingName,
      customerPhone: order.shippingPhone,
      onSuccess: async (response) => {
        try {
          const res = await checkoutApi.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (res.data.action) {
            setOrder(res.data.data);
            toast.success("Payment successful! Order confirmed.");
          } else {
            toast.error(res.data.message || "Payment verification failed. Please contact support with your payment ID.");
          }
        } catch (error) {
          toast.error(
            error?.response?.data?.message ||
              "Payment verification failed. If money was deducted, please contact support with your payment ID.",
          );
        } finally {
          setRetryingPayment(false);
        }
      },
      onDismiss: () => setRetryingPayment(false),
      onLoadFailure: () => {
        toast.error("Could not load the payment gateway. Please retry.");
        setRetryingPayment(false);
      },
    });
  };

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
            <OrderStatusStepper customerStatus={order.customerStatus} statusHistory={order.statusHistory} />
            {(order.awbCode || order.courierName) && (
              <p className="mt-4 border-t border-(--border-color) pt-4 text-xs text-(--secondary-text)">
                {order.courierName && <>Courier: {order.courierName}</>}
                {order.courierName && order.awbCode && " · "}
                {order.awbCode && <>AWB: {order.awbCode}</>}
              </p>
            )}
            {order.estimatedDeliveryDate && (
              <p className="mt-2 text-sm font-medium text-(--foreground)">
                Estimated Delivery: {formatDate(order.estimatedDeliveryDate)}
              </p>
            )}

            {order.customerStatus === "payment_pending" && (
              <div className="mt-4 border-t border-(--border-color) pt-4">
                <Button
                  type="button"
                  icon={FiCreditCard}
                  onClick={handleCompletePayment}
                  disabled={retryingPayment}
                >
                  {retryingPayment ? "Opening Payment..." : "Complete Payment"}
                </Button>
              </div>
            )}

            {order.customerStatus === "cancelled" && (
              <div className="mt-4 border-t border-(--border-color) pt-4 text-xs text-(--secondary-text)">
                Cancelled on {formatDate(order.cancelledAt)}
                {order.cancelledBy === "customer" && order.cancellationReason && (
                  <> · Reason: {order.cancellationReason}</>
                )}
                {order.refundStatus && order.refundStatus !== "not_applicable" && (
                  <p className="mt-1">
                    Refund:{" "}
                    {order.refundStatus === "completed"
                      ? `${formatPrice(order.refundAmount)} refunded`
                      : order.refundStatus === "pending"
                        ? "in progress"
                        : "failed — please contact support"}
                  </p>
                )}
              </div>
            )}

            {order.customerStatus === "confirmed" && (
              <div className="mt-4 border-t border-(--border-color) pt-4">
                {!confirmingCancel ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-(--danger) underline"
                  >
                    <FiXCircle size={14} /> Cancel Order
                  </button>
                ) : (
                  <div className="rounded-xl border border-(--danger)/30 bg-(--danger)/5 p-4">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-(--danger)">
                      <FiAlertTriangle size={15} /> Are you sure you want to cancel this order?
                    </p>
                    <p className="mt-1 text-xs text-(--secondary-text)">
                      This can&apos;t be undone. {order.paymentMethod === "prepaid" && order.paymentStatus === "paid"
                        ? "Your payment will be refunded to the original payment method."
                        : ""}
                    </p>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancelling (optional)"
                      rows={2}
                      className="mt-3 w-full rounded-lg border border-(--border-color) bg-(--surface) px-3 py-2 text-sm outline-none focus:border-(--primary)"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCancelOrder}
                        disabled={cancelling}
                        className="!bg-(--danger) hover:!bg-(--danger)"
                      >
                        {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setConfirmingCancel(false);
                          setCancelReason("");
                        }}
                        disabled={cancelling}
                      >
                        Never Mind
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
                    {item.ComboOffer && (
                      <p className="text-xs text-(--accent-secondary)">Part of: {item.ComboOffer.title}</p>
                    )}
                    {item.customMixId && (
                      <p className="text-xs text-(--accent-secondary)">
                        Part of mix: {item.customMixName || "Custom Mix"}
                      </p>
                    )}
                    {order.customerStatus === "delivered" &&
                      !item.isFreeGift &&
                      item.Product?.id &&
                      (reviewedProductIds.includes(item.Product.id) ? (
                        <p className="mt-1 text-xs text-(--success)">Reviewed — thanks!</p>
                      ) : (
                        <div className="mt-1">
                          <ReviewPrompt
                            productId={item.Product.id}
                            productName={item.Product.name || "this product"}
                            orderId={order.id}
                            onSubmitted={(productId) =>
                              setReviewedProductIds((prev) => [...prev, productId])
                            }
                          />
                        </div>
                      ))}
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
