"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import SectionHeading from "@/Components/Common/SectionHeading";
import { resolveImageUrl } from "@/Utils/utils";

const AUTO_SCROLL_SPEED = 0.8; // px per animation frame (~48px/s)
const RESUME_DELAY_MS = 2000; // how long after the user lets go before auto-scroll resumes
const ARROW_SCROLL_AMOUNT = 260; // px per left/right arrow click

// Level-1 taxonomy — an auto-scrolling, infinitely-looping row that's also
// a real natively-scrollable element, so a thumb swipe (or the arrow
// buttons) jumps straight to whichever category the user wants instead of
// making them wait for the marquee to drift there on its own. The list is
// tripled so there's always a full screen of content to scroll into in
// either direction; once the user (or the auto-scroll tick) passes one
// copy's width, we silently snap back by that amount to fake the loop.
export default function ShopByType({ categories = [] }) {
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const singleSetWidthRef = useRef(0);

  const hasCategories = Array.isArray(categories) && categories.length > 0;
  const loopedCategories = hasCategories
    ? [...categories, ...categories, ...categories]
    : [];

  useEffect(() => {
    const el = scrollRef.current;
    if (!hasCategories || !el) return undefined;

    singleSetWidthRef.current = el.scrollWidth / 3;
    el.scrollLeft = singleSetWidthRef.current;

    const step = () => {
      if (!pausedRef.current && el) {
        el.scrollLeft += AUTO_SCROLL_SPEED;
        const singleWidth = singleSetWidthRef.current;
        if (singleWidth > 0) {
          if (el.scrollLeft >= singleWidth * 2) el.scrollLeft -= singleWidth;
          else if (el.scrollLeft <= 0) el.scrollLeft += singleWidth;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [hasCategories]);

  const pauseAutoScroll = () => {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const scheduleResume = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  };

  // Keeps the loop seamless on user-driven scrolling too (a fast flick can
  // overshoot past where the per-frame auto-scroll check would have caught it).
  const handleScroll = () => {
    const el = scrollRef.current;
    const singleWidth = singleSetWidthRef.current;
    if (!el || !singleWidth) return;
    if (el.scrollLeft >= singleWidth * 2) el.scrollLeft -= singleWidth;
    else if (el.scrollLeft <= 0) el.scrollLeft += singleWidth;
  };

  const scrollByArrow = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    pauseAutoScroll();
    el.scrollBy({ left: direction * ARROW_SCROLL_AMOUNT, behavior: "smooth" });
    scheduleResume();
  };

  if (!hasCategories) return null;

  return (
    <section className="relative overflow-hidden bg-(--surface-alt) py-14">
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          title="Shop by Categories"
          subtitle="Find exactly what you're looking for"
        />
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={pauseAutoScroll}
        onPointerUp={scheduleResume}
        onPointerCancel={scheduleResume}
        onTouchStart={pauseAutoScroll}
        onTouchEnd={scheduleResume}
        style={{ scrollBehavior: "auto" }}
        className="scrollbar-hide relative mx-auto mt-10 flex max-w-6xl gap-4 overflow-x-auto px-4 sm:gap-6 md:gap-8 md:px-8"
      >
        {loopedCategories.map((category, index) => (
          <Link
            key={`${category.id}-${index}`}
            href={`/category/${category.id}`}
            className="group flex w-[32vw] max-w-[130px] shrink-0 flex-col items-center gap-2 text-center sm:w-32 md:w-40"
          >
            <span className="relative block aspect-square w-full overflow-hidden rounded-full border-2 border-(--border-color) shadow-md transition-all duration-300 group-hover:border-(--primary)/50 group-hover:shadow-lg">
              <Image
                src={resolveImageUrl(category.image)}
                alt={category.name}
                fill
                sizes="160px"
                draggable={false}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="font-heading text-sm font-semibold text-(--foreground) transition-colors group-hover:text-(--primary) md:text-base">
              {category.name}
            </span>
            {category.shortDescription && (
              <span className="text-xs text-(--secondary-text) line-clamp-2 max-md:hidden">
                {category.shortDescription}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="relative mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollByArrow(-1)}
          aria-label="Scroll categories left"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--border-color) bg-(--surface) text-(--foreground) shadow-sm transition-all hover:-translate-y-0.5 hover:border-(--primary)/40 hover:shadow-md"
        >
          <FiChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByArrow(1)}
          aria-label="Scroll categories right"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--border-color) bg-(--surface) text-(--foreground) shadow-sm transition-all hover:-translate-y-0.5 hover:border-(--primary)/40 hover:shadow-md"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
