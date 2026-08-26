"use client";

import { useState } from "react";
import Link from "next/link";
import { FiStar } from "react-icons/fi";
import { reviewApi } from "@/Service/api";
import { formatDate } from "@/Utils/utils";

function Stars({ rating, size = 14 }) {
  return (
    <div className="flex text-(--accent)">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} size={size} fill={i < Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

function RatingBreakdown({ breakdown, totalReviews }) {
  return (
    <div className="flex flex-col gap-1.5">
      {breakdown.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-2 text-xs text-(--secondary-text)">
          <span className="w-8 shrink-0">{star} star</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--surface)">
            <div
              className="h-full rounded-full bg-(--accent)"
              style={{ width: totalReviews ? `${(count / totalReviews) * 100}%` : "0%" }}
            />
          </div>
          <span className="w-6 shrink-0 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

// Read-only display — reading is public, but writing a review only happens
// from the customer's own order detail page once that order is delivered
// (see Components/Account/ReviewPrompt.js), not from here. This just shows
// what's already been approved.
export default function ProductReviews({ productId, initialData }) {
  const [data, setData] = useState(initialData);
  const [loadingMore, setLoadingMore] = useState(false);

  const reviews = data?.reviews || [];
  const totalReviews = data?.totalReviews || 0;
  const averageRating = data?.averageRating || 0;
  const breakdown = data?.ratingBreakdown || [];
  const hasMore = data && data.page < data.totalPages;

  const loadMore = async () => {
    if (!data || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await reviewApi.list(productId, { page: data.page + 1 });
      if (res.data.action) {
        setData((prev) => ({
          ...res.data.data,
          reviews: [...prev.reviews, ...res.data.data.reviews],
        }));
      }
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div id="reviews">
      <h3 className="font-heading text-lg text-(--foreground) md:text-xl">
        Customer Reviews {totalReviews > 0 && `(${totalReviews})`}
      </h3>

      {totalReviews === 0 ? (
        <p className="mt-4 text-sm text-(--secondary-text)">
          No reviews yet.{" "}
          <Link href="/account/orders" className="text-(--primary) underline">
            Bought this? Rate it from your orders.
          </Link>
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-(--border-color) bg-(--surface-alt) p-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="font-heading text-3xl text-(--foreground)">{averageRating}</span>
              <Stars rating={averageRating} size={16} />
              <span className="text-xs text-(--secondary-text)">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex-1">
              <RatingBreakdown breakdown={breakdown} totalReviews={totalReviews} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-(--border-color) bg-(--surface-alt) p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-(--foreground)">{review.customerName}</p>
                  <Stars rating={review.rating} />
                </div>
                <p className="mt-0.5 text-xs text-(--muted)">{formatDate(review.createdAt)}</p>
                <p className="mt-2 text-sm text-(--secondary-text)">{review.comment}</p>
                {review.photos?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {review.photos.map((photo, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={photo}
                        alt={`${i + 1} of ${review.photos.length}`}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-4 w-full rounded-full border border-(--border-color) py-2 text-sm font-medium text-(--primary) hover:bg-(--surface-alt)"
            >
              {loadingMore ? "Loading..." : "Load more reviews"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
