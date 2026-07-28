"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

// Sehat Potli's single themed button. Every button on the storefront should
// go through this component (or AddToCartButton/HeroButton-style wrappers
// that render it) instead of hand-rolling button classes — that's what
// keeps the shine-sweep + lift + arrow treatment consistent everywhere
// without copy-pasting the same utility classes at every call site.
//
// Two core "themed" looks: `primary`/`accent` are filled and get the
// diagonal shine sweep on hover; `outline`/`ghost` are unfilled and just
// invert color + lift. All four share the same hover-lift/press-scale
// physics so the whole site feels like one button language.
const VARIANT_CLASSES = {
  primary:
    "bg-(--btn-primary) text-(--surface) shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 border border-transparent",
  accent:
    "bg-(--accent) text-(--foreground) shadow-md shadow-black/10 border border-transparent hover:shadow-lg hover:shadow-black/20",
  outline:
    "bg-transparent text-(--btn-primary) border-2 border-(--btn-primary) hover:bg-(--btn-primary) hover:text-(--surface)",
  // Same shape as `outline`, but for sitting on dark photo/overlay
  // backgrounds (e.g. the Hero) where a dark-green border would disappear.
  "outline-light":
    "bg-transparent text-white border-2 border-white hover:bg-white hover:text-(--btn-primary)",
  ghost:
    "bg-transparent text-(--foreground) border border-transparent hover:bg-(--surface-alt)",
};

const SHINE_VARIANTS = new Set(["primary", "accent"]);

const SIZE_CLASSES = {
  sm: "px-4 py-1.5 text-sm max-md:px-3 max-md:py-1",
  md: "px-6 py-2.5 text-base max-md:px-4 max-md:py-2 max-md:text-sm",
  lg: "px-8 py-3 text-lg max-md:px-5 max-md:py-2 max-md:text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  url,
  type = "button",
  onClick,
  disabled = false,
  className = "",
  icon: Icon,
  showArrow,
  ...rest
}) {
  const hasShine = SHINE_VARIANTS.has(variant) && !disabled;
  // Only auto-add the trailing arrow when there's no leading icon already —
  // two icons on one button reads as cluttered. Callers can still force it
  // either way with `showArrow`.
  const withArrow = showArrow ?? !Icon;

  const classes = `group relative inline-flex min-w-0 items-center justify-center gap-2 max-md:gap-1.5 overflow-hidden rounded-full font-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary} ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`;

  const content = (
    <>
      {hasShine && (
        <span className="absolute inset-0 z-0 -translate-x-full skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
      {Icon ? (
        <Icon className="relative z-10 shrink-0" />
      ) : null}
      <span className="relative z-10 truncate">{children}</span>
      {withArrow && (
        <FiArrowRight
          className="relative z-10 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          size={size === "sm" ? 14 : 16}
        />
      )}
    </>
  );

  if (url) {
    return (
      <Link href={url} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      {content}
    </button>
  );
}
