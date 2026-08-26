"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiCamera, FiStar, FiX } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import FloatingLabelInput from "@/Components/Form/FloatingLabelInput";
import { reviewApi } from "@/Service/api";

const MAX_PHOTOS = 5;

// "Rate this product" — shown per order item on the order detail page once
// customerStatus is "delivered" and this specific (customer, product,
// order) combination hasn't been reviewed yet (see reviewedProductIds on
// the order, computed server-side in orderController.getOrderById). This is
// the ONLY place a review can be written from — the product page itself is
// read-only display (see Components/Product/ProductReviews.js) — so
// proof-of-purchase is implicit (we already know this order belongs to the
// logged-in customer and is delivered) rather than a manually-typed order
// number.
export default function ReviewPrompt({ productId, productName, orderId, onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const addPhotos = (files) => {
    const next = [...photos, ...Array.from(files)].slice(0, MAX_PHOTOS);
    setPhotos(next);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("rating", rating);
    formData.append("comment", comment.trim());
    photos.forEach((photo) => formData.append("photos", photo));

    try {
      setSubmitting(true);
      const res = await reviewApi.create(productId, formData);
      if (res.data.action) {
        toast.success(res.data.message || "Thanks! Your review is pending approval.");
        onSubmitted?.(productId);
      } else {
        toast.error(res.data.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-(--primary) underline"
      >
        <FiStar size={13} /> Rate this product
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex flex-col gap-3 rounded-xl border border-(--border-color) bg-(--surface-alt) p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-(--foreground)">Rate {productName}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="text-(--secondary-text) hover:text-(--foreground)"
        >
          <FiX size={16} />
        </button>
      </div>

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
        id={`review-comment-${productId}`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        label="Share your experience..."
        rows={3}
        required
      />

      <div className="flex flex-wrap items-center gap-2">
        {photos.map((photo, i) => (
          <span key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(photo)}
              alt={`Attachment ${i + 1}`}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              aria-label="Remove photo"
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-(--danger) text-white"
            >
              <FiX size={10} />
            </button>
          </span>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-(--secondary-text) hover:text-(--primary)">
            <FiCamera size={15} />
            Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addPhotos(e.target.files)}
            />
          </label>
        )}
      </div>

      <Button type="submit" size="sm" className="w-fit" disabled={submitting || !comment.trim()}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
