// Single themed form field for the whole storefront — every text input,
// textarea, email/tel/password field should go through this instead of a
// raw <input>, so the label always floats above on focus/fill instead of
// vanishing like a placeholder does (that was the actual complaint: once
// you start typing, there was no way to tell what a field was for).
//
// Pure CSS via the peer-placeholder-shown trick — no JS state needed.
// Requires placeholder=" " (a real space, not empty) so :placeholder-shown
// only matches a genuinely empty field.
const VARIANT_CLASSES = {
  // Standard light-surface form field (cards, modals, pages).
  light:
    "rounded-lg border border-(--border-color) bg-(--background) text-(--foreground) focus:border-(--primary)",
  // Glass/pill field for sitting on a dark photo background (e.g. Subscribe & Save).
  dark:
    "rounded-full border border-(--surface)/30 bg-(--surface)/10 text-(--surface) placeholder:text-(--surface)/60 focus:border-(--surface)",
};

const VARIANT_LABEL_CLASSES = {
  light: "text-(--secondary-text) peer-focus:text-(--primary)",
  dark: "text-(--surface)/70 peer-focus:text-(--surface)",
};

export default function FloatingLabelInput({
  label,
  id,
  as = "input",
  variant = "light",
  className = "",
  wrapperClassName = "",
  center = false,
  ...rest
}) {
  const Tag = as;
  const isPill = variant === "dark";

  return (
    <div className={`relative ${wrapperClassName}`}>
      <Tag
        id={id}
        placeholder=" "
        className={`peer w-full px-4 pt-5 pb-2 text-sm outline-none ${VARIANT_CLASSES[variant]} ${as === "textarea" ? "min-h-[110px] resize-none" : ""} ${center ? "text-center tracking-[0.5em]" : ""} ${className}`}
        {...rest}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-all duration-150 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-not-placeholder-shown:top-2.5 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs ${VARIANT_LABEL_CLASSES[variant]} ${isPill ? "left-5" : ""}`}
      >
        {label}
      </label>
    </div>
  );
}
