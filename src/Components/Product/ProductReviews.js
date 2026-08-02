"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiCamera, FiCheckCircle, FiStar, FiX } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import FloatingLabelInput from "@/Components/Form/FloatingLabelInput";
import { reviewApi } from "@/Service/api";
import { formatDate, resolveImageUrl } from "@/Utils/utils";

function Stars({ rating, size = 14 }) {
  return (
    <div className="flex text-(--accent)">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} size={size} fill={i < rating ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

// Real, order-verified customer reviews. To stop fake/spam reviews, a
// customer must first prove they bought the product by entering the order
// number from their bill/package — the backend checks that order actually
// contains this product and that the order number hasn't been used for a
// review before (each order number verifies, and can post, exactly once).
export default function ProductReviews({ productId, productName, reviews: initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [formOpen, setFormOpen] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormOpen(false);
    setOrderNumber("");
    setVerified(false);
    setVerifyError("");
    setName("");
    setRating(5);
    setComment("");
    setPhoto(null);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setVerifying(true);
    setVerifyError("");
    try {
      const res = await reviewApi.verify(productId, orderNumber.trim());
      if (res.data.action) {
        setVerified(true);
      } else {
        setVerifyError(res.data.message || "Verification failed");
      }
    } catch (err) {
      setVerifyError(err?.response?.data?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const formData = new FormData();
    formData.append("orderNumber", orderNumber.trim());
    formData.append("customerName", name.trim());
    formData.append("rating", rating);
    formData.append("comment", comment.trim());
    if (photo) formData.append("photo", photo);

    try {
      setSubmitting(true);
      const res = await reviewApi.create(productId, formData);
      if (res.data.action) {
        setReviews((prev) => [res.data.data, ...prev]);
        toast.success("Thanks for your review!");
        resetForm();
      } else {
        toast.error(res.data.message || "Failed to post review");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg text-(--foreground) md:text-xl">
          Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h3>
        {!formOpen && (
          <Button size="sm" onClick={() => setFormOpen(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-(--secondary-text)">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-(--border-color) bg-(--surface-alt) p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-(--foreground)">{review.customerName}</p>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-0.5 text-xs text-(--muted)">{formatDate(review.createdAt)}</p>
              <p className="mt-2 text-sm text-(--secondary-text)">{review.comment}</p>
              {review.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(review.photo)}
                  alt="Review attachment"
                  className="mt-2 h-20 w-20 rounded-lg object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="mt-6 rounded-xl border border-(--border-color) bg-(--surface-alt) p-4 md:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-(--foreground)">
              Write a review for {productName}
            </p>
            <button
              type="button"
              onClick={resetForm}
              aria-label="Close review form"
              className="text-(--secondary-text) hover:text-(--foreground)"
            >
              <FiX size={18} />
            </button>
          </div>

          {!verified ? (
            <form onSubmit={handleVerify} className="mt-4 flex flex-col gap-2">
              <p className="text-xs text-(--secondary-text)">
                To keep reviews genuine, enter the order number from your bill/package to
                verify your purchase before reviewing.
              </p>
              <div className="flex flex-wrap gap-2">
                <FloatingLabelInput
                  id="review-order-number"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value);
                    setVerifyError("");
                  }}
                  label="Enter your order number"
                  wrapperClassName="min-w-0 flex-1"
                />
                <Button type="submit" size="sm" disabled={verifying || !orderNumber.trim()}>
                  {verifying ? "Verifying..." : "Verify Order"}
                </Button>
              </div>
              {verifyError && <p className="text-xs text-(--danger)">{verifyError}</p>}
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-(--success)">
                <FiCheckCircle size={14} /> Order verified — you can post your review
              </p>

              <FloatingLabelInput
                id="review-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Your name"
                required
              />

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    aria-label={`Rate ${i + 1} stars`}
                    className="text-(--accent)"
                  >
                    <FiStar size={18} fill={i < rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>

              <FloatingLabelInput
                as="textarea"
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                label="Share your experience..."
                rows={3}
                required
              />

              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-(--secondary-text) hover:text-(--primary)">
                  <FiCamera size={16} />
                  {photo ? "Change photo" : "Add a photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  />
                </label>
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="flex items-center gap-1 text-xs text-(--danger)"
                  >
                    <FiX size={13} /> Remove
                  </button>
                )}
              </div>

              <Button type="submit" size="sm" className="w-fit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
