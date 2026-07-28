"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiRepeat, FiSend } from "react-icons/fi";
import { newsletterApi } from "@/Service/api";
import subscribeImage from "@/assets/home/subscribe.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Permanent, hardcoded newsletter signup teaser — not admin-managed (this
// content/image never changes), so it's static. Sits full-width right
// above the footer. Captures emails via the newsletter API so the admin
// panel can build a marketing list for future offers/launches.
export default function SubscribeAndSave() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await newsletterApi.subscribe(email.trim());
      if (res.data.action) {
        toast.success(res.data.message || "Subscribed successfully!");
        setEmail("");
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-[200px] items-center justify-center overflow-hidden text-center text-(--surface) max-md:min-h-[240px]">
      <Image src={subscribeImage} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/60 to-black/30" />

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--surface)/15">
          <FiRepeat size={18} />
        </span>
        <h2 className="font-heading text-2xl md:text-3xl">Subscribe &amp; Save</h2>
        <p className="text-sm text-(--surface)/90 md:text-base">
          Be the first to know when new products or exclusive offers drop — and save
          more with repeat deliveries on your favorites.
        </p>

        <form onSubmit={handleSubmit} className="mt-2 flex w-full max-w-sm flex-wrap justify-center gap-2 sm:flex-nowrap">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full min-w-0 flex-1 rounded-full border border-(--surface)/30 bg-(--surface)/10 px-4 py-2.5 text-sm text-(--surface) placeholder:text-(--surface)/60 focus:outline-none focus:ring-2 focus:ring-(--accent)"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-(--accent) px-6 py-2.5 text-sm font-medium text-(--foreground) shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
            {!isSubmitting && (
              <FiSend size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
