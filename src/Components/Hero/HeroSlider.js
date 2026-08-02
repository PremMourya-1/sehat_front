"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiAward, FiCheckCircle, FiHeart } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import { BRAND_NAME, BRAND_TAGLINE } from "@/Constant/Constant";
import { resolveImageUrl } from "@/Utils/utils";

const FEATURE_BADGES = [
  { icon: FiCheckCircle, label: "100% Natural" },
  { icon: FiHeart, label: "Rich in Nutrition" },
  { icon: FiAward, label: "Premium Quality" },
];

const SWIPE_THRESHOLD = 50;
const AUTOPLAY_MS = 5000;

// Highlights the last word (or last two, for longer titles) in the brand
// accent color, so admin-entered titles get a consistent pop of emphasis.
// A drop-shadow is applied (see the <h1>) rather than relying on the photo
// overlay alone, since a light/cream banner image would otherwise wash the
// gold highlight out.
function renderHighlightedTitle(title) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) {
    return <span className="text-(--accent)">{title}</span>;
  }
  const highlightCount = words.length >= 4 ? 2 : 1;
  const plain = words.slice(0, words.length - highlightCount).join(" ");
  const highlighted = words.slice(words.length - highlightCount).join(" ");
  return (
    <>
      {plain} <span className="text-(--accent)">{highlighted}</span>
    </>
  );
}

export default function HeroSlider({ banners = [] }) {
  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, deltaX: 0, pointerId: null });
  const hasBanners = Array.isArray(banners) && banners.length > 0;

  useEffect(() => {
    if (!hasBanners || banners.length < 2 || isDragging) return undefined;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % banners.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [hasBanners, banners.length, isDragging]);

  const goTo = (index) => {
    setActive(((index % banners.length) + banners.length) % banners.length);
  };

  const handlePointerDown = (e) => {
    if (!hasBanners || banners.length < 2) return;
    dragState.current = {
      startX: e.clientX,
      deltaX: 0,
      pointerId: e.pointerId,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    dragState.current.deltaX = e.clientX - dragState.current.startX;
  };

  const endDrag = (e) => {
    if (!isDragging) return;
    const { deltaX, pointerId } = dragState.current;
    if (pointerId !== null) {
      try {
        e.currentTarget.releasePointerCapture(pointerId);
      } catch {
        // pointer already released
      }
    }
    if (deltaX > SWIPE_THRESHOLD) goTo(active - 1);
    else if (deltaX < -SWIPE_THRESHOLD) goTo(active + 1);
    dragState.current = { startX: 0, deltaX: 0, pointerId: null };
    setIsDragging(false);
  };

  if (!hasBanners) {
    return (
      <section className="relative flex min-h-[85vh] max-md:min-h-0 items-center justify-center overflow-hidden bg-(--surface-alt) px-4 text-center max-md:py-10">
        <div className="animate-fade-in-up relative z-10 mx-auto max-w-2xl">
          <p className="font-accent text-lg text-(--accent-secondary) md:text-2xl">
            {BRAND_TAGLINE}
          </p>
          <h1 className="mt-3 font-heading text-4xl text-(--primary) md:text-6xl">
            {BRAND_NAME}
          </h1>
          <p className="mt-4 text-(--secondary-text) md:text-lg">
            Premium, hand-picked dry fruits and nuts — sourced with care, packed
            fresh, delivered to your doorstep.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button url="/products" size="lg">
              Shop Now
            </Button>
            <Button url="/about" variant="outline" size="lg">
              Our Story
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const banner = banners[active];

  return (
    <section
      className={`relative min-h-[85vh] max-md:min-h-0 touch-pan-y overflow-hidden select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(e) => {
        if (isDragging) endDrag(e);
      }}
    >
      {banners.map((b, index) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={resolveImageUrl(b.image)}
            alt={b.title || `${BRAND_NAME} banner ${index + 1}`}
            fill
            priority={index === 0}
            sizes="100vw"
            draggable={false}
            className={`object-cover ${index === active ? "animate-ken-burns" : ""}`}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-black/15" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      <div className="relative z-10 flex min-h-[85vh] max-md:min-h-0 flex-col justify-center px-6 text-white max-md:py-7 md:px-16">
        <div key={banner.id} className="animate-fade-in-up max-w-2xl">
          <p className="font-accent text-lg text-(--accent) drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] md:text-2xl">
            {BRAND_TAGLINE}
          </p>
          {banner.title && (
            <h1 className="mt-3 font-heading text-4xl leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] md:text-6xl">
              {renderHighlightedTitle(banner.title)}
            </h1>
          )}
          {banner.description && (
            <p className="mt-4 max-w-xl text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] max-md:line-clamp-2 md:text-lg">
              {banner.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Button url="/products" size="lg">
              Shop Now
            </Button>
            <Button url="/products" variant="outline-light" size="lg">
              Build Your Box
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
            {FEATURE_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-white/90"
              >
                <Icon className="text-(--accent)" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((b, index) => (
            <button
              key={b.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 w-2 rounded-full transition-all ${
                index === active ? "w-6 bg-(--accent)" : "bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
